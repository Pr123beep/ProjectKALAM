// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://unsrgtbkqnneplscdkaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc3JndGJrcW5uZXBsc2Nka2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODQ4NDksImV4cCI6MjA1OTM2MDg0OX0.-fdqZhDP6AMbh4yN0ETFZ_L7SrF6lOqkv04UeQV_XpY';

// Determine the site URL for redirects (works in both dev and production)
const getSiteUrl = () => {
  // Always use the production URL for authentication redirects
  const productionUrl = 'https://investm.netlify.app';
  
  // Only use development URL if explicitly set via process.env or not in development mode
  if (process.env.NODE_ENV !== 'development') {
    // In production, try to use the environment variable if available
    if (process.env.REACT_APP_SITE_URL) {
      const url = process.env.REACT_APP_SITE_URL;
      // Remove trailing slash if it exists
      const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      console.log('Using site URL from environment variable:', formattedUrl);
      return formattedUrl;
    }
  }
  
  console.log('Using hardcoded production URL for auth redirects:', productionUrl);
  // Remove trailing slash if it exists
  return productionUrl.endsWith('/') ? productionUrl.slice(0, -1) : productionUrl;
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
    const siteUrl = getSiteUrl();
    console.log('Auth redirect URL will be:', `${siteUrl}/main`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        redirectTo: `${siteUrl}/main`
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
    const siteUrl = getSiteUrl();
    console.log('Auth redirect URL will be:', `${siteUrl}/main`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        redirectTo: `${siteUrl}/main`
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { data: null, error };
  }
};
