const wellfoundData = require('./src/wellfndAndphantom.json');

console.log('Total records in JSON file:', wellfoundData.length);

function findMissingProfiles() {
  // Apply the same filtering and deduplication logic as in MainPage.js
  // First filter out entries with no meaningful data
  const validData = wellfoundData.filter(item => {
    const hasBasicInfo = (item.firstName || item.lastName) || 
                        item.companyName;
    
    const hasLinkedInData = item.linkedinProfileUrl || 
                           item.linkedinCompanyUrl || 
                           item.linkedinHeadline ||
                           item.linkedinJobTitle ||
                           item.linkedinFollowersCount;
    
    const hasWellfoundData = item.wellFoundURL || 
                            item.wellFoundProfileURL;
                            
    const hasEducationData = item.linkedinSchoolName || item.college;
    
    const hasJobData = item.linkedinJobTitle || item.linkedinPreviousJobTitle;
    
    const isValid = hasBasicInfo && (hasLinkedInData || hasWellfoundData || hasEducationData || hasJobData);
    
    return isValid;
  });

  console.log('Profiles after initial validation:', validData.length);
  
  // Deduplicate using the same key method
  const deduped = {};
  validData.forEach(item => {
    const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
    
    if (!deduped[key]) {
      deduped[key] = { 
        ...item, 
        colleges: item.college ? [item.college] : [],
        college: item.college || '',
        hasWellfound: Boolean(item.wellFoundURL || item.wellFoundProfileURL)
      };
    } else {
      // Existing logic to merge duplicate records
      if (item.college && !deduped[key].colleges.includes(item.college)) {
        deduped[key].colleges.push(item.college);
      }
      
      if (!deduped[key].college && item.college) {
        deduped[key].college = item.college;
      }
      
      if (item.wellFoundURL) {
        deduped[key].wellFoundURL = item.wellFoundURL;
      }
      if (item.wellFoundProfileURL) {
        deduped[key].wellFoundProfileURL = item.wellFoundProfileURL;
      }
      if (item.wellFoundURL || item.wellFoundProfileURL) {
        deduped[key].hasWellfound = true;
      }
    }
  });
  
  const dedupedArray = Object.values(deduped);
  console.log('Profiles after deduplication:', dedupedArray.length);
  
  // Check for potential issues that might filter out 3 more profiles
  
  // 1. Check for profiles without first or last name and company name
  const missingNames = dedupedArray.filter(item => 
    (!item.firstName && !item.lastName) || !item.companyName
  );
  console.log('\nProfiles missing names:', missingNames.length);
  if (missingNames.length > 0) {
    console.log('Sample profiles missing names:');
    missingNames.slice(0, 3).forEach(item => {
      console.log({
        firstName: item.firstName,
        lastName: item.lastName,
        companyName: item.companyName,
        key: `${item.companyName}_${item.firstName}_${item.lastName}`
      });
    });
  }
  
  // 2. Check for profiles without any valid URLs or data fields
  const missingUrls = dedupedArray.filter(item => 
    !item.linkedinProfileUrl && 
    !item.linkedinCompanyUrl && 
    !item.wellFoundURL && 
    !item.wellFoundProfileURL
  );
  console.log('\nProfiles missing all URLs:', missingUrls.length);
  if (missingUrls.length > 0) {
    console.log('Sample profiles missing URLs:');
    missingUrls.slice(0, 3).forEach(item => {
      console.log({
        name: `${item.firstName} ${item.lastName}`,
        company: item.companyName,
        linkedinProfileUrl: item.linkedinProfileUrl,
        linkedinCompanyUrl: item.linkedinCompanyUrl,
        wellFoundURL: item.wellFoundURL,
        wellFoundProfileURL: item.wellFoundProfileURL
      });
    });
  }
  
  // 3. Check for profiles with empty strings as values
  const emptyStrings = dedupedArray.filter(item => 
    (item.firstName === '' && item.lastName === '') || 
    item.companyName === ''
  );
  console.log('\nProfiles with empty strings for critical fields:', emptyStrings.length);
  if (emptyStrings.length > 0) {
    console.log('Sample profiles with empty strings:');
    emptyStrings.slice(0, 3).forEach(item => {
      console.log({
        firstName: item.firstName,
        lastName: item.lastName,
        companyName: item.companyName
      });
    });
  }

  // 4. Check for profiles with special characters or unusual patterns
  const specialChars = dedupedArray.filter(item => {
    const companyPattern = /^[^a-zA-Z0-9]/; // Companies starting with special chars
    return companyPattern.test(item.companyName);
  });
  console.log('\nProfiles with company names starting with special characters:', specialChars.length);
  if (specialChars.length > 0) {
    console.log('Sample profiles with special characters:');
    specialChars.slice(0, 3).forEach(item => {
      console.log({
        name: `${item.firstName} ${item.lastName}`,
        company: item.companyName
      });
    });
  }
  
  // Summary of potential problematic profiles
  const potentialIssues = new Set([
    ...missingNames.map(item => `${item.companyName}_${item.firstName}_${item.lastName}`),
    ...missingUrls.map(item => `${item.companyName}_${item.firstName}_${item.lastName}`),
    ...emptyStrings.map(item => `${item.companyName}_${item.firstName}_${item.lastName}`),
    ...specialChars.map(item => `${item.companyName}_${item.firstName}_${item.lastName}`)
  ]);
  
  console.log('\nTotal profiles with potential issues:', potentialIssues.size);
  console.log('Expected dashboard count after removing these:', dedupedArray.length - potentialIssues.size);
  console.log('Reported dashboard count:', 2143);
  console.log('Difference after accounting for issues:', (dedupedArray.length - potentialIssues.size) - 2143);
}

findMissingProfiles(); 