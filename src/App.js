// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import MainPage from "./MainPage"; // your existing main page with FilterBar and StartupCard
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/main");
  };
  return <LandingPage onNavigate={handleNavigate} />;
}

export default App;
