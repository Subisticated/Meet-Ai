import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MeetAttendance.css";

const MeetAttendance = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [emotionStatus, setEmotionStatus] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Seed initial robust participant logs for premium experience
    const initialParticipants = [
      { id: 1, name: "Liam Thompson", role: "Host", joinTime: "10:01 AM", speakingTime: "12m 40s", engagement: 95, status: "Active" },
      { id: 2, name: "Sophia Martinez", role: "Participant", joinTime: "10:03 AM", speakingTime: "4m 15s", engagement: 88, status: "Active" },
      { id: 3, name: "Noah Carter", role: "Participant", joinTime: "10:05 AM", speakingTime: "6m 20s", engagement: 72, status: "Active" },
      { id: 4, name: "Emma Watson", role: "Participant", joinTime: "10:02 AM", speakingTime: "0m 45s", engagement: 91, status: "Away" },
      { id: 5, name: "Oliver Davis", role: "Participant", joinTime: "10:11 AM", speakingTime: "2m 10s", engagement: 64, status: "Active" }
    ];
    setParticipants(initialParticipants);
  }, []);

  const handleToggleEmotion = async () => {
    try {
      const response = await axios.post("http://localhost:3000/toggle-emotion-recognition");
      setEmotionStatus(response.data.status);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the backend emotion toggle service.");
    }
  };

  const handleRunAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisResult("");
    setErrorMsg("");

    try {
      // First ensure emotion recognition is enabled in backend if it's currently disabled
      if (!emotionStatus) {
        const toggleResponse = await axios.post("http://localhost:3000/toggle-emotion-recognition");
        setEmotionStatus(toggleResponse.data.status);
      }

      // Execute real-time Pose & Emotion recognition script (main.py) via backend
      const response = await axios.post("http://localhost:3000/analyze");
      setAnalysisResult(response.data.analysis || "No pose/emotion patterns detected.");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error || 
        err.message || 
        "Analysis engine could not be launched. Ensure 'main.py' is placed in your backend folder."
      );
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="app-logo">MeetAi <span>Attendance & Analytics</span></div>
      </div>

      <div className="attendance-body">
        {/* Left Side: Participant List */}
        <div className="attendance-left glassmorphism">
          <div className="section-title-row">
            <h3>Active Participant Insights</h3>
            <span className="live-pill">🔴 LIVE</span>
          </div>
          
          <div className="stats-cards-row">
            <div className="stat-mini-card">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">5</span>
            </div>
            <div className="stat-mini-card">
              <span className="stat-label">Avg Engagement</span>
              <span className="stat-value">82%</span>
            </div>
            <div className="stat-mini-card">
              <span className="stat-label">Active Speaking</span>
              <span className="stat-value">26m</span>
            </div>
          </div>

          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Role</th>
                  <th>Join Time</th>
                  <th>Speaking Time</th>
                  <th>Engagement</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name-cell">
                      <div className="avatar">{user.name.charAt(0)}</div>
                      {user.name}
                    </td>
                    <td>{user.role}</td>
                    <td>{user.joinTime}</td>
                    <td>{user.speakingTime}</td>
                    <td>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${user.engagement}%`,
                            backgroundColor: user.engagement > 85 ? "#10b981" : user.engagement > 70 ? "#3b82f6" : "#f59e0b"
                          }}
                        ></div>
                        <span>{user.engagement}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: AI Computer Vision Emotion & Pose Analysis */}
        <div className="attendance-right glassmorphism">
          <h3>Computer Vision AI Engine</h3>
          <p className="description">
            Tap directly into MeetAi's real-time OpenCV Python framework. Turn on emotion recognition to launch local cameras or analyze streams to track live smiles, posture, and active focus.
          </p>

          <div className="engine-controls">
            <div className="toggle-container">
              <span>Emotion Recognition:</span>
              <button 
                className={`toggle-btn ${emotionStatus ? "on" : "off"}`}
                onClick={handleToggleEmotion}
              >
                {emotionStatus ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <button 
              className="action-btn btn-primary run-engine-btn" 
              onClick={handleRunAnalysis}
              disabled={isLoadingAnalysis}
            >
              {isLoadingAnalysis ? "Connecting to Python Engine..." : "⚡ Run Pose & Emotion Analysis"}
            </button>
          </div>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          {/* Analysis Result Screen */}
          <div className="analysis-terminal scrollable">
            <h4>📟 Local Terminal Feed</h4>
            
            {isLoadingAnalysis && (
              <div className="terminal-loader">
                <div className="spinner"></div>
                <p>Initializing OpenCV window, compiling frame neural networks...</p>
              </div>
            )}

            {!isLoadingAnalysis && analysisResult && (
              <div className="terminal-output animate-fade-in">
                <pre>{analysisResult}</pre>
              </div>
            )}

            {!isLoadingAnalysis && !analysisResult && !errorMsg && (
              <div className="terminal-placeholder">
                <span className="terminal-icon">💻</span>
                <p>Awaiting trigger signal. Press the Pose & Emotion button above to boot up MeetAi's visual analysis script.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetAttendance;
