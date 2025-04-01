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

function MainPage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000,
    profileSources: {
      linkedin: true,
      wellfound: true
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const itemsPerPage = 5; // Number of cards per page
  
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

    // Then proceed with shuffling the valid data
    for (let i = validData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [validData[i], validData[j]] = [validData[j], validData[i]];
    }
    
    // Add debug logging for Reddit data
    console.log('Loading Reddit data:', iitRedditData);
    
    // Deduplicate the data and add Reddit data
    const deduped = Object.values(
      validData.reduce((acc, item) => {
        const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
        
        // Debug log for Reddit matching
        const founderName = `${item.firstName} ${item.lastName}`.toLowerCase();
        console.log('Checking Reddit mentions for:', founderName);
        
        const redditData = iitRedditData.find(redditItem => 
          redditItem.query.toLowerCase().includes(founderName)
        );
        
        console.log('Found Reddit data:', redditData);
        
        const redditUrl = redditData && 
                         redditData.results && 
                         redditData.results.length > 0 ? 
                         redditData.results[0].url : null;
        
        const isMentionedOnReddit = Boolean(redditData);

        if (!acc[key]) {
          acc[key] = { 
            ...item, 
            colleges: [item.college],
            hasWellfound: Boolean(item.wellFoundURL || item.wellFoundProfileURL),
            redditUrl,
            isMentionedOnReddit
          };
        } else {
          if (item.college && !acc[key].colleges.includes(item.college)) {
            acc[key].colleges.push(item.college);
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
    
    // Log for debugging
    console.log(`Total entries: ${wellfoundData.length}`);
    console.log(`Valid entries: ${validData.length}`);
    console.log(`Deduped entries: ${deduped.length}`);
    console.log(`Profiles with Wellfound data: ${deduped.filter(item => item.wellFoundURL || item.wellFoundProfileURL).length}`);
    console.log(`Profiles mentioned on Reddit: ${deduped.filter(item => item.isMentionedOnReddit).length}`);
    
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

  const filteredData = data.filter((item) => {
    // Source filtering logic remains unchanged
    const showLinkedIn = filters.profileSources.linkedin;
    const showWellfound = filters.profileSources.wellfound;
    const hasWellfoundData = Boolean(item.wellFoundURL || item.wellFoundProfileURL);
    
    // Apply source filtering logic (unchanged)
    if (showLinkedIn && showWellfound) {
      // Show all items when both sources are selected
    } else if (showLinkedIn && !showWellfound) {
      // Only show LinkedIn items
      if (hasWellfoundData && !item.linkedinProfileUrl) {
        return false; // Skip Wellfound-only items
      }
    } else if (!showLinkedIn && showWellfound) {
      // Only show Wellfound items
      if (!hasWellfoundData) {
        return false; // Skip items without Wellfound data
      }
    } else {
      // Neither source selected, show nothing
      return false;
    }
    
    // Enhanced college name matching using our robust matcher
    if (filters.college) {
      // Get college data from either colleges array or single college field
      const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
      
      // Use our enhanced matcher
      if (!matchesCollege(collegeData, filters.college)) {
        return false;
      }
    }
    
    // Continue with other filters
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
        {popupVisible && (
          <div className="filter-popup">
            Found {filteredData.length} results.
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
