// src/MainPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyData } from './copyData';
import wellfoundData from './wellfndAndphantom.json'; // Import Wellfound data
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
    // Indian Institutes
    'iit': 'indian institute of technology',
    'iim': 'indian institute of management',
    'nit': 'national institute of technology',
    'iiit': 'indian institute of information technology',
    'bits': 'birla institute of technology and science',
    'du': 'delhi university',
    'jnu': 'jawaharlal nehru university',
    'amu': 'aligarh muslim university',
    'bhu': 'banaras hindu university',
    'lpu': 'lovely professional university',
    'vit': 'vellore institute of technology',
    'srm': 'sri ramaswamy memorial',
    'iist': 'indian institute of space science and technology',
    'isi': 'indian statistical institute',
    'ignou': 'indira gandhi national open university',
    'nid': 'national institute of design',
    'nift': 'national institute of fashion technology',
    'nlsiu': 'national law school of india university',
    'aiims': 'all india institute of medical sciences',
    
    // US universities
    'mit': 'massachusetts institute of technology',
    'cmu': 'carnegie mellon university',
    'nyu': 'new york university',
    'ucla': 'university of california los angeles',
    'uc berkeley': 'university of california berkeley',
    'unc': 'university of north carolina',
    'upenn': 'university of pennsylvania',
    'gt': 'georgia tech',
    'gatech': 'georgia institute of technology',
    
    // UK universities
    'oxon': 'oxford',
    'cantab': 'cambridge',
    'ucl': 'university college london',
    'lse': 'london school of economics',
    'ic': 'imperial college',
    'kcl': 'kings college london',
    
    // General terms
    'univ': 'university',
    'inst': 'institute',
    'tech': 'technology',
    'coll': 'college',
    'mgmt': 'management',
    'engg': 'engineering'
  };
  
  // Campus city abbreviations
  const cityAbbreviations = {
    // Indian cities
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
    'blr': 'bangalore',
    'c': 'calcutta',
    'hyd': 'hyderabad',
    'pune': 'pune',
    'chen': 'chennai',
    'ncr': 'delhi',
    
    // US cities
    'la': 'los angeles',
    'nyc': 'new york',
    'sf': 'san francisco',
    'chi': 'chicago',
    'bos': 'boston',
    'phil': 'philadelphia',
    
    // UK cities
    'ldn': 'london',
    'manc': 'manchester',
    'edin': 'edinburgh'
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
    // Handle patterns like "university of c" or "institute, b"
    normalized = normalized.replace(
      new RegExp(`\\b(university|institute|college|school)\\s+of\\s+${abbr}\\b`, 'g'),
      `$1 of ${full}`
    );
    
    // Handle patterns like "technology b" or "technology, b"
    normalized = normalized.replace(
      new RegExp(`(technology|management|university|institute|college)\\s*[,\\s]+\\b${abbr}\\b`, 'g'),
      `$1 ${full}`
    );
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
  const searchParts = normalizedSearch.split(' ').filter(p => p.length > 1);
  
  // Function to check match score between two normalized strings
  const getMatchScore = (collegeString, searchString) => {
    // Direct inclusion is a strong match
    if (collegeString.includes(searchString)) return 1.0;
    if (searchString.includes(collegeString)) return 0.9;
    
    // Check if all significant parts of the search are in the college name
    const significantPartsMatch = searchParts.filter(part => 
      part.length > 2 && collegeString.includes(part)
    ).length;
    
    if (significantPartsMatch === searchParts.length) return 0.8;
    if (significantPartsMatch > 0) {
      return 0.5 * (significantPartsMatch / searchParts.length);
    }
    
    return 0;
  };
  
  // Process array of colleges
  if (Array.isArray(itemColleges)) {
    // Get the best match score across all colleges
    const scores = itemColleges.map(college => {
      const normalizedCollege = normalizeCollegeName(college);
      return getMatchScore(normalizedCollege, normalizedSearch);
    });
    
    // Return true if any college has a reasonable match score
    return Math.max(...scores, 0) > 0.3;
  }
  
  // Process single college string
  const normalizedCollege = normalizeCollegeName(itemColleges);
  return getMatchScore(normalizedCollege, normalizedSearch) > 0.3;
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
    const dataToShuffle = [...copyData];
    for (let i = dataToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataToShuffle[i], dataToShuffle[j]] = [dataToShuffle[j], dataToShuffle[i]];
    }
    
    // Merge the Wellfound data with our main data
    const mergedData = dataToShuffle.map(item => {
      // Check for a matching record in Wellfound data by name and company
      const match = wellfoundData.find(wf => 
        (wf.firstName && wf.lastName && 
         wf.firstName.toLowerCase() === item.firstName?.toLowerCase() && 
         wf.lastName.toLowerCase() === item.lastName?.toLowerCase()) || 
        (wf.companyName && 
         wf.companyName.toLowerCase() === item.companyName?.toLowerCase())
      );
      
      // If we found a match, add the Wellfound URLs
      if (match) {
        return {
          ...item,
          wellFoundURL: match.wellFoundURL,
          wellFoundProfileURL: match.wellFoundProfileURL,
          hasWellfound: true
        };
      }
      
      return item;
    });
    
    // Continue with existing deduplication logic
    const deduped = Object.values(
      mergedData.reduce((acc, item) => {
        const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
        if (!acc[key]) {
          acc[key] = { ...item, colleges: [item.college] };
        } else {
          if (item.college && !acc[key].colleges.includes(item.college)) {
            acc[key].colleges.push(item.college);
          }
          
          // Preserve Wellfound data through deduplication
          if (item.wellFoundURL) {
            acc[key].wellFoundURL = item.wellFoundURL;
          }
          if (item.wellFoundProfileURL) {
            acc[key].wellFoundProfileURL = item.wellFoundProfileURL;
          }
          if (item.hasWellfound) {
            acc[key].hasWellfound = true;
          }
        }
        return acc;
      }, {})
    );
    
    // Log for debugging
    console.log(`Total profiles: ${deduped.length}`);
    console.log(`Profiles with Wellfound data: ${deduped.filter(item => item.wellFoundURL || item.wellFoundProfileURL).length}`);
    
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
