import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1>Welcome to Your Dashboard</h1>
      <div className="dashboard-grid">
        <div 
          className="dashboard-card zoom" 
          onClick={() => navigate("/zoom-meeting")}
          style={{ cursor: "pointer" }}
        >
          <div className="card-badge">New</div>
          <h2>Zoom Meetings</h2>
          <p>
            Connect, host, and join Zoom meetings directly inside your browser with real-time AI capabilities.
          </p>
        </div>
        <div 
          className="dashboard-card summarizer"
          onClick={() => navigate("/summarizer")}
          style={{ cursor: "pointer" }}
        >
          <h2>Summarizer</h2>
          <p>
            Get concise summaries of your meetings with key points and action
            items.
          </p>
        </div>
        <div 
          className="dashboard-card calendar"
          onClick={() => navigate("/calendar")}
          style={{ cursor: "pointer" }}
        >
          <h2>Calendar</h2>
          <p>View and manage your upcoming meetings and events.</p>
        </div>
        <div 
          className="dashboard-card meet-attend"
          onClick={() => navigate("/attendance")}
          style={{ cursor: "pointer" }}
        >
          <h2>Meet Attendance</h2>
          <p>Track participant engagement and attendance in your meetings.</p>
        </div>
        <div 
          className="dashboard-card scheduler"
          onClick={() => navigate("/scheduler")}
          style={{ cursor: "pointer" }}
        >
          <h2>Scheduler</h2>
          <p>Plan and schedule your meetings efficiently with AI assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
