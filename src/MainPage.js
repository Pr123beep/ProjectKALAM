// src/MainPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { copyData } from './copyData';
import FilterBar from './components/FilterBar';
import StartupCard from './components/StartupCard';
import Pagination from './components/Pagination';
import './App.css';

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
    setCurrentPage(1); // Reset to first page when filters change
    setPopupVisible(true);
    setTimeout(() => {
      setPopupVisible(false);
    }, 3000);
  };

  const filteredData = data.filter((item) => {
    // Check if profile source matches selected filters
    const isProfileSourceMatch = (
      (filters.profileSources.linkedin && item.source === 'linkedin') || 
      (filters.profileSources.wellfound && item.source === 'wellfound') ||
      // If source isn't specified, show by default when both are selected
      (!item.source && (filters.profileSources.linkedin || filters.profileSources.wellfound))
    );
    
    // Continue with existing filters
    const collegeStr = Array.isArray(item.colleges)
      ? item.colleges.join(' ').toLowerCase()
      : (item.college || "").toLowerCase();
    const industry = (item.companyIndustry || "").toLowerCase();
    const location = (item.currentLocation || item.location || "").toLowerCase();
    const followers = parseInt(item.linkedinFollowersCount) || 0;
    
    return (
      isProfileSourceMatch &&
      collegeStr.includes(filters.college.toLowerCase()) &&
      industry.includes(filters.companyIndustry.toLowerCase()) &&
      location.includes(filters.currentLocation.toLowerCase()) &&
      followers >= filters.followersMin &&
      followers <= filters.followersMax
    );
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
