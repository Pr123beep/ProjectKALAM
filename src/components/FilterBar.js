// src/components/FilterBar.js
import React, { useState } from 'react';
import '../App.css';

const FilterBar = ({ onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: '',
    followersMax: '',
    sortBy: 'college'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    const cleared = {
      college: '',
      companyIndustry: '',
      currentLocation: '',
      followersMin: '',
      followersMax: '',
      sortBy: 'college'
    };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
  };

  return (
    <div className="advanced-filter-bar">
      <h3 className="filter-heading">Advanced Filters</h3>
      <div className="filter-group">
        <div className="filter-item">
          <label htmlFor="college">College:</label>
          <input
            type="text"
            id="college"
            name="college"
            value={localFilters.college}
            onChange={handleChange}
            placeholder="Search by college"
            className="filter-input"
          />
        </div>
        <div className="filter-item">
          <label htmlFor="companyIndustry">Industry:</label>
          <select
            id="companyIndustry"
            name="companyIndustry"
            value={localFilters.companyIndustry}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="">All Industries</option>
            <option value="Computer Software">Computer Software</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Higher Education">Higher Education</option>
            {/* Add more options as required */}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="currentLocation">Location:</label>
          <input
            type="text"
            id="currentLocation"
            name="currentLocation"
            value={localFilters.currentLocation}
            onChange={handleChange}
            placeholder="Search by location"
            className="filter-input"
          />
        </div>
        <div className="filter-item">
          <label htmlFor="followersMin">Min Followers:</label>
          <input
            type="number"
            id="followersMin"
            name="followersMin"
            value={localFilters.followersMin}
            onChange={handleChange}
            placeholder="0"
            className="filter-input"
          />
        </div>
        <div className="filter-item">
          <label htmlFor="followersMax">Max Followers:</label>
          <input
            type="number"
            id="followersMax"
            name="followersMax"
            value={localFilters.followersMax}
            onChange={handleChange}
            placeholder="Any"
            className="filter-input"
          />
        </div>
        <div className="filter-item">
          <label htmlFor="sortBy">Sort By:</label>
          <select
            id="sortBy"
            name="sortBy"
            value={localFilters.sortBy}
            onChange={handleChange}
            className="filter-input"
          >
            <option value="college">College</option>
            <option value="companyName">Company Name</option>
            <option value="linkedinFollowersCount">Followers Count</option>
          </select>
        </div>
      </div>
      <div className="filter-actions">
        <button className="apply-button" onClick={handleApply}>Apply Filters</button>
        <button className="clear-button" onClick={handleClear}>Clear Filters</button>
      </div>
    </div>
  );
};

export default FilterBar;
