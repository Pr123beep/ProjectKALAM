// src/components/FilterBar.js
import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import './FilterBar.css';

const getAbbreviationMatches = (abbreviation, dataList) => {
  // Enhanced abbreviation mappings for worldwide institutions
  const abbreviations = {
    // Indian Institutes
    'iit': 'indian institute of technology',
    'iim': 'indian institute of management',
    'iiit': 'indian institute of information technology',
    
    
    
  };
  
  // Campus/location abbreviations
  const locationAbbr = {
    'b': 'bombay',
    'd': 'delhi',
    'm': 'madras',
    'k': 'kanpur',
    'kgp': 'kharagpur',
    'r': 'roorkee',
    'g': 'guwahati',
    'a': 'ahmedabad',
    'blore': 'bangalore',
    'bang': 'bangalore',
    'c': 'calcutta',
    'hyd': 'hyderabad',
    'pune': 'pune',
    
  };
  
  // Normalize the input
  const normalizedInput = abbreviation.toLowerCase().trim();
  
  // Clean and split the input into search terms
  const parts = normalizedInput.split(/[\s,.-]+/).filter(part => part.length > 0);
  
  // For very short inputs, use more lenient matching
  if (normalizedInput.length < 3) {
    return dataList.filter(item => 
      item.toLowerCase().includes(normalizedInput)
    );
  }
  
  // Direct match - if the search term is part of the institution name
  const directMatches = dataList.filter(item => 
    item.toLowerCase().includes(normalizedInput)
  );
  
  if (directMatches.length > 0) {
    return directMatches;
  }
  
  // Expanded search to handle common patterns
  let allMatches = [];
  
  // Check for expanded abbreviations (e.g., "iit" → "indian institute of technology")
  if (abbreviations[normalizedInput]) {
    const expandedMatches = dataList.filter(item => 
      item.toLowerCase().includes(abbreviations[normalizedInput])
    );
    allMatches.push(...expandedMatches);
  }
  
  // Handle compound patterns like "iit b" → "indian institute of technology bombay"
  if (parts.length >= 2) {
    // Check if first part is an institution abbreviation and second is a location
    if (abbreviations[parts[0]] && locationAbbr[parts[1]]) {
      const expandedInst = abbreviations[parts[0]];
      const expandedLoc = locationAbbr[parts[1]];
      
      const patternMatches = dataList.filter(item => {
        const lowerItem = item.toLowerCase();
        return lowerItem.includes(expandedInst) && lowerItem.includes(expandedLoc);
      });
      
      allMatches.push(...patternMatches);
    }
    
    // Try matching parts individually (e.g., "harvard business" matches "Harvard Business School")
    const partMatches = dataList.filter(item => {
      const lowerItem = item.toLowerCase();
      return parts.every(part => 
        lowerItem.includes(part) || 
        (abbreviations[part] && lowerItem.includes(abbreviations[part]))
      );
    });
    
    allMatches.push(...partMatches);
  }
  
  // If all else fails, try looser matching with any of the parts
  if (allMatches.length === 0) {
    const looseMatches = dataList.filter(item => {
      const lowerItem = item.toLowerCase();
      return parts.some(part => {
        // Check for direct part match
        if (lowerItem.includes(part)) return true;
        
        // Check for expanded abbreviation match
        if (abbreviations[part] && lowerItem.includes(abbreviations[part])) return true;
        
        // Check for location match
        if (locationAbbr[part] && lowerItem.includes(locationAbbr[part])) return true;
        
        return false;
      });
    });
    
    allMatches.push(...looseMatches);
  }
  
  // Remove duplicates and return
  return [...new Set(allMatches)];
};

