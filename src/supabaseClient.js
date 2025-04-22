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

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/main`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error.message);
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

// Labels functions
// Get all labels for current user
export const getUserLabels = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log("Fetching labels for user:", user.id);

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .match({ user_id: user.id })
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Retrieved labels:", data);
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching labels:', error.message);
    return { data: null, error };
  }
};

// Add a label to a profile
export const addLabelToProfile = async (founderData, labelName) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Simple, consistent ID generation
    const founderId = founderData.id || `${founderData.firstName}-${founderData.lastName}`;
    const normalizedFounderId = String(founderId).trim().toLowerCase();

    // Only store essential data to keep the database entry small and fast
    const labelData = {
      user_id: user.id,
      founder_id: normalizedFounderId,
      label_name: labelName.trim(),
      founder_data: {
        name: `${founderData.firstName} ${founderData.lastName}`,
        company: founderData.companyName || '',
        linkedinUrl: founderData.linkedinProfileUrl || ''
      }
    };

    // Use a single, optimized query with returning data
    const { data, error } = await supabase
      .from('labels')
      .insert([labelData])
      .select();
    
    if (error) {
      console.error("Error adding label:", error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error adding label:', error.message);
    return { data: null, error };
  }
};

// Remove a label from a profile
export const removeLabelFromProfile = async (labelId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('labels')
      .delete()
      .match({ id: labelId, user_id: user.id });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing label:', error.message);
    return { error };
  }
};

// Update the label name for a profile
export const updateProfileLabel = async (labelId, newLabelName) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('labels')
      .update({ label_name: newLabelName })
      .match({ id: labelId, user_id: user.id })
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating label:', error.message);
    return { data: null, error };
  }
};

// Get all profiles with a specific label
export const getProfilesByLabel = async (labelName, normalized = false) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id);
    
    // If normalized is true, use case-insensitive matching
    if (normalized) {
      query = query.ilike('label_name', labelName);
    } else {
      // Exact matching (case-sensitive)
      query = query.eq('label_name', labelName);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profiles by label:', error.message);
    return { data: null, error };
  }
};

// Check if a profile has any labels
export const getProfileLabels = async (founderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { labels: [], error: null };

    // Normalize the founderId for consistency
    const normalizedFounderId = String(founderId).trim().toLowerCase();
    
    // Use a simpler, more optimized query with proper indexes
    const { data, error } = await supabase
      .from('labels')
      .select('id, label_name')
      .eq('user_id', user.id)
      .eq('founder_id', normalizedFounderId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching labels:", error);
      throw error;
    }
    
    // Return the data immediately
    return { labels: data || [], error: null };
  } catch (error) {
    console.error('Error checking profile labels:', error.message);
    return { labels: [], error };
  }
};

// Delete all profiles with a specific label name
export const deleteLabelCategory = async (labelName) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all profiles with this label
    const { data: labelsToDelete, error: fetchError } = await supabase
      .from('labels')
      .select('id')
      .match({ user_id: user.id })
      .ilike('label_name', labelName);
    
    if (fetchError) throw fetchError;
    
    if (!labelsToDelete || labelsToDelete.length === 0) {
      // Create an empty label entry to ensure it persists even without profiles
      const { error: insertError } = await supabase
        .from('label_categories')
        .upsert([{
          user_id: user.id,
          label_name: labelName,
          is_empty: true
        }]);
      
      if (insertError) throw insertError;
      return { success: true, error: null };
    }
    
    // Delete all associated labels
    const labelIds = labelsToDelete.map(label => label.id);
    const { error: deleteError } = await supabase
      .from('labels')
      .delete()
      .in('id', labelIds);
    
    if (deleteError) throw deleteError;
    
    // Add an entry to label_categories to make it persist
    const { error: insertError } = await supabase
      .from('label_categories')
      .upsert([{
        user_id: user.id,
        label_name: labelName,
        is_empty: true
      }]);
    
    if (insertError) throw insertError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting label category:', error.message);
    return { success: false, error };
  }
};

// Get all label categories including empty ones
export const getAllLabelCategories = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // First get all labels from the labels table
    const { data: labelData, error: labelError } = await supabase
      .from('labels')
      .select('label_name')
      .eq('user_id', user.id);
    
    if (labelError) throw labelError;
    
    // Get all empty categories
    const { data: emptyCategories, error: emptyCategoriesError } = await supabase
      .from('label_categories')
      .select('label_name')
      .eq('user_id', user.id)
      .eq('is_empty', true);
    
    if (emptyCategoriesError) throw emptyCategoriesError;
    
    // Combine both sets of labels
    const allLabels = [
      ...(labelData || []).map(label => label.label_name),
      ...(emptyCategories || []).map(category => category.label_name)
    ];
    
    // Remove duplicates
    const uniqueLabels = [...new Set(allLabels)];
    
    return { data: uniqueLabels, error: null };
  } catch (error) {
    console.error('Error fetching all label categories:', error.message);
    return { data: [], error };
  }
};

// Seen Profiles functions
// Mark a profile as seen
export const markProfileAsSeen = async (founderData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Extract the founder ID in the same format as bookmarks
    const founderId = founderData.id || `${founderData.firstName}-${founderData.lastName}`;

    const { data, error } = await supabase
      .from('seen_profiles')
      .upsert([{
        user_id: user.id,
        founder_id: founderId,
        seen_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking profile as seen:', error.message);
    return { data: null, error };
  }
};

// Remove a profile from seen list (mark as unseen)
export const markProfileAsUnseen = async (founderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('seen_profiles')
      .delete()
      .match({ user_id: user.id, founder_id: founderId });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking profile as unseen:', error.message);
    return { error };
  }
};

// Check if a profile is marked as seen
export const isProfileSeen = async (founderId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { isSeen: false, error: null };

    const { data, error } = await supabase
      .from('seen_profiles')
      .select('id, seen_at')
      .match({ user_id: user.id, founder_id: founderId })
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
    
    return { isSeen: !!data, seenAt: data?.seen_at, error: null };
  } catch (error) {
    console.error('Error checking seen status:', error.message);
    return { isSeen: false, seenAt: null, error };
  }
};

// Get all seen profiles for current user
export const getUserSeenProfiles = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('seen_profiles')
      .select('founder_id, seen_at')
      .eq('user_id', user.id)
      .order('seen_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting seen profiles:', error.message);
    return { data: null, error };
  }
};
