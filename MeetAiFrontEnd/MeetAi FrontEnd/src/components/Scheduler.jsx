import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Scheduler.css";

const Scheduler = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAISchedule = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg("Please enter a scheduling prompt.");
      return;
    }

    setIsProcessing(true);
    setScheduleResult(null);
    setErrorMsg("");

    // Simulate AI parsing of natural language prompt
    setTimeout(() => {
      try {
        const text = prompt.toLowerCase();
        let title = "AI Sync Meeting";
        let time = "14:00";
        let platform = "Zoom";
        let attendees = "Team";
        let daysOffset = 0;

        // Simple parser rules
        if (text.includes("sprint")) title = "Sprint Planning Sync";
        else if (text.includes("marketing")) title = "Marketing Sync";
        else if (text.includes("review")) title = "Code Architecture Review";
        else if (text.includes("design")) title = "UI Design Sync";
        else if (text.includes("client")) title = "Client Presentation";

        if (text.includes("tomorrow")) daysOffset = 1;
        else if (text.includes("next week")) daysOffset = 7;
        else if (text.includes("friday")) {
          const currentDay = new Date().getDay();
          daysOffset = currentDay <= 5 ? 5 - currentDay : 12 - currentDay;
        }

        if (text.includes("at 10")) time = "10:00";
        else if (text.includes("at 11")) time = "11:00";
        else if (text.includes("at 1")) time = "13:00";
        else if (text.includes("at 2") || text.includes("2 pm")) time = "14:00";
        else if (text.includes("at 3") || text.includes("3 pm")) time = "15:00";
        else if (text.includes("at 4") || text.includes("4 pm")) time = "16:00";

        if (text.includes("teams")) platform = "Teams";
        else if (text.includes("google") || text.includes("meet")) platform = "Google Meet";

        // Extract attendee names after "with"
        if (text.includes("with ")) {
          const parts = prompt.split(/with /i);
          if (parts.length > 1) {
            attendees = parts[1].replace(/and/gi, ",").trim();
          }
        }

        // Calculate actual meeting date
        const meetingDate = new Date();
        meetingDate.setDate(meetingDate.getDate() + daysOffset);
        
        const year = meetingDate.getFullYear();
        const month = meetingDate.getMonth() + 1; // 1-indexed for keying
        const day = meetingDate.getDate();
        const dateKey = `${year}-${month}-${day}`;
        const displayDate = meetingDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const scheduledEvent = {
          id: Date.now(),
          title,
          time,
          platform,
          attendees,
          dateKey,
          displayDate,
          meetingNumber: "84658910962", // Default pre-fill test meeting
          password: "j5GGp5" // Default pre-fill test passcode
        };

        // Write directly to local storage Calendar meetings database so it's fully synchronized!
        const savedMeetings = localStorage.getItem("meetai_calendar_meetings");
        const meetingsDb = savedMeetings ? JSON.parse(savedMeetings) : {};
        const dateMeetings = meetingsDb[dateKey] || [];
        
        meetingsDb[dateKey] = [...dateMeetings, scheduledEvent];
        localStorage.setItem("meetai_calendar_meetings", JSON.stringify(meetingsDb));

        setScheduleResult(scheduledEvent);
        setIsProcessing(false);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to parse prompt. Please try phrasing it clearly.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleLaunchMeeting = (meeting) => {
    // Navigate straight to Zoom page and carry meeting pre-fills!
    // Since we're navigating programmatically, we can pre-fill using state or just save to localStorage!
    localStorage.setItem("zoom_prefilled_id", meeting.meetingNumber);
    localStorage.setItem("zoom_prefilled_pwd", meeting.password);
    navigate("/zoom-meeting");
  };

  return (
    <div className="scheduler-page">
      <div className="scheduler-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="app-logo">MeetAi <span>AI Scheduler Lounge</span></div>
      </div>

      <div className="scheduler-body">
        <div className="scheduler-card glassmorphism animate-fade-in">
          <h2>Natural Language Scheduling</h2>
          <p className="subtitle">
            Simply talk to MeetAi's planner. Type out details in a single sentence, and watch the SRE planner automatically build meeting invites, schedule rooms, and pre-initialize Zoom signatures.
          </p>

          <form onSubmit={handleAISchedule} className="scheduler-form">
            <div className="form-group">
              <label htmlFor="ai-prompt">What meeting should we plan?</label>
              <textarea
                id="ai-prompt"
                placeholder="e.g. Schedule a UI design sync tomorrow at 3 PM with Jack and Sarah on Zoom"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                required
              />
            </div>

            <button 
              type="submit" 
              className="action-btn btn-primary schedule-submit-btn"
              disabled={isProcessing}
            >
              {isProcessing ? "AI Parsing..." : "✨ Plan Sync Room"}
            </button>
          </form>

          {isProcessing && (
            <div className="scheduler-loader">
              <div className="spinner"></div>
              <p>Cohere reasoning loop processing prompt, allocating calendar slot...</p>
            </div>
          )}

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          {/* Success scheduling result card */}
          {scheduleResult && !isProcessing && (
            <div className="scheduler-result-card glassmorphism animate-fade-in">
              <div className="success-header">
                <span className="success-icon">🚀</span>
                <div>
                  <h4>Meeting Scheduled Successfully!</h4>
                  <span>Syncing with your interactive Calendar agenda</span>
                </div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="label">Topic:</span>
                  <span className="value">{scheduleResult.title}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{scheduleResult.displayDate}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{scheduleResult.time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Attendees:</span>
                  <span className="value">{scheduleResult.attendees}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Platform:</span>
                  <span className="value platform-badge zoom">{scheduleResult.platform}</span>
                </div>
              </div>

              {scheduleResult.platform === "Zoom" && (
                <button 
                  className="action-btn launch-meeting-btn"
                  onClick={() => handleLaunchMeeting(scheduleResult)}
                >
                  ⚡ Launch & Connect Zoom Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