const FilterBar = ({ onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: '0',
    followersMax: '50000'
  });

  // New state for profile source filters
  const [profileSources, setProfileSources] = useState({
    linkedin: true,
    wellfound: true
  });

  // Instead of starting with a fixed value, we'll initialize it later
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const filterRef = useRef(null);

  // Add state for suggestions
  const [suggestions, setSuggestions] = useState({
    college: [],
    currentLocation: [],
    companyIndustry: []
  });
  
  const [activeSuggestion, setActiveSuggestion] = useState('');
  
  // Sample data for suggestions - replace with your actual data
  const sampleData = {
    college: [
      // IITs
      'Indian Institute of Technology, Bombay', 
      'Indian Institute of Technology, Delhi', 
      'Indian Institute of Technology, Madras',
      'Indian Institute of Technology, Kanpur',
      'Indian Institute of Technology, Kharagpur',
      'Indian Institute of Technology, Roorkee',
      'Indian Institute of Technology, Guwahati',
      'Indian Institute of Technology, Hyderabad',
      
      // IIMs
      'Indian Institute of Management, Bangalore',
      'Indian Institute of Management, Calcutta',
      'Indian Institute of Management, Lucknow',
      'Indian Institute of Management, Indore',
      
      
      
      // Other Indian Institutions 
      
      // US Universities
      
    ],
    currentLocation: [
      'Mumbai, India',
      'Delhi, India',
      'Bangalore, India',
      'Hyderabad, India',
      'Chennai, India',
      'Pune, India',
      'Kolkata, India',
      'Ahmedabad, India',
      'San Francisco, USA',
      'New York, USA',
      'London, UK',
      'Singapore',
      'Dubai, UAE',
      'Sydney, Australia',
      'Toronto, Canada'
    ],
    companyIndustry: [
      'Computer Software',
      'Financial Services',
      'Information Technology & Services',
      'Internet',
      'Hospital & Health Care',
      'Marketing & Advertising',
      'Professional Training & Coaching',
      'E-commerce',
      'Education Management',
      'Telecommunications',
      'Artificial Intelligence',
      'SaaS',
      'FinTech',
      'HealthTech',
      'EdTech'
    ]
  };

  // Check if device is mobile and handle scroll behavior
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      
      // Set initial collapsed state based on device type
      // Mobile: initially collapsed (true), Desktop: initially expanded (false)
      setIsCollapsed(isMobileView);
    };
    
    // Set initial value on mount
    checkMobile();
    
    // Add resize listener to update when window size changes
    window.addEventListener('resize', checkMobile);
    
    // Handle scroll for sticky header
    const handleScroll = () => {
      if (window.innerWidth <= 768 && filterRef.current) {
        // On mobile, collapse the filter when scrolling down
        if (window.scrollY > 50) {
          setIsCollapsed(true);
          filterRef.current.classList.add('filter-sticky');
          document.body.classList.add('has-sticky-filter');
          void filterRef.current.offsetHeight;
        } else if (window.scrollY < 10) {
          // Don't auto-expand when scrolling to top - keep it collapsed until user taps
          filterRef.current.classList.remove('filter-sticky');
          document.body.classList.remove('has-sticky-filter');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check on mount
    handleScroll();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle expanded/collapsed state on mobile
  const toggleFilters = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle input change with suggestions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Generate suggestions based on input
    if (name in sampleData && value.length > 1) {
      let filteredSuggestions;
      
      // Special handling for college field to support abbreviations
      if (name === 'college') {
        filteredSuggestions = getAbbreviationMatches(value, sampleData.college);
      } else {
        // Standard filtering for other fields
        filteredSuggestions = sampleData[name]
          .filter(item => 
            item.toLowerCase().includes(value.toLowerCase())
          );
      }
      
      // Limit to 5 suggestions
      filteredSuggestions = filteredSuggestions.slice(0, 5);
      
      setSuggestions(prev => ({
        ...prev,
        [name]: filteredSuggestions
      }));
      
      // Set this as the active suggestion field
      setActiveSuggestion(name);
    } else if (name in sampleData) {
      // Clear suggestions if input is too short
      setSuggestions(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear suggestions after selection
    setSuggestions(prev => ({
      ...prev,
      [field]: []
    }));
    
    setActiveSuggestion('');
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions({
        college: [],
        currentLocation: [],
        companyIndustry: []
      });
      setActiveSuggestion('');
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSourceChange = (source) => {
    // Create new profileSources state with the toggled value
    const newProfileSources = {
      ...profileSources,
      [source]: !profileSources[source]
    };
    
    // Update the state
    setProfileSources(newProfileSources);
    
    // Apply filters immediately when checkbox changes
    onApplyFilters({
      ...localFilters,
      followersMin: parseInt(localFilters.followersMin, 10),
      followersMax: parseInt(localFilters.followersMax, 10),
      profileSources: newProfileSources
    });
  };

  const handleApply = () => {
    // Create a copy of the filters to send
    const filtersToApply = {
      ...localFilters,
      // We'll pass the original college name without modifications
      // The matching function in MainPage.js will handle normalization
      followersMin: parseInt(localFilters.followersMin, 10),
      followersMax: parseInt(localFilters.followersMax, 10),
      profileSources
    };
    
    // Apply filters with the values from our state
    onApplyFilters(filtersToApply);
  };

  const handleClear = () => {
    const cleared = {
      college: '',
      companyIndustry: '',
      currentLocation: '',
      followersMin: '0',
      followersMax: '50000'
    };
    setLocalFilters(cleared);
    onApplyFilters({
      ...cleared,
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: true,
        wellfound: true
      }
    });
  };

  return (
    <div className={`advanced-filter-bar ${isCollapsed ? 'collapsed' : ''}`} ref={filterRef}>
      {/* Mobile filter header with toggle */}
      {isMobile && (
        <div className="filter-mobile-header" onClick={toggleFilters}>
          <h3 className="filter-heading">Decontaminators!</h3>
          <button className="filter-toggle-btn">
            {isCollapsed ? 'Show Filters ▼' : 'Hide Filters ▲'}
          </button>
        </div>
      )}
      
      {/* Regular filter heading for desktop */}
      {!isMobile && <h3 className="filter-heading">Decontaminators!</h3>}
      
      {/* Filter content that can be collapsed */}
      <div className={`filter-content ${isCollapsed ? 'hidden' : ''}`}>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="college">College:</label>
            <div className="suggestion-container">
              <input
                type="text"
                id="college"
                name="college"
                value={localFilters.college}
                onChange={handleChange}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestion('college');
                }}
                placeholder="Search by college"
                className="filter-input"
                autoComplete="off"
              />
              {activeSuggestion === 'college' && suggestions.college.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.college.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSuggestion('college', suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="filter-item">
            <label htmlFor="companyIndustry">Industry:</label>
            <div className="suggestion-container">
              <input
                type="text"
                id="companyIndustry" 
                name="companyIndustry"
                value={localFilters.companyIndustry}
                onChange={handleChange}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestion('companyIndustry');
                }}
                placeholder="Search by industry"
                className="filter-input"
                autoComplete="off"
              />
              {activeSuggestion === 'companyIndustry' && suggestions.companyIndustry.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.companyIndustry.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSuggestion('companyIndustry', suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="filter-item">
            <label htmlFor="currentLocation">Location:</label>
            <div className="suggestion-container">
              <input
                type="text"
                id="currentLocation"
                name="currentLocation"
                value={localFilters.currentLocation}
                onChange={handleChange}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestion('currentLocation');
                }}
                placeholder="Search by location"
                className="filter-input"
                autoComplete="off"
              />
              {activeSuggestion === 'currentLocation' && suggestions.currentLocation.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.currentLocation.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSuggestion('currentLocation', suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="filter-item" style={{ width: '100%' }}>
            <label>Followers Range:</label>
            <div className="range-inputs">
              <input
                type="number"
                name="followersMin"
                value={localFilters.followersMin}
                onChange={handleChange}
                placeholder="Min"
                className="filter-input"
              />
              <input
                type="number"
                name="followersMax"
                value={localFilters.followersMax}
                onChange={handleChange}
                placeholder="Max"
                className="filter-input"
              />
            </div>
          </div>
        </div>
        <div className="filter-section">
          <h3>Profile Sources</h3>
          <div className="filter-source-checkboxes">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={profileSources.linkedin}
                onChange={() => handleSourceChange('linkedin')}
              />
              <span className="checkbox-label">LinkedIn</span>
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={profileSources.wellfound}
                onChange={() => handleSourceChange('wellfound')}
              />
              <span className="checkbox-label">Wellfound</span>
            </label>
          </div>
        </div>
        <div className="filter-actions">
          <button className="apply-button" onClick={handleApply}>
            Apply Filters
          </button>
          <button className="clear-button" onClick={handleClear}>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
