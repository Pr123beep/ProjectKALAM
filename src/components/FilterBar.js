// src/components/FilterBar.js
import React, { useState } from 'react';
import '../App.css';
import './FilterBar.css';

const FilterBar = ({ onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    college: '',
    companyIndustry: '',
    currentLocation: '',
    followersMin: '0',
    followersMax: '50000'
  });

  // New state for profile source filters
  const [profileSources, setProfileSources] = useState({
    linkedin: true,
    wellfound: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSourceChange = (source) => {
    setProfileSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleApply = () => {
    onApplyFilters({
      ...localFilters,
      followersMin: parseInt(localFilters.followersMin, 10),
      followersMax: parseInt(localFilters.followersMax, 10),
      profileSources
    });
  };

  const handleClear = () => {
    const cleared = {
      college: '',
      companyIndustry: '',
      currentLocation: '',
      followersMin: '0',
      followersMax: '50000'
    };
    setLocalFilters(cleared);
    onApplyFilters({
      ...cleared,
      followersMin: 0,
      followersMax: 50000,
      profileSources: {
        linkedin: true,
        wellfound: true
      }
    });
  };

  return (
    <div className="advanced-filter-bar">
      <h3 className="filter-heading">Decontaminators!</h3>
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
            <option value="Information Technology & Services">Information Technology & Services</option>
            <option value="Hospital & Health Care">Hospital & Health Care</option>
            <option value="Marketing & Advertising">Marketing & Advertising</option>
            <option value="Professional Training & Coaching">Professional Training & Coaching</option>
            {/* Add more options as needed */}
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
        <div className="filter-item" style={{ width: '100%' }}>
          <label>Followers Range:</label>
          <div className="range-inputs">
            <input
              type="number"
              name="followersMin"
              value={localFilters.followersMin}
              onChange={handleChange}
              placeholder="Min"
              className="filter-input"
            />
            <input
              type="number"
              name="followersMax"
              value={localFilters.followersMax}
              onChange={handleChange}
              placeholder="Max"
              className="filter-input"
            />
          </div>
        </div>
      </div>
      <div className="filter-section">
        <h3>Profile Source</h3>
        <div className="profile-source-filters">
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={profileSources.linkedin}
              onChange={() => handleSourceChange('linkedin')}
            />
            <span className="checkbox-icon"></span>
            <span className="checkbox-label">LinkedIn</span>
          </label>
          
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={profileSources.wellfound}
              onChange={() => handleSourceChange('wellfound')}
            />
            <span className="checkbox-icon"></span>
            <span className="checkbox-label">Wellfound</span>
          </label>
        </div>
      </div>
      <div className="filter-actions">
        <button className="apply-button" onClick={handleApply}>
          Apply Filters
        </button>
        <button className="clear-button" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
