// src/components/FilterBar.js
import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import './FilterBar.css';

const getAbbreviationMatches = (abbreviation, dataList) => {
  const abbreviations = {
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
    'a': 'ahemdabad',
    'blore': 'bangalore',
    'bang': 'bangalore',
    'c': 'calcutta',
    'hyd': 'hyderabad',
    'pune': 'pune',
    
  };
  
  const normalizedInput = abbreviation.toLowerCase().trim();
  
  const parts = normalizedInput.split(/[\s,.-]+/).filter(part => part.length > 0);
  
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
  
  let allMatches = [];
  
  if (abbreviations[normalizedInput]) {
    const expandedMatches = dataList.filter(item => 
      item.toLowerCase().includes(abbreviations[normalizedInput])
    );
    allMatches.push(...expandedMatches);
  }
  
  if (parts.length >= 2) {
    if (abbreviations[parts[0]] && locationAbbr[parts[1]]) {
      const expandedInst = abbreviations[parts[0]];
      const expandedLoc = locationAbbr[parts[1]];
      
      const patternMatches = dataList.filter(item => {
        const lowerItem = item.toLowerCase();
        return lowerItem.includes(expandedInst) && lowerItem.includes(expandedLoc);
      });
      
      allMatches.push(...patternMatches);
    }
    
    const partMatches = dataList.filter(item => {
      const lowerItem = item.toLowerCase();
      return parts.every(part => 
        lowerItem.includes(part) || 
        (abbreviations[part] && lowerItem.includes(abbreviations[part]))
      );
    });
    
    allMatches.push(...partMatches);
  }
  
  if (allMatches.length === 0) {
    const looseMatches = dataList.filter(item => {
      const lowerItem = item.toLowerCase();
      return parts.some(part => {
        if (lowerItem.includes(part)) return true;
        
        if (abbreviations[part] && lowerItem.includes(abbreviations[part])) return true;
        
        if (locationAbbr[part] && lowerItem.includes(locationAbbr[part])) return true;
        
        return false;
      });
    });
    
    allMatches.push(...looseMatches);
  }
  
  return [...new Set(allMatches)];
};

const CustomCheckbox = ({ type, label, checked, onChange }) => {
  return (
    <label className={`custom-checkbox ${type}`}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
      />
      <div className="checkbox-icon">
        {checked && (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="checkbox-label">{label}</span>
    </label>
  );
};

const FilterBar = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000,
    profileSources: {
      linkedin: false,
      wellfound: false
    }
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const filterRef = useRef(null);

  const [suggestions, setSuggestions] = useState({
    college: [],
    currentLocation: [],
    companyIndustry: []
  });
  
  const [activeSuggestion, setActiveSuggestion] = useState('');
  
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
      'Indian Institute of Management, Ahmedabad',
      
      
      
      
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

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      
      setIsCollapsed(isMobileView);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      if (window.innerWidth <= 768 && filterRef.current) {
        if (window.scrollY > 50) {
          setIsCollapsed(true);
          filterRef.current.classList.add('filter-sticky');
          document.body.classList.add('has-sticky-filter');
          void filterRef.current.offsetHeight;
        } else if (window.scrollY < 10) {
          filterRef.current.classList.remove('filter-sticky');
          document.body.classList.remove('has-sticky-filter');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    handleScroll();
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleFilters = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
    
    if (name in sampleData && value.length > 1) {
      let filteredSuggestions;
      
      if (name === 'college') {
        filteredSuggestions = getAbbreviationMatches(value, sampleData.college);
      } else {
        filteredSuggestions = sampleData[name]
          .filter(item => 
            item.toLowerCase().includes(value.toLowerCase())
          );
      }
      
      filteredSuggestions = filteredSuggestions.slice(0, 5);
      
      setSuggestions(prev => ({
        ...prev,
        [name]: filteredSuggestions
      }));
      
      setActiveSuggestion(name);
    } else if (name in sampleData) {
      setSuggestions(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };
  
  const handleSelectSuggestion = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    setSuggestions(prev => ({
      ...prev,
      [field]: []
    }));
    
    setActiveSuggestion('');
  };
  
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

  const handleSourceChange = (source, checked) => {
    setFilters(prev => ({
      ...prev,
      profileSources: {
        ...prev.profileSources,
        [source]: checked
      }
    }));
  };

  const handleApply = () => {
    const filtersToApply = {
      ...filters,
      followersMin: parseInt(filters.followersMin, 10),
      followersMax: parseInt(filters.followersMax, 10),
      profileSources: filters.profileSources
    };
    
    onApplyFilters(filtersToApply);
  };

  const handleClear = () => {
    const cleared = {
      college: '',
      companyIndustry: '',
      currentLocation: '',
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: false,
        wellfound: false
      }
    };
    setFilters(cleared);
    onApplyFilters({
      ...cleared,
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: false,
        wellfound: false
      }
    });
  };

  return (
    <div className={`advanced-filter-bar ${isCollapsed ? 'collapsed' : ''}`} ref={filterRef}>
      {isMobile && (
        <div className="filter-mobile-header" onClick={toggleFilters}>
          <h3 className="filter-heading">Decontaminators!</h3>
          <button className="filter-toggle-btn">
            {isCollapsed ? 'Show Filters ▼' : 'Hide Filters ▲'}
          </button>
        </div>
      )}
      
      {!isMobile && <h3 className="filter-heading">Decontaminators!</h3>}
      
      <div className={`filter-content ${isCollapsed ? 'hidden' : ''}`}>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="college">College:</label>
            <div className="suggestion-container">
              <input
                type="text"
                id="college"
                name="college"
                value={filters.college}
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
                value={filters.companyIndustry}
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
                value={filters.currentLocation}
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
                value={filters.followersMin}
                onChange={handleChange}
                placeholder="Min"
                className="filter-input"
              />
              <input
                type="number"
                name="followersMax"
                value={filters.followersMax}
                onChange={handleChange}
                placeholder="Max"
                className="filter-input"
              />
            </div>
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <label>Profile Sources</label>
            <div className="source-checkbox-container">
              <CustomCheckbox
                type="linkedin"
                label="LinkedIn"
                checked={filters.profileSources.linkedin}
                onChange={(e) => handleSourceChange('linkedin', e.target.checked)}
              />
              <CustomCheckbox
                type="wellfound"
                label="Wellfound"
                checked={filters.profileSources.wellfound}
                onChange={(e) => handleSourceChange('wellfound', e.target.checked)}
              />
            </div>
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