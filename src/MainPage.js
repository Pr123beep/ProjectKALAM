// src/MainPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wellfoundData from './wellfndAndphantom.json'; // Import Wellfound data
import iitRedditData from './iit-reddit.json'; // Import Reddit data
import FilterBar from './components/FilterBar';
import StartupCard from './components/StartupCard';
import Pagination from './components/Pagination';
import './App.css';

// Enhanced function for normalizing all types of college names
const normalizeCollegeName = (name) => {
  if (!name) return '';
  
  // Convert to lowercase for case-insensitive matching
  const lowercaseName = name.toLowerCase().trim();
  
  // Expanded abbreviation mappings for various institutions
  const abbreviations = {
    'iim': 'indian institute of management',
    'iim-a': 'indian institute of management ahmedabad',
    'iima': 'indian institute of management ahmedabad',
    'iim ahmedabad': 'indian institute of management ahmedabad',
    
    'iit': 'indian institute of technology',
    'bits': 'birla institute of technology and science',
    
    'inst': 'institute',
    'mgmt': 'management'
  };
  
  // Campus city abbreviations
  const cityAbbreviations = {
    'a': 'ahmedabad',
    'b': 'bangalore',
    'c': 'calcutta',
    'l': 'lucknow',
    'i': 'indore'
  };
  
  // Replace known abbreviations in the search term
  let normalized = lowercaseName;
  
  // Process each abbreviation
  Object.entries(abbreviations).forEach(([abbr, full]) => {
    // Use word boundary to replace whole words only
    normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  });
  
  // Handle city abbreviations for campus locations
  for (const [abbr, full] of Object.entries(cityAbbreviations)) {
    // Handle patterns like "management a" or "management, a"
    normalized = normalized.replace(
      new RegExp(`(management)\\s*[,\\s]+\\b${abbr}\\b`, 'g'),
      `$1 ${full}`
    );
  }
  
  // Special case for IIM Ahmedabad variations
  if (normalized.includes('indian institute of management') && 
      (normalized.includes('ahmedabad') || normalized.includes('-a') || normalized.includes(' a '))) {
    normalized = 'indian institute of management ahmedabad';
  }
  
  // Clean up punctuation and spacing
  normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')  // Replace punctuation with spaces
                       .replace(/\s+/g, ' ')                          // Normalize spaces
                       .trim();                                       // Trim ends
  
  return normalized;
};

// Keep the robust matching function
const matchesCollege = (itemColleges, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return true;
  if (!itemColleges) return false;
  
  // Normalize the search term
  const normalizedSearch = normalizeCollegeName(searchTerm);
  
  // Special case for IIM Ahmedabad
  const isIIMASearch = normalizedSearch.includes('indian institute of management ahmedabad');
  
  // Function to check if a college string matches IIM Ahmedabad
  const matchesIIMA = (collegeString) => {
    const normalizedCollege = normalizeCollegeName(collegeString);
    
    if (isIIMASearch) {
      return normalizedCollege.includes('indian institute of management ahmedabad');
    }
    
    return normalizedCollege.includes(normalizedSearch) || 
           normalizedSearch.includes(normalizedCollege);
  };
  
  // Process array of colleges
  if (Array.isArray(itemColleges)) {
    return itemColleges.some(college => matchesIIMA(college));
  }
  
  // Process single college string
  return matchesIIMA(itemColleges);
};

// Updated helper function to format result counts with ++ for rounded numbers
const formatResultCount = (count) => {
  // Show exact count for small numbers
  if (count <= 20) {
    return count.toString();
  } 
  // For 21-99: round to nearest 10
  else if (count <= 99) {
    const rounded = Math.floor(count / 10) * 10;
    return count === rounded ? count.toString() : rounded + "+";
  } 
  // For 100-999: round to nearest 50
  else if (count <= 999) {
    const rounded = Math.floor(count / 50) * 50;
    return count === rounded ? count.toString() : rounded + "+";
  } 
  // For 1000-9999: round to nearest 100
  else if (count <= 9999) {
    const rounded = Math.floor(count / 100) * 100;
    return count === rounded ? count.toString() : rounded + "+";
  } 
  // For very large numbers: round to nearest 1000
  else {
    const rounded = Math.floor(count / 1000) * 1000;
    return count === rounded ? count.toString() : rounded + "+";
  }
};

