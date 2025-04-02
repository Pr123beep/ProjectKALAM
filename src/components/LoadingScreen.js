import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onFinished }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prevProgress => {
        const newProgress = prevProgress + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 400);
    
    const timer = setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(onFinished, 1000); 
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinished]);
  
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-animation-container">
          {/* UC Logo */}
          <div className="animated-logo uc-logo-container">
            <img 
              src="/uc.png" 
              alt="Undivided Capital" 
              className="animated-logo-img uc-logo"
            />
            <div className="logo-glow uc-glow"></div>
          </div>
          
          <div className="logo-connection">
            <div className="connection-line"></div>
            <div className="connection-pulse"></div>
          </div>
          
          {/* Scaler Logo */}
          <div className="animated-logo scaler-logo-container">
            <img 
              src="/scaler.png" 
              alt="Scaler" 
              className="animated-logo-img scaler-logo"
            />
            <div className="logo-glow scaler-glow"></div>
          </div>
        </div>
        
        <div className="loading-text">
          <h2>Preparing Your Experience</h2>
          <p>Connecting exceptional founders with data insights</p>
        </div>
        
        <div className="loading-bar-container">
          <div 
            className="loading-bar-progress" 
            style={{ width: `${loadingProgress}%` }}
          ></div>
          <div className="loading-percentage">{Math.round(loadingProgress)}%</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 