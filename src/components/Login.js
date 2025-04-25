// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmail, resetPassword, signInWithGoogle } from '../supabaseClient';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // ← feather icons
import './Auth.css';

// Official Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [blink, setBlink]         = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');

    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // No need to call onLoginSuccess here as the OAuth flow will redirect to the main page
    } catch (error) {
      setErrorMsg(error.message || 'Error signing in with Google');
      setIsGoogleLoading(false);
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

            <div className="form-group password-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
                        <button
    type="button"
    className={`password-toggle${blink ? ' blink' : ''}`}
    onClick={() => {
      // trigger blink
      setBlink(true);
      // flip visibility
      setShowPassword(v => !v);
      // remove blink class after animation
      setTimeout(() => setBlink(false), 300);
    }}
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    {showPassword ? <FiEyeOff /> : <FiEye />}
  </button>

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

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-auth-button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              <GoogleIcon />
              <span>{isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
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
