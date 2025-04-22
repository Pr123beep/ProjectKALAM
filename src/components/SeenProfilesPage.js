import React, { useState, useEffect } from 'react';
import { getUserSeenProfiles } from '../supabaseClient';
import StartupCard from './StartupCard';
import wellfoundData from '../wellfndAndphantom.json';
import './SeenProfilesPage.css';

const SeenProfilesPage = () => {
  const [seenProfiles, setSeenProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    const loadSeenProfiles = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUserSeenProfiles();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Create a map of all founder IDs for faster lookup
          const founderMap = {};
          wellfoundData.forEach(founder => {
            const founderId = founder.id || `${founder.firstName}-${founder.lastName}`;
            founderMap[founderId] = founder;
          });
          
          // Get the full profile data for each seen profile
          const profiles = data.map(item => {
            return {
              ...founderMap[item.founder_id],
              seenAt: new Date(item.seen_at)
            };
          }).filter(profile => profile.firstName || profile.lastName); // Filter out any undefined profiles
          
          setSeenProfiles(profiles);
        } else {
          // No seen profiles
          setSeenProfiles([]);
        }
      } catch (err) {
        console.error('Error loading seen profiles:', err);
        setError('Failed to load seen profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSeenProfiles();
  }, []);
  
  // Function to sort profiles by seen date
  const sortProfiles = () => {
    const sorted = [...seenProfiles];
    sorted.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.seenAt - a.seenAt; // Newest first
      } else {
        return a.seenAt - b.seenAt; // Oldest first
      }
    });
    return sorted;
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };
  
  // Render the sorted profiles
  const sortedProfiles = sortProfiles();
  
  return (
    <div className="seen-profiles-page">
      <div className="seen-profiles-header">
        <h1>Seen Profiles</h1>
        <div className="seen-profiles-controls">
          <button 
            className="sort-button" 
            onClick={toggleSortOrder}
            title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
          >
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading your seen profiles...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : sortedProfiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👁️</div>
          <h2>No seen profiles yet</h2>
          <p>Profiles you mark as seen will appear here.</p>
        </div>
      ) : (
        <div className="seen-profiles-container">
          {sortedProfiles.map((profile, index) => (
            <div className="seen-profile-wrapper" key={`${profile.firstName}-${profile.lastName}-${index}`}>
              <StartupCard data={profile} inSeenProfilesPage={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeenProfilesPage; 