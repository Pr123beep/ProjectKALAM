// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import { copyData } from './copyData';
import { createStructuredData } from './dataUtils'; // import your utility function
import './App.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Process each row using the createStructuredData function
    const processedData = copyData.map(row => createStructuredData(row));
    setData(processedData);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/main" element={<MainPage data={data} />} />
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
