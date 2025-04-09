import React, { useState, useEffect } from 'react';
import { getUserBookmarks, removeBookmark } from '../supabaseClient';
import './BookmarksPage.css';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // When profile modal is open, prevent background scrolling
  useEffect(() => {
    if (selectedProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedProfile]);

  const fetchBookmarks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getUserBookmarks();
      
      if (error) throw error;
      
      console.log("BookmarksPage received data:", data);
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (founderId) => {
    try {
      await removeBookmark(founderId);
      // Remove from UI immediately
      setBookmarks(bookmarks.filter(bookmark => bookmark.founder_id !== founderId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
  };

  // Render the full profile modal
  const renderProfileModal = () => {
    if (!selectedProfile) return null;

    const { founder_data: profile } = selectedProfile;

    return (
      <div className="profile-modal-overlay" onClick={closeProfileModal}>
        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="profile-modal-close" onClick={closeProfileModal}>×</button>
          
          <div className="profile-modal-header">
            <h2 className="profile-modal-name">{profile.name}</h2>
            {profile.headline && <p className="profile-modal-headline">{profile.headline}</p>}
          </div>
          
          <div className="profile-modal-body">
            <div className="profile-modal-section">
              <h3 className="profile-modal-section-title">Company</h3>
              <p>{profile.company || 'Not specified'}</p>
              {profile.industry && (
                <div className="profile-modal-industry">
                  <span>Industry:</span> {profile.industry}
                </div>
              )}
            </div>
            
            {profile.linkedinDescription && (
              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">About</h3>
                <p className="profile-modal-description">{profile.linkedinDescription}</p>
              </div>
            )}
            
            {profile.linkedinJobTitle && (
              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">Current Position</h3>
                <div className="profile-modal-job">
                  <p className="profile-modal-job-title">{profile.linkedinJobTitle}</p>
                  {profile.linkedinJobLocation && <p className="profile-modal-job-location">{profile.linkedinJobLocation}</p>}
                  {profile.linkedinJobDescription && <p className="profile-modal-job-description">{profile.linkedinJobDescription}</p>}
                </div>
              </div>
            )}
            
            {profile.linkedinSkillsLabel && (
              <div className="profile-modal-section">
                <h3 className="profile-modal-section-title">Skills</h3>
                <p className="profile-modal-skills">{profile.linkedinSkillsLabel}</p>
              </div>
            )}
            
            <div className="profile-modal-section">
              <h3 className="profile-modal-section-title">Contact & Links</h3>
              <div className="profile-modal-links">
                {profile.linkedinUrl && (
                  <a 
                    href={profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-modal-link linkedin"
                  >
                    LinkedIn Profile
                  </a>
                )}
                
                {profile.wellFoundUrl && (
                  <a 
                    href={profile.wellFoundUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-modal-link wellfound"
                  >
                    Wellfound Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bookmarks-container">
        <h2 className="bookmarks-title">My Bookmarks</h2>
        <div className="bookmarks-loading">Loading bookmarks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-container">
        <h2 className="bookmarks-title">My Bookmarks</h2>
        <div className="bookmarks-error">{error}</div>
        <button className="bookmarks-retry-button" onClick={fetchBookmarks}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bookmarks-container">
      <h2 className="bookmarks-title">My Bookmarks</h2>
      
      {bookmarks.length === 0 ? (
        <div className="bookmarks-empty">
          <p>You haven't bookmarked any profiles yet.</p>
          <p>Browse through investment profiles and click the bookmark icon to save them here.</p>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map(bookmark => {
            const founderData = bookmark.founder_data || {};
            
            return (
              <div key={bookmark.id} className="bookmark-card">
                <div className="bookmark-card-content">
                  <h3 className="bookmark-profile-name">{founderData.name || 'Unnamed Founder'}</h3>
                  
                  <div className="bookmark-profile-details">
                    {founderData.company && (
                      <span className="bookmark-profile-company">{founderData.company}</span>
                    )}
                    
                    {founderData.industry && (
                      <span className="bookmark-profile-sector">{founderData.industry}</span>
                    )}
                  </div>
                  
                  {founderData.headline && (
                    <p className="bookmark-headline">{founderData.headline}</p>
                  )}
                  
                  {bookmark.notes && (
                    <p className="bookmark-notes">{bookmark.notes}</p>
                  )}
                  
                  <div className="bookmark-date">
                    Bookmarked on {new Date(bookmark.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bookmark-actions">
                  <button 
                    className="bookmark-view-button"
                    onClick={() => openProfileModal(bookmark)}
                  >
                    View Full Profile
                  </button>
                  
                  {founderData.linkedinUrl && (
                    <a 
                      href={founderData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-linkedin-button"
                    >
                      LinkedIn
                    </a>
                  )}
                  
                  <button 
                    className="bookmark-remove-button"
                    onClick={() => handleRemoveBookmark(bookmark.founder_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Render the profile modal when a profile is selected */}
      {renderProfileModal()}
    </div>
  );
};

export default BookmarksPage;