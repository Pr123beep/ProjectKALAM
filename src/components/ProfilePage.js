import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import { supabase } from '../supabaseClient';
import './ProfilePage.css';

const ProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [profileId]);

  const handleBookmarkChange = (isBookmarked) => {
    // Optionally update UI or show a notification when bookmark state changes
    console.log('Bookmark state changed:', isBookmarked);
  };

  if (isLoading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">Loading profile information...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page-container">
        <div className="profile-error">
          {error || 'Profile not found'}
        </div>
        <button 
          className="profile-back-button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-name">{profile.name}</h1>
          
          {profile.title && (
            <p className="profile-title">{profile.title}</p>
          )}
          
          {profile.company && (
            <p className="profile-company">{profile.company}</p>
          )}
        </div>
        
        <div className="profile-actions">
          <BookmarkButton 
            profileId={profileId} 
            onBookmarkChange={handleBookmarkChange}
          />
          
          <button 
            className="profile-back-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
      
      <div className="profile-body">
        <div className="profile-main-content">
          {profile.description && (
            <div className="profile-section">
              <h2 className="profile-section-title">About</h2>
              <p className="profile-description">{profile.description}</p>
            </div>
          )}
          
          {profile.sector && (
            <div className="profile-section">
              <h2 className="profile-section-title">Sector</h2>
              <p className="profile-sector">{profile.sector}</p>
            </div>
          )}
          
          {profile.investment_size && (
            <div className="profile-section">
              <h2 className="profile-section-title">Investment Size</h2>
              <p className="profile-investment">${profile.investment_size.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="profile-sidebar">
          <div className="profile-contact-info">
            {profile.email && (
              <div className="profile-contact-item">
                <span className="contact-label">Email</span>
                <a href={`mailto:${profile.email}`} className="contact-value">{profile.email}</a>
              </div>
            )}
            
            {profile.website && (
              <div className="profile-contact-item">
                <span className="contact-label">Website</span>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="contact-value">
                  {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
            
            {profile.linkedin && (
              <div className="profile-contact-item">
                <span className="contact-label">LinkedIn</span>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-value">
                  View Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 