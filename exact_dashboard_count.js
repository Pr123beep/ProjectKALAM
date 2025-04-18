const wellfoundData = require('./src/wellfndAndphantom.json');
// Let's also read the IIT Reddit data to replicate full functionality
const iitRedditData = require('./src/iit-reddit.json');

console.log('Total records in JSON file:', wellfoundData.length);

// Helper functions replicated from MainPage.js
function shuffleArray(array) {
  // We don't need to actually shuffle for counting purposes
  return array;
}

function searchInFields(item, query) {
  // Replicate search functionality for completeness
  const searchQuery = query.toLowerCase();
  const fieldsToSearch = [
    item.firstName,
    item.lastName,
    `${item.firstName} ${item.lastName}`,
    item.companyName,
    item.college,
    item.linkedinHeadline,
    item.linkedinJobTitle,
    item.companyIndustry,
    item.currentLocation || item.location
  ];
  
  return fieldsToSearch.some(field => 
    field && field.toString().toLowerCase().includes(searchQuery)
  );
}

// Replicate the exact dashboard display count
function getExactDashboardCount() {
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
    
    return isValid;
  });
  
  console.log('Profiles after initial validation:', validData.length);
  
  // Deduplicate the data and add Reddit data
  const deduped = Object.values(
    validData.reduce((acc, item) => {
      const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
      
      // Find Reddit data for this founder
      const founderName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const redditData = iitRedditData.find(redditItem => 
        redditItem.query && redditItem.query.toLowerCase().includes(founderName)
      );
      
      // Get Reddit URL and mention status
      const redditUrl = redditData && 
                       redditData.results && 
                       redditData.results.length > 0 ? 
                       redditData.results[0].url : null;
      
      const isMentionedOnReddit = Boolean(redditData);
      
      // Is the mention verified?
      const isVerifiedRedditMention = isMentionedOnReddit && 
                                    redditData.results && 
                                    redditData.results.length > 0 && 
                                    redditData.results[0].verified === true;
      
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
  
  console.log('Profiles after deduplication:', deduped.length);
  
  // Apply default filters (the ones initially active on dashboard)
  // We'll use empty filters to see all data
  const filters = {
    college: [],
    companyIndustry: [],
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000,
    profileSources: {
      linkedin: false,
      wellfound: false
    }
  };
  const searchQuery = '';
  
  // Apply filters
  const filteredData = deduped.filter((item) => {
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
      // Simplified for this test
      return false;
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
  
  console.log('Filtered profiles (with initial filters):', filteredData.length);
  console.log('Expected dashboard count:', filteredData.length);
  console.log('Reported dashboard count:', 2143);
  console.log('Difference:', filteredData.length - 2143);
  
  // Let's analyze the potential missing profiles
  if (filteredData.length > 0) {
    // Check for any null company names (which might cause display issues)
    const nullCompanyNames = filteredData.filter(item => item.companyName === null);
    console.log('\nProfiles with null company names:', nullCompanyNames.length);
    
    // List the null company name profiles
    if (nullCompanyNames.length > 0) {
      console.log('Profiles with null company names:');
      nullCompanyNames.forEach(item => {
        console.log(`- ${item.firstName} ${item.lastName}`);
      });
    }
  }
  
  return filteredData.length;
}

getExactDashboardCount(); 