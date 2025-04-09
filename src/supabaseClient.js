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

// Bookmark functions
// Add a bookmark
export const addBookmark = async (founderData) => {
  try {
    console.log("Adding bookmark for:", founderData);
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Extract essential data to store in the bookmark
    const bookmarkData = {
      user_id: user.id,
      founder_id: founderData.id || `${founderData.firstName}-${founderData.lastName}`,
      founder_data: {
        name: `${founderData.firstName} ${founderData.lastName}`,
        company: founderData.companyName,
        headline: founderData.linkedinHeadline,
        industry: founderData.companyIndustry,
        location: founderData.location,
        college: founderData.college,
        linkedinUrl: founderData.linkedinProfileUrl,
        wellFoundUrl: founderData.wellFoundProfileURL,
        linkedinDescription: founderData.linkedinDescription,
        linkedinJobTitle: founderData.linkedinJobTitle,
        linkedinJobLocation: founderData.linkedinJobLocation,
        linkedinJobDescription: founderData.linkedinJobDescription,
        linkedinSkillsLabel: founderData.linkedinSkillsLabel
      },
      notes: ''
    };

    console.log("Inserting bookmark data:", bookmarkData);
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([bookmarkData])
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Successfully added bookmark:", data);
    return { data, error: null };
  } catch (error) {
    console.error('Error adding bookmark:', error.message);
    return { data: null, error };
  }
};

// Remove a bookmark
export const removeBookmark = async (founderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .match({ user_id: user.id, founder_id: founderId });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing bookmark:', error.message);
    return { error };
  }
};

// Check if a profile is bookmarked
export const isProfileBookmarked = async (founderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { isBookmarked: false, error: null };

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .match({ user_id: user.id, founder_id: founderId })
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
    
    return { isBookmarked: !!data, error: null };
  } catch (error) {
    console.error('Error checking bookmark status:', error.message);
    return { isBookmarked: false, error };
  }
};

// Get all bookmarks for current user
export const getUserBookmarks = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log("Fetching bookmarks for user:", user.id);

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .match({ user_id: user.id })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Retrieved bookmarks:", data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching bookmarks:', error.message);
    return { data: null, error };
  }
};
