import React, { useState, useEffect } from 'react';
import { markProfileAsSeen, markProfileAsUnseen, isProfileSeen } from '../supabaseClient';
import './SeenButton.css'; // We'll create this next

const SeenButton = ({ founderData, onSeenChange }) => {
  const [isSeen, setIsSeen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seenAt, setSeenAt] = useState(null);
  
  // Generate a consistent ID from founder data
  const founderId = founderData.id || `${founderData.firstName}-${founderData.lastName}`;

  useEffect(() => {
    // Check if this profile is seen when component mounts
    const checkSeenStatus = async () => {
      if (!founderId) return;
      
      try {
        const { isSeen, seenAt, error } = await isProfileSeen(founderId);
        if (error) throw error;
        setIsSeen(isSeen);
        setSeenAt(seenAt);
      } catch (error) {
        console.error('Error checking seen status:', error);
      }
    };

    checkSeenStatus();
  }, [founderId]);

  const handleToggleSeen = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isSeen) {
        await markProfileAsUnseen(founderId);
      } else {
        await markProfileAsSeen(founderData);
      }
      
      // Toggle state and trigger parent callback
      setIsSeen(!isSeen);
      if (onSeenChange) {
        onSeenChange(!isSeen);
      }
    } catch (error) {
      console.error('Error toggling seen status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format the seen date if available
  const formatSeenDate = () => {
    if (!seenAt) return '';
    const date = new Date(seenAt);
    
    // If it's today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <button 
      className={`seen-button ${isSeen ? 'seen' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={handleToggleSeen}
      disabled={isLoading}
      aria-label={isSeen ? "Mark as unseen" : "Mark as seen"}
      title={isSeen ? `Seen ${formatSeenDate()}` : "Mark as seen"}
    >
      <svg 
        className="seen-icon" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      {isSeen && <span className="seen-indicator"></span>}
    </button>
  );
};

export default SeenButton; 