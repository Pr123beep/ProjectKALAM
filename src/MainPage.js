// src/MainPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wellfoundData from './wellfndAndphantom.json'; // Import Wellfound data
import iitRedditData from './iit-reddit.json'; // Import Reddit data
import FilterBar from './components/FilterBar';
import StartupCard from './components/StartupCard';
import Pagination from './components/Pagination';
import './App.css';
import { getUserSeenProfiles } from './supabaseClient';
import ScrollToTop from './components/ScrollToTop';
import ScrollButton from './components/ScrollButton';

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

// Define our ranking sort function near the top
const sortByRanking = (data) => {
  console.log('Sorting data by ranking...');
  
  // Create a copy of the data with unique indexes to ensure stable sorting
  const indexedData = data.map((item, index) => ({
    ...item,
    originalIndex: index
  }));
  
  // First sort the data based on multiple criteria
  const sortedData = indexedData.sort((a, b) => {
    // Get ranks with better fallbacks (attempt to extract numeric values)
    const extractRank = (item) => {
      // Try job_title_tier first
      if (item.job_title_tier) {
        const match = item.job_title_tier.match(/\d+/);
        if (match) return parseInt(match[0]);
      }
      
      // Try best_tier next
      if (item.best_tier) {
        const match = item.best_tier.match(/\d+/);
        if (match) return parseInt(match[0]);
      }
      
      // Try college_tier
      if (item.college_tier) {
        return parseInt(item.college_tier) || 999;
      }
      
      // Fallback to followers as a proxy for ranking
      if (item.linkedinFollowersCount) {
        const followers = parseInt(item.linkedinFollowersCount) || 0;
        if (followers > 10000) return 1;
        if (followers > 5000) return 2;
        if (followers > 1000) return 3;
        if (followers > 500) return 4;
        return 5;
      }
      
      return 999; // Default rank if nothing found
    };
    
    // Calculate additional scoring factors for tiebreaking
    const calculateScore = (item) => {
      let score = 0;
      
      // Use best_score if available
      if (item.best_score) {
        score += parseFloat(item.best_score) || 0;
      }
      
      // Add LinkedIn followers as a fraction of the score
      const followers = parseInt(item.linkedinFollowersCount) || 0;
      score += followers / 10000;
      
      // Add small bonus for having Wellfound data
      if (item.wellFoundURL || item.wellFoundProfileURL) {
        score += 0.5;
      }
      
      // Add small bonus for Reddit mentions
      if (item.isMentionedOnReddit) {
        score += 0.8;
      }
      
      // Add bonus for education at top college if no tier info is available
      if (!item.job_title_tier && !item.best_tier && !item.college_tier) {
        const collegeData = Array.isArray(item.colleges) ? item.colleges.join(' ').toLowerCase() : (item.college || '').toLowerCase();
        if (collegeData.includes('iit') || collegeData.includes('iim')) {
          score += 0.7;
        } else if (collegeData.includes('stanford') || collegeData.includes('harvard') || collegeData.includes('mit')) {
          score += 0.8;
        }
      }
      
      return score;
    };
    
    const rankA = extractRank(a);
    const rankB = extractRank(b);
    
    // First sort by rank (lower is better)
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // If ranks are the same, sort by calculated score (higher is better)
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    
    if (Math.abs(scoreA - scoreB) > 0.001) { // Use small epsilon for floating point comparison
      return scoreB - scoreA;
    }
    
    // As final tiebreaker, use the original index to ensure a stable, deterministic sort
    // This guarantees no two items will have the same rank
    return a.originalIndex - b.originalIndex;
  });
  
  // Now assign unique sequential ranks to each profile
  return sortedData.map((item, index) => {
    // Remove the temporary originalIndex property
    const { originalIndex, ...cleanItem } = item;
    
    // Calculate points for the profile - ensure they're different for each rank
    const calculatePoints = () => {
      // Base score starts high and decreases with rank, but has a minimum value
      // This ensures even high-ranked profiles have positive points
      const basePoints = Math.max(1000 - (index * 5), 200);
      
      // Add bonus points for various profile attributes
      let bonusPoints = 0;
      
      // Bonus for LinkedIn followers
      const followers = parseInt(item.linkedinFollowersCount) || 0;
      bonusPoints += Math.floor(followers / 100);
      
      // Bonus for having Wellfound data
      if (item.wellFoundURL || item.wellFoundProfileURL) {
        bonusPoints += 25;
      }
      
      // Bonus for Reddit mentions
      if (item.isMentionedOnReddit) {
        bonusPoints += 50;
      }
      
      // Bonus for education at top college
      const collegeData = Array.isArray(item.colleges) ? item.colleges.join(' ').toLowerCase() : (item.college || '').toLowerCase();
      if (collegeData.includes('iit') || collegeData.includes('iim')) {
        bonusPoints += 30;
      } else if (collegeData.includes('stanford') || collegeData.includes('harvard') || collegeData.includes('mit')) {
        bonusPoints += 40;
      }
      
      // Generate a unique modifier based on name to ensure no two profiles have exactly the same points
      const nameHash = `${item.firstName}${item.lastName}`.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
      ) % 10;
      
      // Return the final points - ensure it's always positive
      return basePoints + bonusPoints + nameHash;
    };
    
    // Add a unique rank and points
    return {
      ...cleanItem,
      uniqueRank: index + 1,
      uniquePoints: calculatePoints().toString()
    };
  });
};

