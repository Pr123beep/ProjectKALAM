// src/App.js
import React, { useState, useEffect } from 'react';
import { copyData } from './copyData';
import FilterBar from './components/FilterBar';
import StartupCard from './components/StartupCard';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: 0,
    followersMax: 50000
  });
  const [visibleCount, setVisibleCount] = useState(5);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const dataToShuffle = [...copyData];
    for (let i = dataToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataToShuffle[i], dataToShuffle[j]] = [dataToShuffle[j], dataToShuffle[i]];
    }
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

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setVisibleCount(5);
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
  };

  const filteredData = data.filter((item) => {
    const collegeStr = Array.isArray(item.colleges)
      ? item.colleges.join(' ').toLowerCase()
      : (item.college || "").toLowerCase();
    const industry = (item.companyIndustry || "").toLowerCase();
    const location =
      (
        item.currentLocation ||
        item.linkedinJobLocation ||
        item.linkedinPreviousJobLocation ||
        ""
      ).toLowerCase();
    const followers = item.linkedinFollowersCount || 0;
    return (
      collegeStr.includes(filters.college.toLowerCase()) &&
      industry.includes(filters.companyIndustry.toLowerCase()) &&
      location.includes(filters.currentLocation.toLowerCase()) &&
      followers >= filters.followersMin &&
      followers <= filters.followersMax
    );
  });

  // Always randomize 
  let displayedData = [...filteredData];
  for (let i = displayedData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [displayedData[i], displayedData[j]] = [displayedData[j], displayedData[i]];
  }

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
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
