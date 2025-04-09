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
          <Link to="/main">InvestM</Link>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/main" 
            className={location.pathname === '/main' ? 'active' : ''}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/bookmarks" 
            className={location.pathname === '/bookmarks' ? 'active' : ''}
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
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Bookmarks
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