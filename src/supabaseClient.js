// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://unsrgtbkqnneplscdkaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc3JndGJrcW5uZXBsc2Nka2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODQ4NDksImV4cCI6MjA1OTM2MDg0OX0.-fdqZhDP6AMbh4yN0ETFZ_L7SrF6lOqkv04UeQV_XpY';

// Determine the site URL for redirects (works in both dev and production)
const getSiteUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, use the configured URL
  let url = process.env.REACT_APP_SITE_URL || 'https://investm.netlify.app/';
  console.log('Production URL:', url);
  // Remove trailing slash if it exists
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'decontaminators-auth-storage-key',
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow for added security
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }
};

// Helper function to sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error.message);
    return false;
  }
};

// Login with redirect support
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        redirectTo: `${getSiteUrl()}/main`
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { data: null, error };
  }
};

// Register with redirect support
export const signUpWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        redirectTo: `${getSiteUrl()}/main`
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { data: null, error };
  }
};

// Password reset functionality
export const resetPassword = async (email) => {
  try {
    // Make sure we're specifying this is a recovery flow by appending a type parameter
    const redirectUrl = `${getSiteUrl()}/reset-password#type=recovery`;
    console.log("Reset password redirect URL:", redirectUrl);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error.message);
    return { data: null, error };
  }
};

// Update password when user clicks the reset link
export const updatePassword = async (newPassword) => {
  try {
    console.log("Updating password...");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error("Error in updatePassword:", error);
      throw error;
    }
    
    console.log("Password updated successfully:", data);
    return { data, error: null };
  } catch (error) {
    console.error('Error updating password:', error.message);
    return { data: null, error };
  }
};
