import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CalendarView.css";

const CalendarView = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [meetings, setMeetings] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    time: "10:00",
    platform: "Zoom",
    attendees: ""
  });

  // Seed default meetings
  useEffect(() => {
    const saved = localStorage.getItem("meetai_calendar_meetings");
    if (saved) {
      setMeetings(JSON.parse(saved));
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed
      
      const seedMeetings = {
        [`${year}-${month + 1}-12`]: [
          { id: 1, title: "Marketing Sync", time: "11:00", platform: "Zoom", attendees: "Sarah, Jack" },
          { id: 2, title: "Product Review", time: "14:30", platform: "Google Meet", attendees: "David, Liam" }
        ],
        [`${year}-${month + 1}-18`]: [
          { id: 3, title: "Client Pitch", time: "09:00", platform: "Zoom", attendees: "Investor Group" }
        ],
        [`${year}-${month + 1}-25`]: [
          { id: 4, title: "Code Architecture Review", time: "16:00", platform: "Teams", attendees: "Dev Team" }
        ]
      };
      setMeetings(seedMeetings);
      localStorage.setItem("meetai_calendar_meetings", JSON.stringify(seedMeetings));
    }
  }, []);

  // Helper properties
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate days in the current month
  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week index
  const totalDays = new Date(year, month + 1, 0).getDate(); // Number of days in month

  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  const daysArray = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysArray.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateString: `${month === 0 ? year - 1 : year}-${month === 0 ? 12 : month}-${prevMonthTotalDays - i}`
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: true,
      dateString: `${year}-${month + 1}-${i}`
    });
  }

  // Next month padding
  const remainingCells = 42 - daysArray.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      day: i,
      isCurrentMonth: false,
      dateString: `${month === 11 ? year + 1 : year}-${month === 11 ? 1 : month + 2}-${i}`
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDaySelect = (dayObj) => {
    if (dayObj.isCurrentMonth) {
      setSelectedDay(dayObj.day);
    }
  };

  const handleAddMeetingSubmit = (e) => {
    e.preventDefault();
    if (!newMeeting.title) return;

    const dateKey = `${year}-${month + 1}-${selectedDay}`;
    const dateMeetings = meetings[dateKey] || [];
    
    const added = {
      id: Date.now(),
      ...newMeeting
    };

    const updatedMeetings = {
      ...meetings,
      [dateKey]: [...dateMeetings, added]
    };

    setMeetings(updatedMeetings);
    localStorage.setItem("meetai_calendar_meetings", JSON.stringify(updatedMeetings));
    
    // Reset form
    setNewMeeting({
      title: "",
      time: "10:00",
      platform: "Zoom",
      attendees: ""
    });
    setShowAddModal(false);
  };

  const selectedDateKey = `${year}-${month + 1}-${selectedDay}`;
  const dayMeetings = meetings[selectedDateKey] || [];

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="app-logo">MeetAi <span>Interactive Calendar</span></div>
      </div>

      <div className="calendar-body">
        {/* Left Side: Monthly Grid */}
        <div className="calendar-grid-container glassmorphism">
          <div className="calendar-month-selector">
            <button className="nav-arrow" onClick={handlePrevMonth}>◀</button>
            <h2>{monthNames[month]} {year}</h2>
            <button className="nav-arrow" onClick={handleNextMonth}>▶</button>
          </div>

          <div className="calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="calendar-cells">
            {daysArray.map((cell, idx) => {
              const cellMeetings = meetings[cell.dateString] || [];
              const isToday = cell.isCurrentMonth && 
                              cell.day === new Date().getDate() && 
                              month === new Date().getMonth() && 
                              year === new Date().getFullYear();
              const isSelected = cell.isCurrentMonth && cell.day === selectedDay;

              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${cell.isCurrentMonth ? "current" : "padding"} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDaySelect(cell)}
                >
                  <span className="cell-number">{cell.day}</span>
                  <div className="cell-meetings-dots">
                    {cellMeetings.slice(0, 3).map((m) => (
                      <span key={m.id} className={`meeting-dot ${m.platform.toLowerCase().replace(/\s+/g, '-')}`}></span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Agenda Panel */}
        <div className="calendar-agenda-panel glassmorphism">
          {selectedDay ? (
            <div className="agenda-container animate-fade-in">
              <div className="agenda-header">
                <h3>Agenda for {monthNames[month]} {selectedDay}, {year}</h3>
                <button className="add-meeting-btn" onClick={() => setShowAddModal(true)}>+ Schedule</button>
              </div>

              <div className="agenda-list">
                {dayMeetings.length > 0 ? (
                  dayMeetings.map((meeting) => (
                    <div key={meeting.id} className="meeting-agenda-card">
                      <div className="meeting-agenda-time">{meeting.time}</div>
                      <div className="meeting-agenda-details">
                        <h4>{meeting.title}</h4>
                        <p>👥 Attendees: {meeting.attendees || "No invitees"}</p>
                      </div>
                      <span className={`platform-badge ${meeting.platform.toLowerCase().replace(/\s+/g, '-')}`}>
                        {meeting.platform}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-agenda">
                    <span className="empty-icon">☕</span>
                    <p>No meetings scheduled for this day.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="placeholder-box">
              <div className="placeholder-icon">📅</div>
              <h2>Select a Day</h2>
              <p>Click on any day in the monthly calendar grid to view scheduled meetings, invitees, and schedule new meeting rooms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Meeting Modal Dialog */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content glassmorphism animate-fade-in">
            <h3>Schedule Meeting</h3>
            <span className="modal-date">Date: {monthNames[month]} {selectedDay}, {year}</span>
            
            <form onSubmit={handleAddMeetingSubmit} className="modal-form">
              <div className="form-group">
                <label>Meeting Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sales Standup" 
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Time</label>
                  <input 
                    type="time" 
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>Platform</label>
                  <select 
                    value={newMeeting.platform}
                    onChange={(e) => setNewMeeting({...newMeeting, platform: e.target.value})}
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Teams">Teams</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Attendees</label>
                <input 
                  type="text" 
                  placeholder="e.g. Liam, Emma, Mason" 
                  value={newMeeting.attendees}
                  onChange={(e) => setNewMeeting({...newMeeting, attendees: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="action-btn cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="action-btn btn-primary">Schedule Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
