import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ZoomMeeting.css";

const ZoomMeeting = () => {
  const navigate = useNavigate();
  const [meetingNumber, setMeetingNumber] = useState(
    localStorage.getItem("zoom_prefilled_id") || ""
  );
  const [password, setPassword] = useState(
    localStorage.getItem("zoom_prefilled_pwd") || ""
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("zoom_username") || "MeetAI Guest"
  );
  const [role, setRole] = useState(0); // 0 = Participant, 1 = Host
  const [userEmail, setUserEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, active, error
  const [errorMsg, setErrorMsg] = useState("");
  const [meetingClient, setMeetingClient] = useState(null);

  useEffect(() => {
    // Clear prefilled credentials so they are single-use
    localStorage.removeItem("zoom_prefilled_id");
    localStorage.removeItem("zoom_prefilled_pwd");

    return () => {
      // Cleanup dynamically injected elements on unmount
      cleanupZoomSDK();
    };
  }, []);

  const loadZoomSDK = () => {
    return new Promise(async (resolve, reject) => {
      if (window.ZoomMtgEmbedded) {
        resolve(window.ZoomMtgEmbedded);
        return;
      }

      try {
        // Append React Select Stylesheet
        if (!document.getElementById("zoom-react-select")) {
          const selectStyle = document.createElement("link");
          selectStyle.id = "zoom-react-select";
          selectStyle.rel = "stylesheet";
          selectStyle.href = "https://source.zoom.us/3.1.6/css/react-select.css";
          document.head.appendChild(selectStyle);
        }

        // Helper to dynamically load script in order
        const loadScript = (id, src) => {
          return new Promise((res, rej) => {
            if (document.getElementById(id)) {
              res();
              return;
            }
            const s = document.createElement("script");
            s.id = id;
            s.src = src;
            s.async = true;
            s.onload = res;
            s.onerror = () => rej(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(s);
          });
        };

        // Load all required Zoom SDK CDN dependencies sequentially to build a React 18 sandbox
        await loadScript("zoom-react", "https://source.zoom.us/3.1.6/lib/vendor/react.min.js");
        await loadScript("zoom-react-dom", "https://source.zoom.us/3.1.6/lib/vendor/react-dom.min.js");
        await loadScript("zoom-redux", "https://source.zoom.us/3.1.6/lib/vendor/redux.min.js");
        await loadScript("zoom-redux-thunk", "https://source.zoom.us/3.1.6/lib/vendor/redux-thunk.min.js");
        await loadScript("zoom-lodash", "https://source.zoom.us/3.1.6/lib/vendor/lodash.min.js");
        
        // Finally load the core Zoom Meeting Embedded SDK script
        await loadScript("zoom-embedded-script", "https://source.zoom.us/3.1.6/lib/zoom-meeting-embedded-3.1.6.min.js");

        if (window.ZoomMtgEmbedded) {
          resolve(window.ZoomMtgEmbedded);
        } else {
          reject(new Error("Failed to initialize ZoomMtgEmbedded global object"));
        }
      } catch (err) {
        reject(new Error(err.message || "Failed to load Zoom SDK dependencies"));
      }
    });
  };

  const cleanupZoomSDK = () => {
    const ids = [
      "zoom-react-select",
      "zoom-react",
      "zoom-react-dom",
      "zoom-redux",
      "zoom-redux-thunk",
      "zoom-lodash",
      "zoom-embedded-script"
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!meetingNumber) {
      setErrorMsg("Meeting Number is required.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    localStorage.setItem("zoom_username", userName);

    try {
      // 1. Fetch signature from Node backend
      const response = await axios.post("http://localhost:3000/zoom-signature", {
        meetingNumber,
        role: Number(role),
      });

      const { signature, sdkKey } = response.data;

      // 2. Load Zoom SDK CDN sequentially
      const ZoomMtgEmbedded = await loadZoomSDK();

      // 3. Create client
      const client = ZoomMtgEmbedded.createClient();
      setMeetingClient(client);

      // 4. Initialize client
      const meetingSDKElement = document.getElementById("meetingSDKElement");
      await client.init({
        zoomAppRoot: meetingSDKElement,
        language: "en-US",
        assetPath: "https://source.zoom.us/3.1.6/lib/av", // Points to stable AV webassembly assets
        patchJsMedia: true,
        leaveUrl: window.location.origin + "/dashboard"
      });

      // 5. Join meeting
      await client.join({
        signature,
        sdkKey,
        meetingNumber,
        password,
        userName,
        userEmail: userEmail || "guest@meetai.com",
      });

      setStatus("active");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(
        err.response?.data?.error ||
        err.message ||
        "An error occurred while connecting to the meeting."
      );
      cleanupZoomSDK();
      setMeetingClient(null);
    }
  };

  const handleLeave = async () => {
    if (meetingClient) {
      try {
        await meetingClient.leave();
      } catch (err) {
        console.error("Error leaving meeting:", err);
      }
    }
    cleanupZoomSDK();
    setStatus("idle");
    setMeetingClient(null);
  };

  return (
    <div className="zoom-meeting-page">
      <div className="zoom-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="app-logo">MeetAi <span>Zoom Integration</span></div>
      </div>

      {status !== "active" && (
        <div className="zoom-container">
          <div className="zoom-card glassmorphism">
            <h2>Connect to a Zoom Meeting</h2>
            <p className="subtitle">
              Experience dynamic AI transcription, summarizing, and emotion metrics inside Zoom.
            </p>

            {status === "loading" && (
              <div className="loader-container">
                <div className="spinner"></div>
                <p>Generating SDK Signature & Connecting to Zoom servers...</p>
              </div>
            )}

            {status === "error" && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span> {errorMsg}
              </div>
            )}

            {status !== "loading" && (
              <form onSubmit={handleJoin} className="zoom-form">
                <div className="form-group">
                  <label htmlFor="meetingNumber">Meeting ID (Number)</label>
                  <input
                    id="meetingNumber"
                    type="text"
                    placeholder="e.g. 81234567890"
                    value={meetingNumber}
                    onChange={(e) => setMeetingNumber(e.target.value.replace(/\s+/g, ""))}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="password">Passcode / Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Meeting Passcode"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group half">
                    <label htmlFor="role">Your Role</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(Number(e.target.value))}
                    >
                      <option value={0}>Participant</option>
                      <option value={1}>Host</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userName">Display Name</label>
                  <input
                    id="userName"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="userEmail">Email Address (Optional)</label>
                  <input
                    id="userEmail"
                    type="email"
                    placeholder="alex@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="join-btn btn-primary">
                  Connect & Join Meeting
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* This element will host the embedded Zoom meeting */}
      <div
        id="meetingSDKElement"
        className={`zoom-meeting-element ${status === "active" ? "visible" : "hidden"}`}
      ></div>

      {status === "active" && (
        <div className="active-meeting-overlay">
          <div className="meeting-controls-panel glassmorphism">
            <div className="meeting-indicator">
              <span className="pulse-dot"></span>
              Connected to Meeting: {meetingNumber}
            </div>
            <button className="leave-btn" onClick={handleLeave}>
              Disconnect / Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomMeeting;
