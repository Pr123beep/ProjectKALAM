// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://unsrgtbkqnneplscdkaq.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuc3JndGJrcW5uZXBsc2Nka2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODQ4NDksImV4cCI6MjA1OTM2MDg0OX0.-fdqZhDP6AMbh4yN0ETFZ_L7SrF6lOqkv04UeQV_XpY';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'decontaminators-auth-storage-key',
    detectSessionInUrl: true
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
