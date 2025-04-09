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
    // Core IIM abbreviations
    'iim': 'indian institute of management',
    'iim-a': 'indian institute of management ahmedabad',
    'iima': 'indian institute of management ahmedabad',
    'iim ahmedabad': 'indian institute of management ahmedabad',
    
    // Keep existing IIT mappings
    'iit': 'indian institute of technology',
    'bits': 'birla institute of technology and science',
    
    // General terms
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
    return count === rounded ? count.toString() : `${rounded}++`;
  } 
  // For 100-999: round to nearest 50
  else if (count <= 999) {
    const rounded = Math.floor(count / 50) * 50;
    return count === rounded ? count.toString() : `${rounded}++`;
  } 
  // For 1000-9999: round to nearest 100
  else if (count <= 9999) {
    const rounded = Math.floor(count / 100) * 100;
    return count === rounded ? count.toString() : `${rounded}++`;
  } 
  // For very large numbers: round to nearest 1000
  else {
    const rounded = Math.floor(count / 1000) * 1000;
    return count === rounded ? count.toString() : `${rounded}++`;
  }
};

function MainPage({ user }) {
  const [data, setData] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10; // Number of cards per page

  useEffect(() => {
    // Use wellfoundData directly instead of copyData
    const dataToShuffle = [...wellfoundData];
    
    // First filter out entries with no meaningful data
    const validData = dataToShuffle.filter(item => {
      // Check for minimum required data
      const hasBasicInfo = item.firstName && 
                          item.lastName && 
                          item.companyName;
      
      // Check for at least one source of data
      const hasLinkedInData = item.linkedinProfileUrl || 
                             item.linkedinCompanyUrl || 
                             item.linkedinHeadline;
      
      const hasWellfoundData = item.wellFoundURL || 
                               item.wellFoundProfileURL;
      
      // Entry must have basic info AND at least one source of data
      return hasBasicInfo && (hasLinkedInData || hasWellfoundData);
    });

  
    
    // Add debug logging for Reddit data
    console.log('Loading Reddit data:', iitRedditData);
    
    // Deduplicate the data and add Reddit data
    const deduped = Object.values(
      validData.reduce((acc, item) => {
        const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
        
        // Find Reddit data for this founder
        const founderName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const redditData = iitRedditData.find(redditItem => 
          redditItem.query.toLowerCase().includes(founderName)
        );
        
        // Get Reddit URL and mention status
        const redditUrl = redditData && 
                         redditData.results && 
                         redditData.results.length > 0 ? 
                         redditData.results[0].url : null;
        
        const isMentionedOnReddit = Boolean(redditData);

        if (!acc[key]) {
          acc[key] = { 
            ...item, 
            colleges: item.college ? [item.college] : [],
            college: item.college || '',
            hasWellfound: Boolean(item.wellFoundURL || item.wellFoundProfileURL),
            redditUrl,           // Add Reddit URL
            isMentionedOnReddit  // Add Reddit mention status
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

  const filteredData = data.filter((item) => {
    // Quick search filtering (prioritize this for performance)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const founderName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const companyName = (item.companyName || '').toLowerCase();
      
      if (!founderName.includes(query) && !companyName.includes(query)) {
        return false;
      }
    }
    
    // Source filtering logic
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
    
    // Apply other filters only to profiles that passed the source filter
    if (filters.college) {
      const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
      if (!matchesCollege(collegeData, filters.college)) {
        return false;
      }
    }
    
    const industry = (item.companyIndustry || "").toLowerCase();
    const location = (item.currentLocation || item.location || "").toLowerCase();
    const followers = parseInt(item.linkedinFollowersCount) || 0;
    
    return (
      industry.includes(filters.companyIndustry.toLowerCase()) &&
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
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add this useEffect for better debugging the college search
  useEffect(() => {
    if (filters.college) {
      console.log("College Search Debug:");
      console.log("Original search term:", filters.college);
      console.log("Normalized search term:", normalizeCollegeName(filters.college));
      
      // Find some sample items with college data
      const sampleItems = data.slice(0, 50);
      
      const matches = sampleItems.filter(item => {
        const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
        return matchesCollege(collegeData, filters.college);
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
      } else {
        // If no matches, show some sample college entries
        console.log("No matches found. Sample college entries from data:", 
          sampleItems.slice(0, 5).map(item => ({
            college: Array.isArray(item.colleges) ? item.colleges : item.college,
            normalized: Array.isArray(item.colleges) 
              ? item.colleges.map(c => normalizeCollegeName(c))
              : normalizeCollegeName(item.college)
          }))
        );
      }
    }
  }, [filters.college, data]);

  // Add debug logging to help track the matching process
  useEffect(() => {
    if (filters.college && filters.college.toLowerCase().includes('iim')) {
      console.log("IIM Search Debug:");
      console.log("Search term:", filters.college);
      console.log("Normalized search term:", normalizeCollegeName(filters.college));
      
      // Sample the first few items to check matching
      const sampleItems = data.slice(0, 10);
      sampleItems.forEach(item => {
        const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
        console.log("Checking college:", collegeData);
        console.log("Normalized college:", Array.isArray(collegeData) 
          ? collegeData.map(c => normalizeCollegeName(c))
          : normalizeCollegeName(collegeData)
        );
        console.log("Matches?", matchesCollege(collegeData, filters.college));
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
        
        {/* Quick search bar */}
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by founder or company name..."
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
              Use the search bar above to quickly find founders or companies, or use 
              the filters to narrow down results by source (LinkedIn/Wellfound), 
              college, industry, and more!
            </p>
          </div>
        )}
        
        {/* Enhanced results counter with rounded numbers - shown when filters are applied */}
        {(filters.college || 
          filters.companyIndustry || 
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
                {formatResultCount(filteredData.length)}
              </span>
              {filteredData.length === 1 ? (
                "matching founder found"
              ) : (
                "founders match your filters"
              )}
              {searchQuery && (
                <span className="search-terms"> 
                  for "{searchQuery}"
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
              <p className="no-results">No matching results.</p>
            )}
          </motion.div>
        </AnimatePresence>
        
        {filteredData.length > 0 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        )}
      </main>
    </div>
  );
}

export default MainPage;
