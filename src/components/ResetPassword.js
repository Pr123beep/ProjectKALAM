import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { updatePassword, supabase } from '../supabaseClient';
import './Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("ResetPassword component mounted");
    console.log("Current URL:", window.location.href);
    console.log("Location object:", location);
    
    // Parse the URL to check for the type parameter (to distinguish password reset from normal login)
    const queryParams = new URLSearchParams(location.hash.substring(1));
    const type = queryParams.get('type');
    
    console.log("Auth action type:", type);
    console.log("URL hash:", location.hash);

    // Check if user has a valid recovery token in the URL
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data, error } = await supabase.auth.getSession();
        
        console.log("Session data:", data);
        
        if (error) {
          console.error("Session error:", error);
          setErrorMsg('Invalid or expired password reset link. Please try again.');
          return;
        }
        
        if (data.session) {
          console.log("Session found, user authenticated");
          console.log("Session type:", data.session.user?.aud);
          
          // Check for recovery flow or access token
          const isRecoveryFlow = location.hash.includes('type=recovery') || 
                                data.session.user?.aud === 'recovery';
          
          if (isRecoveryFlow) {
            console.log("Recovery flow detected, showing password reset form");
            setIsAuthenticated(true);
          } else {
            console.log("Not a recovery flow, redirecting to main");
            navigate('/main');
          }
        } else {
          console.log("No session found");
          setErrorMsg('Invalid or expired password reset link. Please try again.');
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setErrorMsg('An error occurred. Please try again.');
      }
    };

    checkSession();
  }, [navigate, location]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    console.log("Password reset form submitted");
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      console.log("Attempting to update password...");
      const { data, error } = await updatePassword(password);
      
      console.log("Password update response:", { data, error });
      
      if (error) {
        throw error;
      }

      console.log("Password updated successfully!");
      setSuccessMsg('Your password has been updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error("Password update error:", error);
      setErrorMsg(error.message || 'Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your new password below</p>
        </div>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        {isAuthenticated ? (
          <form className="auth-form" onSubmit={handlePasswordReset}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">New Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
              />
              <small className="form-hint">Must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div className="auth-footer">
            <p>
              Return to <Link to="/login" className="auth-link">Login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 