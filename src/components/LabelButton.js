import React, { useState, useEffect, useRef } from 'react';
import { getProfileLabels, addLabelToProfile, removeLabelFromProfile, getUserLabels } from '../supabaseClient';
import './LabelButton.css';

const LabelButton = ({ founderData, onLabelChange, className = '' }) => {
  const [labels, setLabels] = useState([]);
  const [allUserLabels, setAllUserLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Generate a consistent ID from founder data
  const founderId = founderData.id || `${founderData.firstName}-${founderData.lastName}`;

  // Fetch all user labels for quick reuse
  const fetchAllUserLabels = async () => {
    try {
      const { data, error } = await getUserLabels();
      if (error) throw error;
      
      if (data) {
        // Extract unique label names
        const uniqueLabels = [...new Set(data.map(item => item.label_name))];
        setAllUserLabels(uniqueLabels);
      }
    } catch (error) {
      console.error('Error fetching user labels:', error);
    }
  };

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
    fetchAllUserLabels();
  }, [founderId]);

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
        setLabels([...labels, { id: data[0].id, label_name: data[0].label_name }]);
        
        // Also add this to our all user labels if it's not already there
        if (!allUserLabels.includes(data[0].label_name)) {
          setAllUserLabels([...allUserLabels, data[0].label_name]);
        }
      }
      
      // Notify parent component
      if (onLabelChange) {
        onLabelChange(labels);
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
          
          {/* Existing labels dropdown */}
          {availableLabels.length > 0 && (
            <div className="existing-labels-section">
              <h4 className="existing-labels-title">Apply existing label:</h4>
              <div className="existing-labels-list">
                {availableLabels.map((labelName) => (
                  <button
                    key={labelName}
                    className="existing-label-button"
                    onClick={() => handleAddExistingLabel(labelName)}
                    disabled={isLoading}
                  >
                    {labelName}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Create new label form */}
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

export default LabelButton; 