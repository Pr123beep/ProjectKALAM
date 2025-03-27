// src/App.js
import React, { useState, useEffect } from 'react';
import { copyData } from './copyData';
import FilterBar from './components/FilterBar';
import StartupCard from './components/StartupCard';
import './App.css';

function App() {
  // State to hold the randomized and deduplicated dataset
  const [data, setData] = useState([]);
  // Advanced filters state
  const [filters, setFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: '',
    followersMax: '',
    sortBy: 'random'  // Default sort is random
  });
  // Lazy loading: initially show 5 items
  const [visibleCount, setVisibleCount] = useState(5);
  // Popup visibility state
  const [popupVisible, setPopupVisible] = useState(false);

  // On initial load: shuffle and deduplicate the data
  useEffect(() => {
    const dataToShuffle = [...copyData];
    // Fisher-Yates shuffle
    for (let i = dataToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataToShuffle[i], dataToShuffle[j]] = [dataToShuffle[j], dataToShuffle[i]];
    }
    // Deduplicate records by companyName + firstName + lastName and merge college values
    const deduped = Object.values(
      dataToShuffle.reduce((acc, item) => {
        const key = `${item.companyName}_${item.firstName}_${item.lastName}`;
        if (!acc[key]) {
          acc[key] = { ...item, colleges: [item.college] };
        } else {
          if (item.college && !acc[key].colleges.includes(item.college)) {
            acc[key].colleges.push(item.college);
          }
        }
        return acc;
      }, {})
    );
    setData(deduped);
  }, []);

  // Callback for applying filters from FilterBar
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setVisibleCount(5); // Reset lazy load count on filter change
    // Show popup notification with count update
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
  };

  const filteredData = data.filter(item => {
    const collegeStr = Array.isArray(item.colleges)
      ? item.colleges.join(' ').toLowerCase()
      : (item.college || "").toLowerCase();
    const industry = (item.companyIndustry || "").toLowerCase();
    const location = (
      item.currentLocation ||
      item.linkedinJobLocation ||
      item.linkedinPreviousJobLocation ||
      ""
    ).toLowerCase();
    const followers = item.linkedinFollowersCount || 0;
    const minFollowers = filters.followersMin ? parseInt(filters.followersMin, 10) : 0;
    const maxFollowers = filters.followersMax ? parseInt(filters.followersMax, 10) : Infinity;

    return (
      collegeStr.includes(filters.college.toLowerCase()) &&
      industry.includes(filters.companyIndustry.toLowerCase()) &&
      location.includes(filters.currentLocation.toLowerCase()) &&
      followers >= minFollowers &&
      followers <= maxFollowers
    );
  });

  // Sorting logic
  let displayedData = [...filteredData];
  if (filters.sortBy === 'random') {
    for (let i = displayedData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [displayedData[i], displayedData[j]] = [displayedData[j], displayedData[i]];
    }
  } else if (filters.sortBy === 'college') {
    displayedData.sort((a, b) => {
      const aColleges = Array.isArray(a.colleges) ? a.colleges.join(' ') : (a.college || "");
      const bColleges = Array.isArray(b.colleges) ? b.colleges.join(' ') : (b.college || "");
      return aColleges.localeCompare(bColleges);
    });
  } else if (filters.sortBy === 'companyName') {
    displayedData.sort((a, b) => (a.companyName || "").localeCompare(b.companyName || ""));
  } else if (filters.sortBy === 'linkedinFollowersCount') {
    displayedData.sort((a, b) => (b.linkedinFollowersCount || 0) - (a.linkedinFollowersCount || 0));
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <FilterBar onApplyFilters={applyFilters} />
      </aside>
      <main className="content">
        {popupVisible && (
          <div className="filter-popup">
            Found {displayedData.length} results.
          </div>
        )}
        {displayedData.length ? (
          <>
            {displayedData.slice(0, visibleCount).map((item, index) => (
              <StartupCard key={index} data={item} />
            ))}
            {visibleCount < displayedData.length && (
              <button className="load-more" onClick={handleLoadMore}>
                Load More
              </button>
            )}
          </>
        ) : (
          <p className="no-results">No matching results.</p>
        )}
      </main>
    </div>
  );
}

export default App;
