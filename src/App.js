// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Preload essential assets
    const preloadImages = () => {
      const imageUrls = ['/uc.png', '/scaler.png'];
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    preloadImages();
  }, []);
  
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  
  return (
    <>
      {isLoading ? (
        <LoadingScreen onFinished={handleLoadingComplete} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<LandingRoute />} />
            <Route path="/main" element={<MainPage />} />
          </Routes>
        </Router>
      )}
    </>
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