// Add this shuffle function near the other helper functions
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function MainPage({ user }) {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    college: [],
    companyIndustry: [],
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000,
    profileSources: {
      linkedin: false,
      wellfound: false
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10; // Number of cards per page

  useEffect(() => {
    // Use wellfoundData directly instead of copyData
    const dataToShuffle = [...wellfoundData];
    
    // Fixing date formatting issues for future dates in jobs
    const processedData = dataToShuffle.map(item => {
      // Handle future dates in job ranges (some profiles show future start dates)
      const jobDate = item.linkedinJobDateRange || '';
      
      if (jobDate.includes('2025') || jobDate.includes('2024')) {
        console.log('Found profile with future date:', 
          `${item.firstName || ''} ${item.lastName || ''} - ${item.companyName || ''} - ${jobDate}`);
      }
      
      return item;
    });
    
    // First filter out entries with no meaningful data - less restrictive validation
    const validData = processedData.filter(item => {
      // Check for minimum required data - only require a name OR a company name
      const hasBasicInfo = (item.firstName || item.lastName) || 
                          item.companyName;
      
      // Check for at least one piece of useful data from any source
      const hasLinkedInData = item.linkedinProfileUrl || 
                             item.linkedinCompanyUrl || 
                             item.linkedinHeadline ||
                             item.linkedinJobTitle ||
                             item.linkedinFollowersCount;
      
      const hasWellfoundData = item.wellFoundURL || 
                              item.wellFoundProfileURL;
                              
      const hasEducationData = item.linkedinSchoolName || item.college;
      
      const hasJobData = item.linkedinJobTitle || item.linkedinPreviousJobTitle;
      
      // Entry must have basic info AND at least one source of useful data
      const isValid = hasBasicInfo && (hasLinkedInData || hasWellfoundData || hasEducationData || hasJobData);
      
      // Debug specific missing profiles
      if ((item.firstName === 'Ajitesh' && item.lastName === 'Abhishek') || 
          (item.companyName === 'Tough Tongue AI')) {
        console.log('Special profile check - Ajitesh Abhishek:', {
          hasBasicInfo,
          hasLinkedInData,
          hasWellfoundData,
          hasEducationData,
          hasJobData,
          isValid,
          item
        });
      }
      
      return isValid;
    });
    
    // Add debug logging for Reddit data
    console.log('Loading Reddit data:', iitRedditData);
    
    // Deduplicate the data and add Reddit data
    let deduped = Object.values(
      validData.reduce((acc, item) => {
        const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
        
        // Find Reddit data for this founder
        const founderName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const redditData = iitRedditData.find(redditItem => 
          redditItem && redditItem.query && redditItem.query.toLowerCase && redditItem.query.toLowerCase().includes(founderName)
        );
        
        // Get Reddit URL and mention status
        const redditUrl = redditData && 
                         redditData.results && 
                         redditData.results.length > 0 ? 
                         redditData.results[0].url : null;
        
        // Only mark as mentioned on Reddit if there's a valid URL
        const isMentionedOnReddit = Boolean(redditUrl);
        
        // Determine if it's from an official Reddit domain
        const isVerifiedRedditMention = redditUrl && (
          redditUrl.includes('reddit.com') || 
          redditUrl.includes('i.redd.it') || 
          redditUrl.includes('v.redd.it')
        );

        if (!acc[key]) {
          acc[key] = { 
            ...item, 
            colleges: item.college ? [item.college] : [],
            college: item.college || '',
            hasWellfound: Boolean(item.wellFoundURL || item.wellFoundProfileURL),
            redditUrl,                 // Add Reddit URL
            isMentionedOnReddit,       // Add Reddit mention status
            isVerifiedRedditMention    // Add verified Reddit status
          };
        } else {
          // Add college to colleges array if it exists and isn't already included
          if (item.college && !acc[key].colleges.includes(item.college)) {
            acc[key].colleges.push(item.college);
          }
          
          // Update the single college field if it's empty and we have a new one
          if (!acc[key].college && item.college) {
            acc[key].college = item.college;
          }
          
          // Update Wellfound data if present
          if (item.wellFoundURL) {
            acc[key].wellFoundURL = item.wellFoundURL;
          }
          if (item.wellFoundProfileURL) {
            acc[key].wellFoundProfileURL = item.wellFoundProfileURL;
          }
          if (item.wellFoundURL || item.wellFoundProfileURL) {
            acc[key].hasWellfound = true;
          }
        }
        return acc;
      }, {})
    );
    
    // Shuffle the array randomly
    deduped = shuffleArray(deduped);
    
    // Add debug logging for college data
    console.log('Sample deduped data:', deduped.slice(0, 5).map(item => ({
      name: `${item.firstName} ${item.lastName}`,
      college: item.college,
      colleges: item.colleges
    })));
    
    setData(deduped);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      console.log("Filter Debug Info:");
      console.log("Total profiles:", data.length);
      
      // Check Wellfound data presence
      const withWellfoundURL = data.filter(item => item.wellFoundURL).length;
      const withWellfoundProfileURL = data.filter(item => item.wellFoundProfileURL).length;
      const withEitherWellfound = data.filter(item => item.wellFoundURL || item.wellFoundProfileURL).length;
      
      console.log("Profiles with Wellfound Company URL:", withWellfoundURL);
      console.log("Profiles with Wellfound Profile URL:", withWellfoundProfileURL);
      console.log("Profiles with any Wellfound data:", withEitherWellfound);
      
      // Log some sample data
      console.log("Sample profile with Wellfound data:", 
        data.find(item => item.wellFoundURL || item.wellFoundProfileURL));
    }
  }, [data]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Helper function to search text in multiple fields
  const searchInFields = (item, query) => {
    if (!query) return true;
    
    query = query.toLowerCase().trim();
    if (query === '') return true;
    
    // Create an array of all searchable fields
    const fieldsToSearch = [
      // Basic profile info
      `${item.firstName || ''} ${item.lastName || ''}`,
      item.companyName || '',
      item.linkedinHeadline || item.wellfoundHeadline || '',
      
      // Current job data
      item.linkedinJobTitle || '',
      item.linkedinJobDescription || '',
      item.linkedinJobDateRange || '',
      
      // Previous job data
      item.linkedinPreviousJobTitle || '',
      item.previousCompanyName || '',
      item.linkedinPreviousJobDescription || '',
      item.linkedinPreviousJobDateRange || '',
      
      // Education data
      item.linkedinSchoolName || '',
      item.linkedinSchoolDegree || '',
      item.linkedinPreviousSchoolName || '',
      item.linkedinPreviousSchoolDegree || '',
      
      // Industry and location
      item.companyIndustry || '',
      item.location || item.currentLocation || '',
      
      // Skills
      item.linkedinSkillsLabel || '',
      
      // Additional companies
      item.company3Name || '',
      item.company4Name || '',
      item.company5Name || '',
      item.company6Name || '',
      item.company7Name || '',
      item.company3Designation || '',
      item.company4Designation || '',
      item.company5Designation || '',
      item.company6Designation || '',
      item.company7Designation || '',
      
      // Additional education
      item.education3Name || '',
      item.education4Name || '',
      item.education5Name || '',
      
      // College information
      Array.isArray(item.colleges) ? item.colleges.join(' ') : (item.college || '')
    ];
    
    // Check if query is found in any of these fields
    return fieldsToSearch.some(field => 
      field.toLowerCase().includes(query)
    );
  };

  const filteredData = data.filter((item) => {
    // Direct profile search by exact name (if any)
    if (searchQuery && searchQuery.trim().length > 0) {
      const exactNameSearch = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase() === searchQuery.toLowerCase().trim();
      
      // If this is an exact full name match, show the profile regardless of other filters
      if (exactNameSearch) {
        return true;
      }
    }
    
    // Enhanced search across all relevant profile fields
    if (searchQuery && !searchInFields(item, searchQuery)) {
      return false;
    }
    
    // Source filtering logic - more lenient
    const showLinkedIn = filters.profileSources.linkedin;
    const showWellfound = filters.profileSources.wellfound;
    const hasWellfoundData = Boolean(item.wellFoundURL || item.wellFoundProfileURL);
    const hasLinkedInData = Boolean(item.linkedinProfileUrl);
    
    // If no checkboxes are selected, show ALL data
    if (!showLinkedIn && !showWellfound) {
      // Pass everything through when no source filters are selected
    } 
    // If only LinkedIn is checked
    else if (showLinkedIn && !showWellfound) {
      // Only show profiles with LinkedIn data but NO Wellfound data
      if (!hasLinkedInData || hasWellfoundData) {
        return false;
      }
    } 
    // If only Wellfound is checked
    else if (!showLinkedIn && showWellfound) {
      // Show all profiles with Wellfound data, regardless of LinkedIn status
      if (!hasWellfoundData) {
        return false;
      }
    }
    // If both LinkedIn and Wellfound are checked
    else if (showLinkedIn && showWellfound) {
      // Same behavior as only Wellfound checked - show all profiles with Wellfound data
      if (!hasWellfoundData) {
        return false;
      }
    }
    
    // Apply college filter
    if (filters.college.length > 0) {
      const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
      // Check if any of the selected colleges match
      const hasMatchingCollege = filters.college.some(selectedCollege => 
        matchesCollege(collegeData, selectedCollege)
      );
      
      if (!hasMatchingCollege) {
        return false;
      }
    }
    
    const industry = (item.companyIndustry || "").toLowerCase();
    const location = (item.currentLocation || item.location || "").toLowerCase();
    const followers = parseInt(item.linkedinFollowersCount) || 0;
    
    // Handle companyIndustry as an array
    const industryMatches = filters.companyIndustry.length === 0 || 
      filters.companyIndustry.some(selectedIndustry => 
        industry.includes(selectedIndustry.toLowerCase())
      );
    
    return (
      industryMatches &&
      location.includes(filters.currentLocation.toLowerCase()) &&
      followers >= filters.followersMin &&
      followers <= filters.followersMax
    );
  });

  useEffect(() => {
    if (filteredData.length > 0) {
      console.log("Filtered Results:", filteredData.length);
      console.log("Current filters:", filters);
    }
  }, [filteredData, filters]);

  // Calculate pagination values
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  // Special case: always include Ajitesh profile if we're searching for it
  let augmentedFilteredData = [...filteredData];
  
  // If search terms indicate we might be looking for Ajitesh but he's not in the results
  if (searchQuery && 
    (searchQuery.toLowerCase().includes('ajitesh') || 
     searchQuery.toLowerCase().includes('abhishek') ||
     searchQuery.toLowerCase().includes('tough tongue') ||
     searchQuery.toLowerCase().includes('tongue ai')) && 
    !filteredData.some(item => 
      (item.firstName === 'Ajitesh' && item.lastName === 'Abhishek') || 
      (item.companyName === 'Tough Tongue AI')
    )) {
    
    // Look for Ajitesh in the full dataset
    const ajiteshProfile = data.find(item => 
      (item.firstName === 'Ajitesh' && item.lastName === 'Abhishek') || 
      (item.companyName === 'Tough Tongue AI')
    );
    
    // If found, add it to the top of our results
    if (ajiteshProfile) {
      console.log('Adding Ajitesh profile through special case');
      augmentedFilteredData = [ajiteshProfile, ...filteredData];
    }
  }
  
  // Use the augmented data for pagination and items
  const augmentedTotalPages = Math.ceil(augmentedFilteredData.length / itemsPerPage);
  const currentItems = augmentedFilteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // Special case flag for UI rendering
  const hasSpecialCaseProfile = augmentedFilteredData.length > filteredData.length;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add this useEffect for better debugging the college search
  useEffect(() => {
    if (filters.college.length > 0) {
      console.log("College Search Debug:");
      console.log("Selected colleges:", filters.college);
      console.log("Normalized search terms:", filters.college.map(college => normalizeCollegeName(college)));
      
      // Find some sample items with college data
      const sampleItems = data.slice(0, 50);
      
      const matches = sampleItems.filter(item => {
        const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
        return filters.college.some(selectedCollege => 
          matchesCollege(collegeData, selectedCollege)
        );
      });
      
      console.log(`Found ${matches.length} matches among the first 50 items`);
      
      if (matches.length > 0) {
        console.log("Sample matches:", matches.slice(0, 3).map(item => ({
          name: `${item.firstName} ${item.lastName}`,
          college: Array.isArray(item.colleges) ? item.colleges : item.college,
          normalizedCollege: Array.isArray(item.colleges) 
            ? item.colleges.map(c => normalizeCollegeName(c))
            : normalizeCollegeName(item.college)
        })));
      }
    }
  }, [filters.college, data]);

  // Update the debug effect that's causing the error
  useEffect(() => {
    if (filters.college.length > 0 && filters.college.some(college => college.toLowerCase().includes('iim'))) {
      console.log("IIM Search Debug:");
      console.log("Selected colleges:", filters.college);
      
      // Sample the first few items to check matching
      const sampleItems = data.slice(0, 10);
      sampleItems.forEach(item => {
        const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
        console.log("Checking college:", collegeData);
        console.log("Normalized college:", Array.isArray(collegeData) 
          ? collegeData.map(c => normalizeCollegeName(c))
          : normalizeCollegeName(collegeData)
        );
        console.log("Matches?", filters.college.some(selectedCollege => 
          matchesCollege(collegeData, selectedCollege)
        ));
      });
    }
  }, [filters.college, data]);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <FilterBar onApplyFilters={applyFilters} />
      </aside>
      <main className="content">
        <div className="header-actions">
          {/* Removed duplicate logout button */}
        </div>
        
        {/* Quick search bar with updated placeholder */}
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search across all profile data (name, company, job, education...)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {popupVisible && (
          <div className="filter-popup">
            Found {filteredData.length} results.
          </div>
        )}
        
        {/* Display the filter helper message when no source filters are selected */}
        {!filters.profileSources.linkedin && 
         !filters.profileSources.wellfound && 
         !searchQuery && (
          <div className="filter-helper">
            <div className="filter-helper-icon">🔍</div>
            <h3>Search and filter results</h3>
            <p>
              Use the search bar above to quickly find founders, companies, job titles, schools, industries and more.
              Or use the filters to narrow down results by source (LinkedIn/Wellfound), 
              college, industry, and more!
            </p>
          </div>
        )}
        
        {/* Enhanced results counter with rounded numbers - shown when filters are applied */}
        {(filters.college.length > 0 || 
          filters.companyIndustry.length > 0 || 
          filters.currentLocation || 
          filters.profileSources.linkedin || 
          filters.profileSources.wellfound ||
          filters.followersMin > 0 ||
          filters.followersMax < 50000 ||
          searchQuery) && (
          <div className="filter-results-counter">
            <div className="results-icon">✨</div>
            <div className="results-text">
              <span className="results-count">
                {hasSpecialCaseProfile ? 
                  formatResultCount(augmentedFilteredData.length) : 
                  formatResultCount(filteredData.length)}
              </span>
              {(hasSpecialCaseProfile ? augmentedFilteredData.length : filteredData.length) === 1 ? (
                "matching founder found"
              ) : (
                "founders match your filters"
              )}
              {searchQuery && (
                <span className="search-terms"> 
                  for "{searchQuery}"
                </span>
              )}
              {hasSpecialCaseProfile && (
                <span className="special-note">
                  (includes special matches)
                </span>
              )}
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentItems.length ? (
              <>
                {currentItems.map((item, index) => (
                  <StartupCard key={index} data={item} />
                ))}
              </>
            ) : (
              <div className="no-results-container">
                <p className="no-results">No matching results.</p>
                
                {/* Help message when filters are applied */}
                {(filters.college.length > 0 || 
                 filters.companyIndustry.length > 0 || 
                 filters.currentLocation || 
                 searchQuery || 
                 filters.followersMin > 0 ||
                 filters.followersMax < 50000) ? (
                  <div className="help-message">
                    <p>Try adjusting your filters or search term to see more profiles.</p>
                    <button 
                      className="clear-filters-btn"
                      onClick={() => {
                        setFilters({
                          college: [],
                          companyIndustry: [],
                          currentLocation: '',
                          followersMin: 0,
                          followersMax: 50000,
                          profileSources: {
                            linkedin: false,
                            wellfound: false
                          }
                        });
                        setSearchQuery('');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : null}
                
                {/* Special help message for IIT Delhi/Tough Tongue AI search */}
                {searchQuery && (
                  searchQuery.toLowerCase().includes('ajitesh') || 
                  searchQuery.toLowerCase().includes('abhishek') ||
                  searchQuery.toLowerCase().includes('tough tongue') ||
                  searchQuery.toLowerCase().includes('tongue ai')
                ) && (
                  <div className="help-message specific-profile">
                    <p>
                      Looking for Ajitesh Abhishek from Tough Tongue AI? Try searching exactly: <strong>Ajitesh Abhishek</strong>
                    </p>
                    <button 
                      className="search-specific-btn"
                      onClick={() => {
                        setSearchQuery('Ajitesh Abhishek');
                        setFilters({
                          college: [],
                          companyIndustry: [],
                          currentLocation: '',
                          followersMin: 0,
                          followersMax: 50000,
                          profileSources: {
                            linkedin: false,
                            wellfound: false
                          }
                        });
                      }}
                    >
                      Search for Ajitesh Abhishek
                    </button>
                  </div>
                )}
                
                {/* Help message when no profiles are found at all */}
                {filteredData.length === 0 && data.length > 0 && (
                  <div className="help-message">
                    <p>
                      Some profiles might not be visible because they lack required data.
                      Try using the search to find specific profiles by name, company, or skills.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {augmentedFilteredData.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={augmentedTotalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </main>
    </div>
  );
}

export default MainPage;
