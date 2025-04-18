const wellfoundData = require('./src/wellfndAndphantom.json');

console.log('Total records in JSON file:', wellfoundData.length);

// Function to count valid profiles based on the filtering criteria from MainPage.js
function countValidProfiles() {
  // First filter out entries with no meaningful data - less restrictive validation
  const validData = wellfoundData.filter(item => {
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
  console.log('Profiles filtered out:', wellfoundData.length - validData.length);

  // Count profiles removed by each validation criteria
  const missingBasicInfo = wellfoundData.filter(item => 
    !((item.firstName || item.lastName) || item.companyName)
  ).length;

  console.log('Profiles missing basic info (name or company):', missingBasicInfo);

  const missingUsefulData = wellfoundData.filter(item => {
    const hasBasicInfo = (item.firstName || item.lastName) || item.companyName;
    
    const hasLinkedInData = item.linkedinProfileUrl || 
                           item.linkedinCompanyUrl || 
                           item.linkedinHeadline ||
                           item.linkedinJobTitle ||
                           item.linkedinFollowersCount;
    
    const hasWellfoundData = item.wellFoundURL || 
                            item.wellFoundProfileURL;
                            
    const hasEducationData = item.linkedinSchoolName || item.college;
    
    const hasJobData = item.linkedinJobTitle || item.linkedinPreviousJobTitle;
    
    return hasBasicInfo && !(hasLinkedInData || hasWellfoundData || hasEducationData || hasJobData);
  }).length;

  console.log('Profiles with basic info but missing useful data:', missingUsefulData);

  // Deduplicate the data
  const keyMap = {};
  const dedupedData = validData.reduce((acc, item) => {
    const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
    if (!keyMap[key]) {
      keyMap[key] = true;
      acc.push(item);
    }
    return acc;
  }, []);

  console.log('Profiles after deduplication:', dedupedData.length);
  console.log('Duplicate profiles removed:', validData.length - dedupedData.length);

  return dedupedData.length;
}

const finalCount = countValidProfiles();
console.log('Final profile count that should appear on dashboard:', finalCount); 