import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactDOM from 'react-dom';
import { getUserLabels, getProfilesByLabel, updateProfileLabel, removeLabelFromProfile } from '../supabaseClient';
import LabelButton from './LabelButton';
import './LabelsPage.css';

// Normalize label names to group similar labels
const normalizeLabel = (label) => {
  if (!label) return '';
  
  // Convert to lowercase and trim whitespace
  return label.toLowerCase().trim();
};

// Get a consistent gradient based on the label name
const getLabelGradient = (labelName) => {
  // Array of preset gradients
  const gradients = [
    'linear-gradient(135deg, #FF9D6C, #BB4E75)', // Warm pink/orange
    'linear-gradient(135deg, #6EDCD9, #3279BB)', // Blue/teal
    'linear-gradient(135deg, #58B09C, #1C7C54)', // Green
    'linear-gradient(135deg, #D897EB, #7C3AED)', // Purple
    'linear-gradient(135deg, #FFC75F, #F9484A)', // Yellow/red
    'linear-gradient(135deg, #61C695, #2E8B57)', // Emerald
    'linear-gradient(135deg, #007CF0, #00DFD8)', // Aqua
    'linear-gradient(135deg, #7928CA, #FF0080)', // Magenta
    'linear-gradient(135deg, #FF4D4D, #F9CB28)', // Red/yellow
    'linear-gradient(135deg, #0070F3, #5E60CE)', // Blue/indigo
  ];
  
  // Hash the label name to get a consistent index
  let hashCode = 0;
  for (let i = 0; i < labelName.length; i++) {
    hashCode = ((hashCode << 5) - hashCode) + labelName.charCodeAt(i);
    hashCode = hashCode & hashCode; // Convert to 32bit integer
  }
  
  // Ensure positive index
  hashCode = Math.abs(hashCode);
  
  // Get the gradient using the hash code
  return gradients[hashCode % gradients.length];
};

// Icon components
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CompanyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WellfoundIcon = () => (
  <img 
    src="/wellfound.png" 
    alt="Wellfound" 
    style={{ width: '16px', height: '16px', borderRadius: '2px', verticalAlign: 'middle' }}
  />
);

