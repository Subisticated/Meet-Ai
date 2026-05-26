import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Summarizer.css";

const Summarizer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, processing, done, error
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load local history for a rich experience
    const saved = localStorage.getItem("meetai_summaries");
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      // Seed initial premium content for demonstration
      const initialHistory = [
        {
          id: 1,
          title: "Project Alpha Kickoff - May 24, 2026",
          transcript: "Speaker 1: Hi everyone, let's get started on Project Alpha. We need to complete the UI mocks by Friday and have the backend schema ready by Wednesday. Speaker 2: Yes, I will take care of the backend schema. Speaker 1: Great, and Sarah will manage the Figma mockups.",
          summary: "• **Overview**: Official kickoff meeting for Project Alpha.\n• **Decisions**: UI mocks assigned to Sarah; Backend schemas assigned to Speaker 2.\n• **Deadlines**: Schema draft due by Wednesday; Figma UI design review set for Friday.\n• **Status**: Saved to Notion Database successfully.",
          date: "2026-05-24"
        },
        {
          id: 2,
          title: "SRE Recovery Sync - May 25, 2026",
          transcript: "Speaker 1: The database latency was high yesterday due to a missing index on the logs table. Speaker 2: I added the index and now queries have dropped from 2.5 seconds to 12ms. Speaker 1: Excellent. Let's set up an alert for next time.",
          summary: "• **Incident Summary**: Latency spike detected on logs table.\n• **Action Taken**: Added missing database query index.\n• **Performance Improvement**: Query response times dropped from 2.5s to 12ms.\n• **Next Steps**: Set up automated Prometheus alert thresholds.",
          date: "2026-05-25"
        }
      ];
      setHistory(initialHistory);
      localStorage.setItem("meetai_summaries", JSON.stringify(initialHistory));
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select an audio file to summarize.");
      return;
    }

    setStatus("uploading");
    setProgressMsg("Uploading meeting audio to server...");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      // 1. Upload audio to Node.js backend (handles Whisper transcription + Cohere summarization)
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgressMsg(`Uploading: ${percent}%...`);
          if (percent === 100) {
            setStatus("processing");
            setProgressMsg("Audio uploaded! Processing Whisper transcription & AI summarization...");
          }
        }
      });

      const { transcript, summary } = response.data;
      const newResult = {
        id: Date.now(),
        title: `Meeting - ${new Date().toLocaleDateString()}`,
        transcript,
        summary,
        date: new Date().toISOString().split('T')[0]
      };

      setResult(newResult);
      setStatus("done");

      // Update history list
      const updatedHistory = [newResult, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("meetai_summaries", JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(
        err.response?.data?.error || 
        err.message || 
        "Summarization failed. Please verify your Python & API keys are configured."
      );
    }
  };

  const handleSelectHistory = (item) => {
    setResult(item);
    setStatus("done");
  };

  return (
    <div className="summarizer-page">
      <div className="summarizer-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="app-logo">MeetAi <span>Meeting Summarizer</span></div>
      </div>

      <div className="summarizer-body">
        {/* Left pane: Upload & History */}
        <div className="left-panel glassmorphism">
          <h3>Upload Recording</h3>
          <p className="description">Upload your meeting recording file (MP3, WAV) to transcribe and summarize using AI.</p>
          
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-dropzone">
              <input 
                type="file" 
                id="audio-file" 
                accept="audio/*" 
                onChange={handleFileChange} 
              />
              <label htmlFor="audio-file">
                <span className="upload-icon">🎵</span>
                <span className="file-name">{file ? file.name : "Choose audio recording..."}</span>
              </label>
            </div>
            
            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            <button 
              type="submit" 
              className="action-btn btn-primary"
              disabled={status === "uploading" || status === "processing"}
            >
              {status === "uploading" || status === "processing" ? "Processing..." : "Generate AI Summary"}
            </button>
          </form>

          {/* Loader */}
          {(status === "uploading" || status === "processing") && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>{progressMsg}</p>
            </div>
          )}

          {/* History */}
          <div className="history-section">
            <h4>Past Summary Logs</h4>
            <div className="history-list">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className={`history-card ${result && result.id === item.id ? "active" : ""}`}
                  onClick={() => handleSelectHistory(item)}
                >
                  <div className="history-icon">📄</div>
                  <div className="history-info">
                    <h5>{item.title}</h5>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: AI Output Content */}
        <div className="right-panel glassmorphism">
          {status === "done" && result ? (
            <div className="result-container animate-fade-in">
              <div className="result-header">
                <h2>{result.title}</h2>
                <div className="success-badge">✍️ Saved to Notion Database</div>
              </div>

              <div className="result-grid">
                <div className="result-box scrollable">
                  <h3>📝 Audio Transcript</h3>
                  <div className="transcript-content">
                    <p>{result.transcript}</p>
                  </div>
                </div>

                <div className="result-box scrollable">
                  <h3>🤖 AI Summary & Minutes</h3>
                  <div className="summary-content">
                    {result.summary.split('\n').map((line, idx) => (
                      <p key={idx} style={{ 
                        marginLeft: line.trim().startsWith('•') ? '15px' : '0px',
                        fontWeight: line.trim().startsWith('•') ? 'normal' : '500'
                      }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder-box">
              <div className="placeholder-icon">🤖</div>
              <h2>AI Summarizer Lounge</h2>
              <p>Upload a recording or select an item from past summaries to view the transcribed meeting text and AI-generated minutes of the meeting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
