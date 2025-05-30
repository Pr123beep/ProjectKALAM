// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import MainPage from './MainPage';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import LabelsPage from './components/LabelsPage';
import ProfilePage from './components/ProfilePage';
import SeenProfilesPage from './components/SeenProfilesPage';
import Navigation from './components/Navigation';
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

// Allow password reset access even for authenticated users
const ResetPasswordRoute = () => {
  // We don't need location anymore since we're not using it
  // const location = useLocation();
  
  // Always render the ResetPassword component for recovery flows
  return <ResetPassword />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const getSessionAndSetUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Preload assets
      const preloadImages = () => {
        const imageUrls = ['/uc.png', '/scaler.png'];
        let loadedCount = 0;
        
        imageUrls.forEach(url => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            if (loadedCount === imageUrls.length) {
              setAssetsLoaded(true);
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === imageUrls.length) {
              setAssetsLoaded(true);
            }
          };
          img.src = url;
        });
      };
      
      preloadImages();
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

  // Wait for both assets to load and minimum loading time
  useEffect(() => {
    if (assetsLoaded) {
      // Keep showing loading screen for minimum time
      const minLoadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Ensure loading screen shows for at least 2 seconds after assets load
      
      return () => clearTimeout(minLoadingTimer);
    }
  }, [assetsLoaded]);

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen onFinished={() => setIsLoading(false)} />
      ) : (
        <Router>
          <Navigation user={user} />
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/main" replace /> : <Login onLoginSuccess={handleAuthSuccess} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/main" replace /> : <Register onRegisterSuccess={handleAuthSuccess} />
            } />
            <Route path="/reset-password" element={<ResetPasswordRoute />} />
            <Route path="/labels" element={
              <ProtectedRoute>
                <LabelsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:profileId" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/seen-profiles" element={
              <ProtectedRoute>
                <SeenProfilesPage />
              </ProtectedRoute>
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
