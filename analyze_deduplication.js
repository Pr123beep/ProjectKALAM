const wellfoundData = require('./src/wellfndAndphantom.json');

console.log('Total records in JSON file:', wellfoundData.length);

// Find and analyze duplicates
function analyzeDuplicates() {
  // First pass to group by key
  const groups = {};
  wellfoundData.forEach((item, index) => {
    const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
    if (!groups[key]) {
      groups[key] = [index];
    } else {
      groups[key].push(index);
    }
  });

  // Find keys with more than one entry (duplicates)
  const duplicateKeys = Object.keys(groups).filter(key => groups[key].length > 1);
  console.log('Number of unique entities with duplicates:', duplicateKeys.length);
  console.log('Total number of duplicated records:', 
    duplicateKeys.reduce((sum, key) => sum + groups[key].length - 1, 0));
  
  // Examine a few duplicates in detail
  console.log('\nExample duplicates:');
  const sampleKeys = duplicateKeys.slice(0, 3);
  sampleKeys.forEach(key => {
    console.log(`\nEntities for key: ${key}`);
    console.log(`Found ${groups[key].length} occurrences`);
    
    groups[key].forEach((index, i) => {
      const item = wellfoundData[index];
      console.log(`\nDuplicate #${i+1}:`);
      console.log(`Name: ${item.firstName} ${item.lastName}`);
      console.log(`Company: ${item.companyName}`);
      console.log(`College: ${item.college}`);
      console.log(`Wellfound URL: ${item.wellFoundURL || 'None'}`);
      console.log(`Wellfound Profile URL: ${item.wellFoundProfileURL || 'None'}`);
      console.log(`LinkedIn URL: ${item.linkedinProfileUrl || 'None'}`);
    });
  });

  // Count unique records after deduplication
  console.log('\nDeduplication summary:');
  console.log('Total original records:', wellfoundData.length);
  console.log('Unique records after deduplication:', Object.keys(groups).length);
  console.log('Records removed in deduplication:', wellfoundData.length - Object.keys(groups).length);

  // Check if the counts match the observed issue
  console.log('\nCounts for verification:');
  console.log('Original count:', wellfoundData.length);
  console.log('Count after deduplication:', Object.keys(groups).length);
  console.log('Expected dashboard count:', Object.keys(groups).length);
  console.log('Reported dashboard count:', 2143);
  console.log('Difference:', Object.keys(groups).length - 2143);
}

analyzeDuplicates(); 