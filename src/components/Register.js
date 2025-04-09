// src/components/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signUpWithEmail } from '../supabaseClient';
import './Auth.css';

const Register = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    
    try {
      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        throw error;
      }

      if (data?.user?.identities?.length === 0) {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else if (data?.user) {
        setSuccessMsg('Registration successful! Please check your email to confirm your account.');
        // Only call onRegisterSuccess if auto-confirm is enabled in Supabase
        if (!data.session) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 5000);
        } else {
          onRegisterSuccess(data.user);
        }
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Sign up to get started</p>
        </div>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form className="auth-form" onSubmit={handleEmailSignUp}>
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
              minLength="6"
            />
            <small className="form-hint">Must be at least 6 characters</small>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
