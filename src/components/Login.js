// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmail, resetPassword } from '../supabaseClient';
import './Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        throw error;
      }

      if (data?.user) {
        onLoginSuccess(data.user);
      }
    } catch (error) {
      setErrorMsg(error.message || 'Error signing in with email and password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        throw error;
      }

      setSuccessMsg('Password reset link has been sent to your email');
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
      }, 3000);
    } catch (error) {
      setErrorMsg(error.message || 'Error sending password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showResetModal ? (
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && <div className="auth-success">{successMsg}</div>}

          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="reset-email" className="form-label">Email</label>
              <input
                id="reset-email"
                type="email"
                className="form-input"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={resetLoading}
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button 
              type="button" 
              className="auth-button-secondary"
              onClick={() => {
                setShowResetModal(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              Back to Login
            </button>
          </form>
        </div>
      ) : (
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          <form className="auth-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div className="form-forgot">
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setShowResetModal(true);
                    setResetEmail(email);
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Sign Up</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