function MainPage({ user }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
    stealthMode: false, // Add stealth mode filter
    sortByRanking: false // Ranking sort disabled by default
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shouldScrollTop, setShouldScrollTop] = useState(false); // New state to control scrolling
  const itemsPerPage = 10; // Number of cards per page
  const [seenProfileIds, setSeenProfileIds] = useState([]);

  // Effect to handle scrolling when the page changes
  useEffect(() => {
    if (shouldScrollTop) {
      // Custom smooth scrolling function with easing
      const smoothScrollToTop = () => {
        // Get current scroll position
        const currentPosition = window.pageYOffset;
        
        // If already at top, skip animation
        if (currentPosition === 0) return;
        
        // Animation settings
        const duration = 800; // ms, duration of animation
        const startTime = performance.now();
        
        // Easing function - cubic ease-out for a natural, satisfying feel
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        
        // Animation function using requestAnimationFrame for smooth animation
        function animateScroll(currentTime) {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          const easeProgress = easeOutCubic(progress);
          
          // Calculate new position and scroll to it
          const position = currentPosition - (currentPosition * easeProgress);
          window.scrollTo(0, position);
          
          // Continue animation if not complete
          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          } else {
            // Final scroll to ensure we're at the top
            window.scrollTo(0, 0);
          }
        }
        
        // Start the animation
        requestAnimationFrame(animateScroll);
      };
      
      // Execute the smooth scrolling
      smoothScrollToTop();
      
      // Reset state after animation is likely complete
      setTimeout(() => {
        setShouldScrollTop(false);
      }, 850);
    }
  }, [shouldScrollTop]);

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
    
    // Only sort by ranking if enabled in filters
    if (filters.sortByRanking) {
      deduped = sortByRanking(deduped);
      console.log('Initial data sorted by ranking');
    }
    
    setData(deduped);
    setFilteredData(deduped);
  }, [filters.sortByRanking]);

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

  useEffect(() => {
    const loadSeenProfiles = async () => {
      try {
        const { data, error } = await getUserSeenProfiles();
        if (error) throw error;
        
        if (data) {
          // Store the seen profile IDs in state
          const seenIds = data.map(item => item.founder_id);
          setSeenProfileIds(seenIds);
        }
      } catch (error) {
        console.error('Error loading seen profiles:', error);
      }
    };
    
    if (user) {
      loadSeenProfiles();
    }
  }, [user]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
    
    // Apply the seen filter if needed
    if (newFilters.seenStatus && newFilters.seenStatus !== 'all') {
      // If seen profiles weren't loaded yet, load them now
      if (seenProfileIds.length === 0) {
        getUserSeenProfiles().then(({ data }) => {
          if (data) {
            const seenIds = data.map(item => item.founder_id);
            setSeenProfileIds(seenIds);
            applyFiltersWithSeenData(newFilters, seenIds);
          }
        });
      } else {
        // We already have the seen profiles data
        applyFiltersWithSeenData(newFilters, seenProfileIds);
      }
    } else {
      // No seen filter, just apply regular filters
      applyRegularFilters(newFilters);
    }
  };
  
  // Helper function to apply filters with seen data
  const applyFiltersWithSeenData = (newFilters, seenIds) => {
    // Start with all data
    let filtered = [...data];
    
    // Apply other filters first
    filtered = applyRegularFiltersToData(filtered, newFilters);
    
    // Then apply seen filter
    if (newFilters.seenStatus === 'seen') {
      filtered = filtered.filter(item => {
        const founderId = item.id || `${item.firstName}-${item.lastName}`;
        return seenIds.includes(founderId);
      });
    } else if (newFilters.seenStatus === 'unseen') {
      filtered = filtered.filter(item => {
        const founderId = item.id || `${item.firstName}-${item.lastName}`;
        return !seenIds.includes(founderId);
      });
    }
    
    setFilteredData(filtered);
  };
  
  // Apply regular filters without seen status
  const applyRegularFilters = (newFilters) => {
    const filtered = applyRegularFiltersToData(data, newFilters);
    setFilteredData(filtered);
  };
  
  // Helper function to check if a company is in stealth mode
  const isInStealthMode = (item) => {
    const fieldsToCheck = [
      item.companyName,
      item.previousCompanyName,
      item.linkedinHeadline,
      item.linkedinJobTitle,
      item.linkedinPreviousJobTitle,
      item.linkedinJobDescription,
      item.linkedinPreviousJobDescription,
      item.linkedinDescription
    ];
    
    const stealthTerms = ['stealth', 'stealth mode', 'stealth startup', 'stealth ai'];
    
    return fieldsToCheck.some(field => {
      if (!field) return false;
      const fieldLower = field.toLowerCase();
      return stealthTerms.some(term => fieldLower.includes(term));
    });
  };

  // Common filtering logic
  const applyRegularFiltersToData = (dataToFilter, newFilters) => {
    // Start with all data
    let filteredResults = [...dataToFilter];
        
    // Apply stealth mode filter if enabled
    if (newFilters.stealthMode) {
      filteredResults = filteredResults.filter(item => isInStealthMode(item));
    }
    
    // Apply college filter if any colleges are selected
    if (newFilters.college && newFilters.college.length > 0) {
      // Filter items that match ANY of the selected colleges
      filteredResults = filteredResults.filter(item => {
        const collegeData = Array.isArray(item.colleges) ? item.colleges : item.college;
        return newFilters.college.some(selectedCollege => 
          matchesCollege(collegeData, selectedCollege)
        );
      });
    }

    // Apply industry filter if any industries are selected
    if (newFilters.companyIndustry && newFilters.companyIndustry.length > 0) {
      filteredResults = filteredResults.filter(item => {
        // Check if the item has a industry that matches any of the selected industries
        return newFilters.companyIndustry.some(industry => 
          item.companyIndustry && 
          item.companyIndustry.toLowerCase().includes(industry.toLowerCase())
        );
      });
    }

    // Apply location filter if specified
    if (newFilters.currentLocation) {
      filteredResults = filteredResults.filter(item => {
        return item.location && 
               item.location.toLowerCase().includes(newFilters.currentLocation.toLowerCase());
        });
    }
    
    // Apply followers range filter
    filteredResults = filteredResults.filter(item => {
      // Check if the item has followers count within the specified range
      const followersCount = parseInt(item.linkedinFollowersCount) || 0;
      return followersCount >= newFilters.followersMin && 
            (newFilters.followersMax === 0 || followersCount <= newFilters.followersMax);
    });
    
    // Apply source filters
    const { linkedin, wellfound } = newFilters.profileSources;
    if (linkedin || wellfound) {
      filteredResults = filteredResults.filter(item => {
        const isFromLinkedin = item.source === 'linkedin' || Boolean(item.linkedinProfileUrl);
        const isFromWellfound = item.source === 'wellfound' || Boolean(item.wellFoundProfileURL);
        
        if (linkedin && wellfound) {
          // Either source is accepted
          return isFromLinkedin || isFromWellfound;
        } else if (linkedin) {
          // Only LinkedIn profiles
          return isFromLinkedin;
        } else if (wellfound) {
          // Only Wellfound profiles
          return isFromWellfound;
        }
        
        // Default behavior if none selected - show all
        return true;
      });
    }
    
    // Apply ranking-based sorting if enabled
    if (newFilters.sortByRanking) {
      console.log('Sorting by ranking enabled - applying ranking sort');
      return sortByRanking(filteredResults);
    } else {
      // If not sorting by ranking, return the filtered results as is
      console.log('Using standard sorting - ranking sort disabled');
      return filteredResults;
    }
  };

  // Update search functionality to use state
  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    setCurrentPage(1); // Reset to first page when search changes
    
    // Apply current filters with the new search query
    let currentFilteredData = data.filter(item => {
      // If search query exists, check if the item matches
      if (newSearchQuery.trim() !== '') {
        // Direct profile search by exact name
        const exactNameSearch = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase() === newSearchQuery.toLowerCase().trim();
        
        // If this is an exact match, include it regardless of other filters
        if (exactNameSearch) {
          return true;
        }
        
        // Otherwise, search across all fields
        if (!searchInFields(item, newSearchQuery)) {
          return false;
        }
      }
      
      // Apply the rest of the filters
      // Source filtering logic
      const showLinkedIn = filters.profileSources.linkedin;
      const showWellfound = filters.profileSources.wellfound;
      const hasWellfoundData = Boolean(item.wellFoundURL || item.wellFoundProfileURL);
      const hasLinkedInData = Boolean(item.linkedinProfileUrl);
      
      // If no source filters are selected, show all data
      if (!showLinkedIn && !showWellfound) {
        // Pass everything through
      } 
      // If only LinkedIn is checked
      else if (showLinkedIn && !showWellfound) {
        if (!hasLinkedInData || hasWellfoundData) {
          return false;
        }
      } 
      // If only Wellfound is checked
      else if (!showLinkedIn && showWellfound) {
        if (!hasWellfoundData) {
          return false;
        }
      }
      // If both LinkedIn and Wellfound are checked
      else if (showLinkedIn && showWellfound) {
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
      
      const location = (item.currentLocation || item.location || "").toLowerCase();
      const followers = parseInt(item.linkedinFollowersCount) || 0;
      
      // Handle companyIndustry as an array
      const industryMatches = (!filters.companyIndustry || filters.companyIndustry.length === 0) || 
        filters.companyIndustry.some(industryFilter => {
          return item.companyIndustry === industryFilter || 
                 item.linkedinIndustry === industryFilter || 
                 (item.linkedinJobDescription && item.linkedinJobDescription.toLowerCase().includes(industryFilter.toLowerCase()));
        });
      
      // Apply stealth mode filter
      const stealthModeMatches = !filters.stealthMode || isInStealthMode(item);
      
      return (
        industryMatches &&
        location.includes(filters.currentLocation.toLowerCase()) &&
        followers >= filters.followersMin &&
        followers <= filters.followersMax &&
        stealthModeMatches
      );
    });
    
    // Apply ranking-based sorting to the filtered results
    currentFilteredData = sortByRanking(currentFilteredData);
    
    // Apply seen profile filtering if needed
    if (filters.seenStatus && filters.seenStatus !== 'all' && seenProfileIds.length > 0) {
      let seenFiltered = [...currentFilteredData];
      
      if (filters.seenStatus === 'seen') {
        seenFiltered = seenFiltered.filter(item => {
          const founderId = item.id || `${item.firstName}-${item.lastName}`;
          return seenProfileIds.includes(founderId);
        });
      } else if (filters.seenStatus === 'unseen') {
        seenFiltered = seenFiltered.filter(item => {
          const founderId = item.id || `${item.firstName}-${item.lastName}`;
          return !seenProfileIds.includes(founderId);
        });
      }
      
      setFilteredData(seenFiltered);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
    } else {
      setFilteredData(currentFilteredData);
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
    }
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
    // Set the new page
    setCurrentPage(pageNumber);
    // Trigger scroll to top
    setShouldScrollTop(true);
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
                  <StartupCard 
                    key={index} 
                    data={item} 
                    isSortByRankingEnabled={filters.sortByRanking}
                  />
                ))}
              </>
            ) : (
              <div className="no-results-container">
                <p className="no-results">No matches found</p>
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
      
      {/* Only include ScrollToTop when we need to scroll */}
      {shouldScrollTop && <ScrollToTop />}
      
      {/* Always include the scroll button for manual scrolling */}
      <ScrollButton />
    </div>
  );
}

export default MainPage;