const LabelsPage = () => {
  const [labels, setLabels] = useState([]);
  const [uniqueLabels, setUniqueLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [profilesByLabel, setProfilesByLabel] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [categoryCount, setCategoryCount] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [normalizedLabelMap, setNormalizedLabelMap] = useState({});

  // Use useCallback to memoize the fetchLabels function
  const fetchLabels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getUserLabels();
      
      if (error) throw error;
      
      console.log("LabelsPage received data:", data);
      setLabels(data || []);
      
      // Extract unique normalized label names and create mapping
      const normalizedMap = {};
      const normalizedSet = new Set();
      
      // First, create normalized mapping
      (data || []).forEach(item => {
        const normalized = normalizeLabel(item.label_name);
        normalizedSet.add(normalized);
        
        // Store the display version (original casing) for each normalized label
        // If we already have a version stored, keep the one that came first
        if (!normalizedMap[normalized]) {
          normalizedMap[normalized] = item.label_name;
        }
      });
      
      setNormalizedLabelMap(normalizedMap);
      
      // Create unique labels array using the display versions
      const uniqueLabelsArray = Array.from(normalizedSet).map(normalized => 
        normalizedMap[normalized]
      );
      
      setUniqueLabels(uniqueLabelsArray);
      
      // Count profiles per normalized label
      const counts = {};
      let total = 0;
      
      uniqueLabelsArray.forEach(labelName => {
        const normalizedName = normalizeLabel(labelName);
        const count = data.filter(item => 
          normalizeLabel(item.label_name) === normalizedName
        ).length;
        
        counts[labelName] = count;
        total += count;
      });
      
      setCategoryCount(counts);
      setTotalProfiles(total);
      
      // If we have labels, select the first one by default
      if (uniqueLabelsArray.length > 0) {
        setSelectedLabel(uniqueLabelsArray[0]);
        await fetchProfilesForLabel(uniqueLabelsArray[0]);
      }
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to load labels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  // When profile modal is open, prevent background scrolling
  useEffect(() => {
    if (selectedProfile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
    
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [selectedProfile]);

  const fetchProfilesForLabel = async (labelName) => {
    if (!labelName) return;
    
    try {
      setIsLoading(true);
      
      // Get all profiles with the normalized version of this label
      const normalizedName = normalizeLabel(labelName);
      
      // Fetch all profiles that have any version of this normalized label
      const { data, error } = await getProfilesByLabel(normalizedName, true);
      
      if (error) throw error;
      
      // Store the profiles for this label
      setProfilesByLabel(prev => ({
        ...prev,
        [labelName]: data || []
      }));
    } catch (err) {
      console.error(`Error fetching profiles for label ${labelName}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelClick = async (labelName) => {
    setSelectedLabel(labelName);
    
    // Check if we already have profiles for this label
    if (!profilesByLabel[labelName]) {
      await fetchProfilesForLabel(labelName);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    try {
      await removeLabelFromProfile(labelId);
      
      // Get the label that was removed
      const removedLabel = labels.find(label => label.id === labelId);
      const labelName = removedLabel?.label_name;
      
      // Update the state with the label removed
      setLabels(labels.filter(label => label.id !== labelId));
      
      // Update profiles by label to remove this profile
      setProfilesByLabel(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(name => {
          updated[name] = updated[name].filter(profile => profile.id !== labelId);
        });
        return updated;
      });
      
      // Update counts
      if (labelName) {
        setCategoryCount(prev => {
          const updated = {...prev};
          updated[labelName] = Math.max(0, (updated[labelName] || 0) - 1);
          return updated;
        });
        setTotalProfiles(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error removing label:', err);
    }
  };

  const handleEditLabel = (labelName) => {
    setEditingLabel(labelName);
    setNewLabelName(labelName);
  };

  const handleUpdateLabel = async (e) => {
    e.preventDefault();
    if (!editingLabel || !newLabelName.trim() || newLabelName === editingLabel) {
      setEditingLabel(null);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get normalized version of editing label
      const normalizedEditingLabel = normalizeLabel(editingLabel);
      
      // Update all labels with this normalized name
      const labelsToUpdate = labels.filter(label => 
        normalizeLabel(label.label_name) === normalizedEditingLabel
      );
      
      console.log(`Updating ${labelsToUpdate.length} labels from "${editingLabel}" to "${newLabelName}"`);
      
      for (const label of labelsToUpdate) {
        await updateProfileLabel(label.id, newLabelName);
      }
      
      // Update local state
      setLabels(labels.map(label => 
        normalizeLabel(label.label_name) === normalizedEditingLabel
          ? {...label, label_name: newLabelName} 
          : label
      ));
      
      // Update unique labels - remove all versions of the old label and add the new one
      setUniqueLabels(prev => {
        const filteredLabels = prev.filter(l => normalizeLabel(l) !== normalizedEditingLabel);
        return [...filteredLabels, newLabelName];
      });
      
      // Update normalized label map
      setNormalizedLabelMap(prev => {
        const newMap = {...prev};
        newMap[normalizeLabel(newLabelName)] = newLabelName;
        delete newMap[normalizedEditingLabel];
        return newMap;
      });
      
      // Update profiles by label
      setProfilesByLabel(prev => {
        const updated = {...prev};
        if (updated[editingLabel]) {
          updated[newLabelName] = updated[editingLabel];
          
          // Remove all variations of the old normalized label
          Object.keys(updated).forEach(key => {
            if (normalizeLabel(key) === normalizedEditingLabel) {
              delete updated[key];
            }
          });
        }
        return updated;
      });
      
      // Update category count
      setCategoryCount(prev => {
        const updated = {...prev};
        let totalCount = 0;
        
        // Find all labels with the same normalized name and sum their counts
        Object.keys(prev).forEach(key => {
          if (normalizeLabel(key) === normalizedEditingLabel) {
            totalCount += prev[key];
            delete updated[key];
          }
        });
        
        updated[newLabelName] = totalCount;
        return updated;
      });
      
      // If the edited label was selected, update the selected label
      if (normalizeLabel(selectedLabel) === normalizedEditingLabel) {
        setSelectedLabel(newLabelName);
      }
      
      setEditingLabel(null);
    } catch (err) {
      console.error('Error updating label:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
  };

  // Render the full profile modal with animations
  const renderProfileModal = () => {
    if (!selectedProfile) return null;

    const { founder_data: profile } = selectedProfile;
    const profileFirstName = profile.name?.split(' ')[0] || '';
    const profileLastName = profile.name?.split(' ').slice(1).join(' ') || '';
    const initials = (profileFirstName.charAt(0) || '') + (profileLastName.charAt(0) || '');

    return ReactDOM.createPortal(
      <div className="modal-root" key="profile-modal-portal">
        <motion.div
          className="detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeProfileModal}
        >
          <motion.div
            className="detail-modal no-animation"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button in top-right corner with animation */}
            <motion.button 
              className="close-button" 
              onClick={closeProfileModal}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CloseIcon />
            </motion.button>

            {/* Add label button near the close button */}
            <div className="modal-label-button">
              <LabelButton 
                founderData={{ 
                  id: selectedProfile.founder_id,
                  firstName: profileFirstName,
                  lastName: profileLastName,
                  ...profile 
                }} 
                onLabelChange={(labels) => console.log('Profile labels updated:', labels)}
              />
            </div>

            {/* Modal Header with staggered animation */}
            <motion.div 
              className="modal-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="profile-info">
                {/* Avatar with animation */}
                <motion.div 
                  className="profile-avatar"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {initials}
                </motion.div>

                <div className="profile-main">
                  {/* Name with animation */}
                  <motion.h2 
                    className="profile-name"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {profile.name}
                  </motion.h2>
                  
                  {/* Headline with animation */}
                  {profile.headline && (
                    <motion.p 
                      className="profile-headline"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      {profile.headline}
                    </motion.p>
                  )}
                  
                  {/* Location with animation */}
                  {profile.location && (
                    <motion.p 
                      className="profile-location"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <LocationIcon /> {profile.location}
                    </motion.p>
                  )}
                  
                  {/* Profile links section */}
                  <motion.div 
                    className="profile-links"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    {/* LinkedIn profile link */}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-link linkedin-link"
                      >
                        <LinkedInIcon /> View LinkedIn Profile
                      </a>
                    )}
                    
                    {/* Wellfound profile link */}
                    {profile.wellFoundUrl && (
                      <a 
                        href={profile.wellFoundUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile-link wellfound-link"
                      >
                        <WellfoundIcon /> View Wellfound Profile
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Modal Content with section-by-section reveal */}
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Company Section */}
              {profile.company && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="section-title">
                    <CompanyIcon /> Company
                  </h3>
                  <div className="detail-card">
                    <h4>{profile.company}</h4>
                    {profile.industry && (
                      <div className="industry">
                        <strong>Industry:</strong> {profile.industry}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* About Section */}
              {profile.linkedinDescription && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="section-title">
                    <span role="img" aria-label="About">📝</span> About
                  </h3>
                  <div className="detail-card">
                    <div className="description">
                      {profile.linkedinDescription.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="description-paragraph">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Current Position Section */}
              {profile.linkedinJobTitle && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="section-title">
                    <span role="img" aria-label="Position">💼</span> Current Position
                  </h3>
                  <div className="detail-card">
                    <h4>{profile.linkedinJobTitle}</h4>
                    {profile.linkedinJobLocation && (
                      <p className="job-location">
                        <LocationIcon /> {profile.linkedinJobLocation}
                      </p>
                    )}
                    {profile.linkedinJobDescription && (
                      <div className="description">
                        {profile.linkedinJobDescription.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="description-paragraph">{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Skills Section */}
              {profile.linkedinSkillsLabel && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="section-title">
                    <span role="img" aria-label="Skills">🛠️</span> Skills
                  </h3>
                  <div className="detail-card">
                    <div className="skills-container">
                      {profile.linkedinSkillsLabel.split(',').map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notes */}
              {selectedProfile.notes && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="section-title">
                    <span role="img" aria-label="Notes">📝</span> Notes
                  </h3>
                  <div className="detail-card">
                    <div className="description">
                      {selectedProfile.notes}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Label Info */}
              <motion.div 
                className="detail-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="labeled-profile-info">
                  <p>
                    <strong>Label:</strong> {selectedProfile.label_name}
                  </p>
                  <p>
                    <strong>Added on:</strong> {new Date(selectedProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>,
      document.body
    );
  };

  if (isLoading && !Object.keys(profilesByLabel).length) {
    return (
      <div className="labels-container">
        <h2 className="labels-title">My Labels</h2>
        <div className="labels-loading">Loading labels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="labels-container">
        <h2 className="labels-title">My Labels</h2>
        <div className="labels-error">{error}</div>
        <button className="labels-retry-button" onClick={fetchLabels}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="labels-container">
      <h2 className="labels-title">
        My Labels 
        {totalProfiles > 0 && (
          <span className="total-count">({totalProfiles} total profiles)</span>
        )}
      </h2>
      
      {uniqueLabels.length === 0 ? (
        <div className="labels-empty">
          <p>You haven't created any labels yet.</p>
          <p>Browse through founder profiles and use the label icon to organize them into categories.</p>
        </div>
      ) : (
        <div className="labels-content">
          <div className="labels-sidebar">
            <h3 className="labels-sidebar-title">Categories</h3>
            <ul className="labels-list">
              {uniqueLabels.map(labelName => {
                const gradient = getLabelGradient(labelName);
                // Extract the end color of the gradient for the indicator
                const accentColor = gradient.split(',')[1].trim().slice(0, -1);
                
                return (
                  <li 
                    key={labelName} 
                    className={`label-item ${selectedLabel === labelName ? 'active' : ''}`}
                    data-gradient={gradient}
                  >
                    <button
                      className="label-button"
                      onClick={() => handleLabelClick(labelName)}
                      style={
                        labelName !== editingLabel
                          ? { 
                              background: labelName === selectedLabel ? gradient : 'none',
                              borderLeft: labelName !== selectedLabel ? `3px solid ${accentColor}` : 'none'
                            }
                          : {}
                      }
                    >
                      {labelName === editingLabel ? (
                        <form onSubmit={handleUpdateLabel} className="edit-label-form">
                          <input
                            type="text"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            autoFocus
                            onBlur={handleUpdateLabel}
                            className="edit-label-input"
                          />
                        </form>
                      ) : (
                        <>
                          <span className="label-name">{labelName}</span>
                          <span className="label-count">({categoryCount[labelName] || 0})</span>
                        </>
                      )}
                    </button>
                    
                    <div className="label-actions">
                      <button 
                        className="edit-label-button"
                        onClick={() => handleEditLabel(labelName)}
                        title="Edit label"
                      >
                        ✎
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="labels-profiles">
            <h3 className="labels-profiles-title">
              {selectedLabel ? (
                <>
                  Founders labeled as "{selectedLabel}" 
                  <span className="label-count">({profilesByLabel[selectedLabel]?.length || 0} profiles)</span>
                </>
              ) : 'Select a label'}
            </h3>
            
            {selectedLabel && profilesByLabel[selectedLabel] && (
              <div className="labeled-profiles-list">
                {profilesByLabel[selectedLabel].length === 0 ? (
                  <p className="no-profiles-message">No profiles with this label.</p>
                ) : (
                  profilesByLabel[selectedLabel].map(profile => {
                    const founderData = profile.founder_data || {};
                    const gradient = getLabelGradient(selectedLabel);
                    
                    return (
                      <div 
                        key={profile.id} 
                        className="labeled-profile-card"
                        style={{
                          borderTop: `4px solid ${gradient.split(',')[1].trim().slice(0, -1)}`,
                          background: `linear-gradient(to bottom, ${gradient.split(',')[1].trim().slice(0, -1)}10, white 15%)`
                        }}
                      >
                        <div className="labeled-profile-content">
                          <h3 className="labeled-profile-name">{founderData.name || 'Unnamed Founder'}</h3>
                          
                          <div className="labeled-profile-details">
                            {founderData.company && (
                              <span className="labeled-profile-company">{founderData.company}</span>
                            )}
                            
                            {founderData.industry && (
                              <span className="labeled-profile-sector">{founderData.industry}</span>
                            )}
                          </div>
                          
                          {founderData.headline && (
                            <p className="labeled-profile-headline">{founderData.headline}</p>
                          )}
                          
                          {profile.notes && (
                            <p className="labeled-profile-notes">{profile.notes}</p>
                          )}
                          
                          <div className="labeled-profile-date">
                            Labeled on {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="labeled-profile-actions">
                          <button 
                            className="view-profile-button"
                            onClick={() => openProfileModal(profile)}
                          >
                            View Full Profile
                          </button>
                          
                          <div className="social-buttons">
                            {founderData.linkedinUrl && (
                              <a 
                                href={founderData.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-button linkedin-button"
                                title="View LinkedIn Profile"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                              </a>
                            )}
                            
                            {founderData.wellFoundUrl && (
                              <a 
                                href={founderData.wellFoundUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-button wellfound-button"
                                title="View Wellfound Profile"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M2 2v20h20V2H2zm18 18H4V4h16v16zM10 12H24V2H10v10zm2-8h10v6H12V4z" />
                                </svg>
                              </a>
                            )}
                          </div>
                          
                          <button 
                            className="remove-label-button"
                            onClick={() => handleRemoveLabel(profile.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Render the profile modal when a profile is selected */}
      {renderProfileModal()}
    </div>
  );
};

export default LabelsPage; 