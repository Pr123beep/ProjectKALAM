// src/components/FilterBar.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../App.css';
import './FilterBar.css';
import { getUserSeenProfiles } from '../supabaseClient';

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
    college: [],
    companyIndustry: [],
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000,
    profileSources: {
      linkedin: false,
      wellfound: false
    },
    stealthMode: false,
    sortByRanking: false
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const filterRef = useRef(null);
  const resizeRef = useRef(null);

  const [suggestions, setSuggestions] = useState({
    college: [],
    currentLocation: [],
    companyIndustry: []
  });
  
  const [activeSuggestion, setActiveSuggestion] = useState('');
  
  const sampleData = {
    college: [
      // IITs
      'IIT Madras',
      'IIT Delhi',
      'IIT Bombay',
      'IIT Kharagpur',
      'IIT Kanpur',
      'IIT Roorkee',
      'IIT Guwahati',
      
      
      // IIMs
      'IIM Bangalore',
      'IIM Calcutta',
      'IIM Lucknow',
      'IIM Indore',
      'IIM Ahmedabad',
      'IIM Rohtak',
      'IIM Kozhikode',
      
      // IIITs
      'IIIT Hyderabad',
      'IIIT Bangalore',
      
      // NITs
      'NIT Calicut',
      'NIT Warangal',
      'NIT Rourkela',
      'NIT Surathkal',
      
      // Other top institutes
      'ISB',
      'IISC',
      'BITS Pilani',
      'XLRI Jamshedpur',
      'VIT',
      'Manipal Institute of Technology'
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

  const INDUSTRIES = [
    'Software & Tech Services',
    'DeepTech & Emerging Tech',
    'Other',
    'EdTech',
    'Hardware & Robotics',
    'FinTech',
    'Enterprise SaaS & B2B',
    'Media & Entertainment Tech',
    'E-commerce & Consumer Tech',
    'CleanTech & Sustainability',
    'HealthTech & BioTech',
    'Research & Innovation'
  ];

  const [seenFilter, setSeenFilter] = useState('all'); // 'all', 'seen', 'unseen'
  // eslint-disable-next-line no-unused-vars
  const [seenProfileIds, setSeenProfileIds] = useState([]);

  // Resize functionality with localStorage persistence
  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResize = useCallback((e) => {
    if (!isResizing || !filterRef.current) return;
    
    // Calculate new width based on mouse position
    const containerRect = filterRef.current.parentElement.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    
    // Apply minimum and maximum constraints
    const minWidth = 250;
    const maxWidth = Math.min(
      window.innerWidth * 0.85,
      containerRect.width - 20
    );
    
    const width = Math.max(minWidth, Math.min(newWidth, maxWidth));
    
    // Set the new width
    filterRef.current.style.width = `${width}px`;
    
    // Save to localStorage
    localStorage.setItem('filterBarWidth', width);

    // Dispatch a custom resize event for other components to respond
    window.dispatchEvent(new CustomEvent('filterBarResize', { detail: { width } }));
  }, [isResizing]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    
    // Add a slight delay before removing the resizing class for better visual feedback
    setTimeout(() => {
      if (filterRef.current) {
        filterRef.current.classList.remove('resizing');
      }
    }, 200);
  }, []);
  
  // Load saved width on initial render with responsive behavior
  useEffect(() => {
    if (!isMobile && filterRef.current) {
      const savedWidth = localStorage.getItem('filterBarWidth');
      const containerWidth = filterRef.current.parentElement?.getBoundingClientRect().width || window.innerWidth;
      
      let targetWidth;
      if (savedWidth) {
        // Apply saved width, but ensure it's not too big for current viewport
        targetWidth = Math.min(parseInt(savedWidth), containerWidth * 0.85);
      } else {
        // Default to 30% of container width if no saved value
        targetWidth = Math.max(250, Math.min(350, containerWidth * 0.3));
      }
      
      // Apply the width
      filterRef.current.style.width = `${targetWidth}px`;
    } else if (isMobile && filterRef.current) {
      // Full width on mobile
      filterRef.current.style.width = '100%';
    }
  }, [isMobile]);

  useEffect(() => {
    // Check if we are on mobile
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      
      // Collapse the filter bar by default on mobile
      setIsCollapsed(isMobileView);
    };
    
    // Call once on mount
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Handle scroll for sticky behavior
    const handleScroll = () => {
      if (!filterRef.current || !isMobile) return;
      
      const scrollY = window.scrollY;
      const filterTop = filterRef.current.getBoundingClientRect().top + scrollY;
      
      if (scrollY > filterTop) {
        filterRef.current.classList.add('filter-sticky');
        document.body.classList.add('has-sticky-filter');
      } else {
        filterRef.current.classList.remove('filter-sticky');
        document.body.classList.remove('has-sticky-filter');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);  // Add isMobile as dependency

  useEffect(() => {
    // Only load seen profiles if we're filtering by seen status
    if (seenFilter !== 'all') {
      const loadSeenProfiles = async () => {
        try {
          const { data, error } = await getUserSeenProfiles();
          if (error) throw error;
          
          // Store the seen profile IDs in state
          const seenIds = data.map(item => item.founder_id);
          setSeenProfileIds(seenIds);
          
          // Log the loaded seen profiles for debugging
          console.log(`Loaded ${seenIds.length} seen profiles for filtering`);
        } catch (error) {
          console.error('Error loading seen profiles:', error);
          // Reset to 'all' if there was an error
          setSeenFilter('all');
        }
      };
      
      loadSeenProfiles();
    }
  }, [seenFilter]);

  const toggleFilters = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'stealthMode') {
      setFilters(prevFilters => ({
        ...prevFilters,
        stealthMode: checked
      }));
      return;
    }
    
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
    const handleClickOutside = (event) => {
      // Only close dropdown if clicked outside
      const multiSelectContainers = document.querySelectorAll('.multi-select-container');
      const clickedInsideDropdown = Array.from(multiSelectContainers).some(container => 
        container.contains(event.target)
      );
      
      if (!clickedInsideDropdown) {
        setActiveSuggestion('');
        setSuggestions({
          college: [],
          currentLocation: [],
          companyIndustry: []
        });
      }
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
    // Create updated filters object that includes the seen filter status
    const updatedFilters = {
      ...filters,
      seenStatus: seenFilter
    };
    
    // Log before sending to parent
    console.log('Applying filters:', updatedFilters);
    
    // Check if sort by ranking is enabled
    if (updatedFilters.sortByRanking) {
      console.log('Sorting by ranking is enabled');
    }
    
    // Pass the updated filters to the parent component
    onApplyFilters(updatedFilters);
  };

  const handleClear = () => {
    // Keep sort by ranking setting when clearing other filters
    const keepSortByRanking = filters.sortByRanking;
    
    // Reset filters to default values
    setFilters({
      college: [],
      companyIndustry: [],
      currentLocation: '',
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: false,
        wellfound: false
      },
      stealthMode: false,
      sortByRanking: keepSortByRanking // Maintain sorting preference
    });
    
    // Reset seen filter to 'all'
    setSeenFilter('all');
    
    // Also apply the reset filters immediately
    onApplyFilters({
      college: [],
      companyIndustry: [],
      currentLocation: '',
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: false,
        wellfound: false
      },
      stealthMode: false,
      seenStatus: 'all',
      sortByRanking: keepSortByRanking // Maintain sorting preference
    });
  };

  const handleIndustryChange = (industry) => {
    setFilters(prev => {
      const updatedIndustries = prev.companyIndustry.includes(industry)
        ? prev.companyIndustry.filter(item => item !== industry)
        : [...prev.companyIndustry, industry];
      
      return {
        ...prev,
        companyIndustry: updatedIndustries
      };
    });
  };

  const handleCollegeChange = (college) => {
    setFilters(prev => {
      const updatedColleges = prev.college.includes(college)
        ? prev.college.filter(item => item !== college)
        : [...prev.college, college];
      
      return {
        ...prev,
        college: updatedColleges
      };
    });
  };

  const handleSeenFilterChange = (value) => {
    setSeenFilter(value);
    
    // Update filters when the seen filter changes
    const updatedFilters = {
      ...filters,
      seenStatus: value
    };
    
    onApplyFilters(updatedFilters);
  };

  const handleSortByRankingChange = (e) => {
    setFilters({
      ...filters,
      sortByRanking: e.target.checked
    });
  };

  // Add a separate useEffect for resize functionality
  useEffect(() => {
    if (isResizing) {
      // Add the resizing class to the filter bar
      if (filterRef.current) {
        filterRef.current.classList.add('resizing');
      }
      
      // Add event listeners for resize
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    }
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing, handleResize, stopResize]);

  return (
    <div 
      className={`advanced-filter-bar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'filter-sticky' : ''}`}
      ref={filterRef}
    >
      {isMobile && (
        <div className="filter-mobile-header">
          <h3 className="filter-heading">Filters</h3>
          <button 
            className="filter-toggle-btn"
            onClick={toggleFilters}
            aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
          >
            {isCollapsed ? '↓' : '↑'}
          </button>
        </div>
      )}
      
      {!isMobile && <h3 className="filter-heading">Filters</h3>}
      
      <div className={`filter-content ${isCollapsed ? 'hidden' : ''}`}>
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="college">College:</label>
            <div className="multi-select-container">
              <div 
                className="multi-select-header" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestion(activeSuggestion === 'college' ? '' : 'college');
                }}
              >
                {filters.college.length === 0 ? (
                  <span className="placeholder-text">Select Colleges</span>
                ) : (
                  <div className="selected-tags">
                    {filters.college.map(college => (
                      <div key={college} className="tag" title={college}>
                        <span className="tag-name">{college}</span>
                        <button 
                          className="tag-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCollegeChange(college);
                          }}
                          aria-label={`Remove ${college}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <span className="dropdown-icon">{activeSuggestion === 'college' ? '▲' : '▼'}</span>
              </div>
              
              {activeSuggestion === 'college' && (
                <div className="multi-select-options" onClick={(e) => e.stopPropagation()}>
                  <div className="search-in-dropdown">
                    <input
                      type="text"
                      placeholder="Search colleges..."
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length > 0) {
                          const filteredSuggestions = getAbbreviationMatches(value, sampleData.college);
                          setSuggestions(prev => ({
                            ...prev,
                            college: filteredSuggestions
                          }));
                        } else {
                          setSuggestions(prev => ({
                            ...prev,
                            college: sampleData.college
                          }));
                        }
                      }}
                      className="dropdown-search-input"
                    />
                  </div>
                  {(suggestions.college.length > 0 ? suggestions.college : sampleData.college).map(college => (
                    <div key={college} className="multi-select-option">
                      <label className="college-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.college.includes(college)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCollegeChange(college);
                          }}
                        />
                        <span className="college-name">{college}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="filter-item">
            <label htmlFor="companyIndustry">Industry:</label>
            <div className="multi-select-container">
              <div 
                className="multi-select-header" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSuggestion(activeSuggestion === 'industry' ? '' : 'industry');
                }}
              >
                {filters.companyIndustry.length === 0 ? (
                  <span className="placeholder-text">Select Industries</span>
                ) : (
                  <div className="selected-tags">
                    {filters.companyIndustry.map(industry => (
                      <div key={industry} className="tag" title={industry}>
                        <span className="tag-name">{industry}</span>
                        <button 
                          className="tag-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIndustryChange(industry);
                          }}
                          aria-label={`Remove ${industry}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <span className="dropdown-icon">{activeSuggestion === 'industry' ? '▲' : '▼'}</span>
              </div>
              
              {activeSuggestion === 'industry' && (
                <div className="multi-select-options" onClick={(e) => e.stopPropagation()}>
                  <div className="search-in-dropdown">
                    <input
                      type="text"
                      placeholder="Search industries..."
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        if (value.length > 0) {
                          const filteredIndustries = INDUSTRIES.filter(industry => 
                            industry.toLowerCase().includes(value)
                          );
                          setSuggestions(prev => ({
                            ...prev,
                            companyIndustry: filteredIndustries
                          }));
                        } else {
                          setSuggestions(prev => ({
                            ...prev,
                            companyIndustry: []
                          }));
                        }
                      }}
                      className="dropdown-search-input"
                    />
                  </div>
                  {(suggestions.companyIndustry.length > 0 ? suggestions.companyIndustry : INDUSTRIES).map(industry => (
                    <div key={industry} className="multi-select-option">
                      <label className="industry-checkbox">
                        <input
                          type="checkbox"
                          checked={filters.companyIndustry.includes(industry)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleIndustryChange(industry);
                          }}
                        />
                        <span className="industry-name">{industry}</span>
                      </label>
                    </div>
                  ))}
                </div>
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
        
        {/* Viewing Status Filter */}
        <div className="filter-group">
          <div className="filter-item">
            <label className="seen-status-label">Viewing Status</label>
            <div className="status-filter-container">
              <div className="radio-button-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="seenStatus"
                    value="all"
                    checked={seenFilter === 'all'}
                    onChange={() => handleSeenFilterChange('all')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-text">All Profiles</span>
                </label>
                
                <label className="radio-label">
                  <input
                    type="radio"
                    name="seenStatus"
                    value="seen"
                    checked={seenFilter === 'seen'}
                    onChange={() => handleSeenFilterChange('seen')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-text">Viewed Profiles</span>
                </label>
                
                <label className="radio-label">
                  <input
                    type="radio"
                    name="seenStatus"
                    value="unseen"
                    checked={seenFilter === 'unseen'}
                    onChange={() => handleSeenFilterChange('unseen')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-text">New Profiles</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stealth Mode Filter */}
        <div className="filter-group">
          <h4 className="filter-section-title">Stealth Mode</h4>
          <div className="stealth-filter">
            <CustomCheckbox
              type="stealth"
              label="Only Stealth Mode Startups"
              checked={filters.stealthMode}
              onChange={() => setFilters({...filters, stealthMode: !filters.stealthMode})}
            />
          </div>
        </div>
        
        {/* Ranking Sort Option */}
        <div className="filter-group">
          <h4 className="filter-section-title">Ranking</h4>
          <div className="ranking-filter">
            <CustomCheckbox
              type="ranking"
              label="Sort by Tier Ranking"
              checked={filters.sortByRanking}
              onChange={handleSortByRankingChange}
            />
            <p className="filter-note">Show founders in order of their tier ranking</p>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="apply-button" onClick={handleApply}>
            Apply Filters
          </button>
          <button className="clear-button" onClick={handleClear}>
            Clear All
          </button>
        </div>
      </div>
      
      {/* Add resize handle */}
      {!isMobile && (
        <div 
          className="resize-handle" 
          ref={resizeRef}
          onMouseDown={startResize}
        ></div>
      )}
    </div>
  );
};

export default FilterBar;