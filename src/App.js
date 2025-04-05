// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import Login from './components/Login';
import Register from './components/Register';
import LoadingScreen from './components/LoadingScreen';
import { supabase } from './supabaseClient';
import './App.css';

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    
    getUser();
  }, []);
  
  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSessionAndSetUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Preload assets
      const preloadImages = () => {
        const imageUrls = ['/uc.png', '/scaler.png'];
        imageUrls.forEach(url => {
          const img = new Image();
          img.src = url;
        });
      };
      
      preloadImages();
      setIsLoading(false);
    };

    getSessionAndSetUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Supabase auth event: ${event}`);
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen onFinished={() => setIsLoading(false)} />
      ) : (
        <Router>
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/main" replace /> : <Login onLoginSuccess={handleAuthSuccess} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/main" replace /> : <Register onRegisterSuccess={handleAuthSuccess} />
            } />
            <Route path="/" element={
              <LandingRoute />
            } />
            <Route path="/main" element={
              <ProtectedRoute>
                <MainPage user={user} />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/login");
  };
  return <LandingPage onNavigate={handleNavigate} />;
}

export default App;
