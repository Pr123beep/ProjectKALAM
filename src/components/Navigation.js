import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from '../supabaseClient';
import './Navigation.css';

const Navigation = ({ user }) => {
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };
  
  // Don't show navigation on login, register, or reset password pages
  if (['/login', '/register', '/reset-password', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/main">Kalam</Link>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/main" 
            className={location.pathname === '/main' ? 'active' : ''}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/labels" 
            className={location.pathname === '/labels' ? 'active' : ''}
          >
            <svg 
              className="nav-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 5H2v7l6.29 6.29c.39.39 1.02.39 1.41 0l3.3-3.29c.39-.39.39-1.02 0-1.41L9 10V5z"></path>
              <path d="M16 3h5v5"></path>
              <path d="M21 3l-7 7"></path>
            </svg>
            Labels
          </Link>
          
          <Link 
            to="/seen-profiles" 
            className={location.pathname === '/seen-profiles' ? 'active' : ''}
          >
            <svg 
              className="nav-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Seen Profiles
          </Link>
        </div>
        
        <div className="nav-user">
          {user && (
            <>
              <span className="user-email">{user.email}</span>
              <button className="sign-out-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 