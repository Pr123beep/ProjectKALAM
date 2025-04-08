// src/index.js
// Log environment variables at startup
console.log("Environment variables at startup:", {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_SITE_URL: process.env.REACT_APP_SITE_URL,
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? "Defined" : "Undefined"
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  
);