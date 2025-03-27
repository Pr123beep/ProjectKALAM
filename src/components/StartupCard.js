// src/components/StartupCard.js
import React, { useState } from 'react';
import '../App.css';

const StartupCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  // Determine the college display: use merged colleges if available
  const collegeDisplay = Array.isArray(data.colleges)
    ? data.colleges.join(', ')
    : data.college;

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-name">
          <a
            href={data.linkedinProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.firstName} {data.lastName}
          </a>
          {" - "}
          <a
            href={data.linkedinCompanyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.companyName}
          </a>
        </h4>
        <p className="card-headline">{data.linkedinHeadline}</p>
      </div>
      <div className="card-info">
        <p><strong>College:</strong> {collegeDisplay}</p>
        <p><strong>Industry:</strong> {data.companyIndustry}</p>
        <p><strong>Company:</strong> {data.companyName}</p>
      </div>
      <button onClick={toggleDetails} className="card-button">
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      {showDetails && (
        <div className="card-details">
          {data.linkedinDescription ? (
            <p><strong>Description:</strong> {data.linkedinDescription}</p>
          ) : (
            <p><strong>Headline:</strong> {data.linkedinHeadline}</p>
          )}
          {data.linkedinJobDescription ? (
            <p><strong>Job Description:</strong> {data.linkedinJobDescription}</p>
          ) : (
            <p>
              <strong>Job Info:</strong> {data.linkedinPreviousJobDescription || data.linkedinJobTitle}
            </p>
          )}
          {/* You can add more fallback fields as needed */}
          {data.linkedinPreviousJobDescription && (
            <p><strong>Previous Job Description:</strong> {data.linkedinPreviousJobDescription}</p>
          )}
          {data.linkedinJobTitle && (
            <p><strong>Job Title:</strong> {data.linkedinJobTitle}</p>
          )}
          {data.location && (
            <p><strong>Location:</strong>{data.location}</p>
          )}
          
        </div>
      )}
    </div>
  );
};

export default StartupCard;
