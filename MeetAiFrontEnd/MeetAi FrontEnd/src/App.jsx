import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import Dashboard from "./components/Dashboard";
import ZoomMeeting from "./components/ZoomMeeting";
import Summarizer from "./components/Summarizer";
import CalendarView from "./components/CalendarView";
import MeetAttendance from "./components/MeetAttendance";
import Scheduler from "./components/Scheduler";
import "./components/LoginScreen.css";
import "./components/RegisterScreen.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/features" element={<FeaturesSection />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/zoom-meeting" element={<ZoomMeeting />} />
        <Route path="/summarizer" element={<Summarizer />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/attendance" element={<MeetAttendance />} />
        <Route path="/scheduler" element={<Scheduler />} />
      </Routes>
    </Router>
  );
}

export default App;
