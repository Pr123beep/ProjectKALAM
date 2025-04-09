import React, { useState, useEffect } from 'react';
import { addBookmark, removeBookmark, isProfileBookmarked } from '../supabaseClient';
import './BookmarkButton.css';

const BookmarkButton = ({ founderData, onBookmarkChange }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Generate a consistent ID from founder data
  const founderId = founderData.id || `${founderData.firstName}-${founderData.lastName}`;

  useEffect(() => {
    // Check if this profile is bookmarked when component mounts
    const checkBookmarkStatus = async () => {
      if (!founderId) return;
      
      try {
        const { isBookmarked, error } = await isProfileBookmarked(founderId);
        if (error) throw error;
        setIsBookmarked(isBookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [founderId]);

  const handleToggleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmark(founderId);
      } else {
        await addBookmark(founderData);
      }
      
      // Toggle state and trigger parent callback
      setIsBookmarked(!isBookmarked);
      if (onBookmarkChange) {
        onBookmarkChange(!isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <svg 
        className="bookmark-icon" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
};

export default BookmarkButton; 