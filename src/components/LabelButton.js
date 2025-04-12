import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getProfileLabels, addLabelToProfile, removeLabelFromProfile, getUserLabels } from '../supabaseClient';
import './LabelButton.css';

// Create a cache for labels to avoid redundant API calls
let labelsCache = {
  data: null,
  timestamp: null,
  expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
};

const LabelButton = ({ founderData, onLabelChange, className = '' }) => {
  const [labels, setLabels] = useState([]);
  const [allUserLabels, setAllUserLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLabels, setIsFetchingLabels] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Generate a consistent ID from founder data
  const founderId = useMemo(() => {
    // First try using the existing ID if available
    if (founderData.id) {
      return founderData.id;
    }
    
    // If no ID exists, create one from name and company (most reliable data points)
    const nameComponent = founderData.firstName && founderData.lastName
      ? `${founderData.firstName.trim()}-${founderData.lastName.trim()}`
      : founderData.firstName || founderData.lastName || 'unknown';
      
    const companyComponent = founderData.companyName 
      ? `-${founderData.companyName.trim().replace(/\s+/g, '-')}` 
      : '';
      
    // Add a fallback using LinkedIn URL if available (unique identifier)
    const linkedinIdComponent = founderData.linkedinProfileUrl
      ? `-${founderData.linkedinProfileUrl.split('/').filter(Boolean).pop() || ''}`
      : '';
      
    return `${nameComponent}${companyComponent}${linkedinIdComponent}`.toLowerCase();
  }, [founderData]);

  // Memoized function to fetch all user labels
  const fetchAllUserLabels = useCallback(async (forceRefresh = false) => {
    // If we already have cached data and it's not expired, use it
    const now = Date.now();
    if (!forceRefresh && 
        labelsCache.data && 
        labelsCache.timestamp && 
        (now - labelsCache.timestamp < labelsCache.expiryTime)) {
      console.log("Using cached labels data");
      setAllUserLabels(labelsCache.data);
      return;
    }
    
    setIsFetchingLabels(true);
    
    try {
      const { data, error } = await getUserLabels();
      if (error) throw error;
      
      if (data) {
        // Extract unique label names
        const uniqueLabels = [...new Set(data.map(item => item.label_name))];
        
        // Update cache
        labelsCache = {
          data: uniqueLabels,
          timestamp: now,
          expiryTime: 5 * 60 * 1000
        };
        
        setAllUserLabels(uniqueLabels);
      }
    } catch (error) {
      console.error('Error fetching user labels:', error);
    } finally {
      setIsFetchingLabels(false);
    }
  }, []);

  useEffect(() => {
    // Check if this profile has any labels when component mounts
    const checkLabels = async () => {
      if (!founderId) return;
      
      try {
        const { labels, error } = await getProfileLabels(founderId);
        if (error) throw error;
        setLabels(labels);
      } catch (error) {
        console.error('Error checking profile labels:', error);
      }
    };

    checkLabels();
  }, [founderId]);

  // Lazy load the labels when dropdown is opened, not on component mount
  useEffect(() => {
    if (isDropdownOpen && !isFetchingLabels && !allUserLabels.length) {
      fetchAllUserLabels();
    }
  }, [isDropdownOpen, fetchAllUserLabels, isFetchingLabels, allUserLabels.length]);

  // Calculate dropdown direction when it's about to open
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      // If we're in the modal, always show dropdown below
      if (className.includes('modal-label-button')) {
        setDropdownDirection('down');
      } else {
        // If there's not enough space below (less than 300px), show dropdown above
        setDropdownDirection(spaceBelow < 300 ? 'up' : 'down');
      }
    }
  }, [isDropdownOpen, className]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAddExistingLabel = async (labelName) => {
    if (!labelName || isLoading) return;
    
    // Check if the label is already applied to this profile
    if (labels.some(label => label.label_name === labelName)) {
      return; // Label already exists for this profile
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await addLabelToProfile(founderData, labelName);
      if (error) throw error;
      
      // Add new label to state
      if (data && data.length > 0) {
        setLabels([...labels, { id: data[0].id, label_name: data[0].label_name }]);
      }
      
      // Notify parent component
      if (onLabelChange) {
        onLabelChange([...labels, { id: data[0].id, label_name: data[0].label_name }]);
      }
    } catch (error) {
      console.error('Error adding existing label:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await addLabelToProfile(founderData, newLabelName.trim());
      if (error) throw error;
      
      // Add new label to state
      if (data && data.length > 0) {
        const updatedLabels = [...labels, { id: data[0].id, label_name: data[0].label_name }];
        setLabels(updatedLabels);
        
        // Also add this to our all user labels if it's not already there
        if (!allUserLabels.includes(data[0].label_name)) {
          const updatedUserLabels = [...allUserLabels, data[0].label_name];
          setAllUserLabels(updatedUserLabels);
          
          // Update the cache with new label
          labelsCache.data = updatedUserLabels;
          labelsCache.timestamp = Date.now();
        }
        
        // Notify parent component with the updated labels
        if (onLabelChange) {
          onLabelChange(updatedLabels);
        }
      }
      
      // Clear input
      setNewLabelName('');
    } catch (error) {
      console.error('Error adding label:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await removeLabelFromProfile(labelId);
      if (error) throw error;
      
      // Remove label from state
      setLabels(labels.filter(label => label.id !== labelId));
      
      // Notify parent component
      if (onLabelChange) {
        onLabelChange(labels.filter(label => label.id !== labelId));
      }
    } catch (error) {
      console.error('Error removing label:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out labels already applied to this profile
  const availableLabels = allUserLabels.filter(
    labelName => !labels.some(label => label.label_name === labelName)
  );

  return (
    <div
      className={`label-button-container ${
        className.includes('modal-label-button') ? 'modal-label-button' : ''
      } ${dropdownDirection === 'up' ? 'dropdown-up' : 'dropdown-down'}`}
      ref={dropdownRef}
    >
      <button 
        className={`label-button ${labels.length > 0 ? 'has-labels' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={handleToggleDropdown}
        disabled={isLoading}
        aria-label="Manage labels"
        title="Manage labels"
        ref={buttonRef}
      >
        <svg 
          className="label-icon" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 5H2v7l6.29 6.29c.39.39 1.02.39 1.41 0l3.3-3.29c.39-.39.39-1.02 0-1.41L9 10V5z"></path>
          <path d="M16 3h5v5"></path>
          <path d="M21 3l-7 7"></path>
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div className="label-dropdown">
          <h3 className="label-dropdown-title">Manage Labels</h3>
          
          {labels.length > 0 ? (
            <ul className="labels-list">
              {labels.map(label => (
                <li key={label.id} className="label-item">
                  <span className="label-name">{label.label_name}</span>
                  <button 
                    className="remove-label-button" 
                    onClick={() => handleRemoveLabel(label.id)}
                    disabled={isLoading}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-labels-message">No labels yet</p>
          )}
          
          {isFetchingLabels ? (
            <div className="loading-labels">Loading labels...</div>
          ) : (
            <div className="existing-labels-section">
              <h4 className="existing-labels-title">Apply existing label:</h4>
              <div className="existing-labels-list">
                {availableLabels.length > 0 ? (
                  availableLabels.map((labelName) => (
                    <button
                      key={labelName}
                      className="existing-label-button"
                      onClick={() => handleAddExistingLabel(labelName)}
                      disabled={isLoading}
                    >
                      {labelName}
                    </button>
                  ))
                ) : (
                  <p className="no-more-labels">No more labels available</p>
                )}
              </div>
            </div>
          )}
          
          <form className="add-label-form" onSubmit={handleAddLabel}>
            <input
              type="text"
              placeholder="Add new label..."
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="label-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="add-label-button"
              disabled={!newLabelName.trim() || isLoading}
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default React.memo(LabelButton); 