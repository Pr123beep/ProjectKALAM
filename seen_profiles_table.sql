-- Seen Profiles table
-- This table tracks which profiles a user has seen/viewed
CREATE TABLE seen_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  founder_id TEXT NOT NULL, -- Using the same ID format as bookmarks
  seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure each user can only mark a profile as seen once
  UNIQUE(user_id, founder_id)
);

-- Create index for faster queries
CREATE INDEX seen_profiles_user_id_idx ON seen_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE seen_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only see their own seen profiles
CREATE POLICY "Users can view their own seen profiles"
  ON seen_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to ensure users can only insert their own seen profiles  
CREATE POLICY "Users can insert their own seen profiles"
  ON seen_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to ensure users can only delete their own seen profiles
CREATE POLICY "Users can delete their own seen profiles"
  ON seen_profiles
  FOR DELETE
  USING (auth.uid() = user_id); 