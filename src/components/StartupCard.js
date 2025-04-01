"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactDOM from "react-dom"; // Import ReactDOM for createPortal
import iitRedditData from "../iit-reddit.json";

import "../App.css";
import "./StartupCard.css";

// Icon components
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const CompanyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EducationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const WorkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const SkillsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Replace the current WellfoundIcon component with this updated version
const WellfoundIcon = () => (
  <img 
    src="/wellfound.png" 
    alt="Wellfound" 
    style={{ width: '16px', height: '16px', borderRadius: '2px', verticalAlign: 'middle' }}
  />
);

// Replace the existing formatDescriptionAsList function with this enhanced version
const formatEnhancedDescription = (text) => {
  if (!text) return null;
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Extract introduction (first paragraph)
  const introduction = paragraphs[0];
  
  // Extract key points from the text
  const keyPoints = extractKeyPoints(text, paragraphs);
  
  // Extract skills
  const skills = extractSkills(text);
  
  return (
    <div className="enhanced-profile-content">
      {/* Introduction section */}
      <div className="profile-section">
        <h3 className="profile-section-title">📝 About</h3>
        <p className="profile-introduction">{introduction}</p>
      </div>
      
      {/* Key Points section */}
      {keyPoints.length > 0 && (
        <div className="profile-section">
          <h3 className="profile-section-title">🔑 Key Highlights</h3>
          <ul className="profile-points-list">
            {keyPoints.map((point, idx) => (
              <li key={idx} className="profile-point-item">
                <span className="profile-point-icon">✅</span>
                <span className="profile-point-text">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Skills section */}
      {skills.length > 0 && (
        <div className="profile-section">
          <h3 className="profile-section-title">🛠️ Expertise</h3>
          <div className="profile-skills-grid">
            {skills.map((skill, idx) => (
              <div key={idx} className="profile-skill-badge">
                <span className="profile-skill-icon">🔹</span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Connection prompt */}
      <div className="profile-connect-prompt">
        <span className="connect-emoji">🤝</span> Interested in connecting? Check out their profile for more details.
      </div>
    </div>
  );
};

// Extract meaningful key points from the text
const extractKeyPoints = (text, paragraphs) => {
  const keyPoints = [];
  
  // Look for bullet points in the text
  const bulletPointRegex = /[•\-*]\s*([^•\-*\n]+)/g;
  const matches = [...text.matchAll(bulletPointRegex)];
  
  if (matches.length > 0) {
    // If explicit bullet points exist, use them
    matches.forEach(match => {
      const point = match[1].trim();
      if (point.length > 10 && !keyPoints.includes(point)) {
        keyPoints.push(point);
      }
    });
  } else {
    // Otherwise extract sentences that seem important
    const sentences = text.split(/\.\s+/);
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Look for sentences that might be key points
      if (trimmed.length > 15 && 
          trimmed.length < 150 && 
          (trimmed.includes('expertise') || 
           trimmed.includes('specializ') || 
           trimmed.includes('focus') || 
           trimmed.includes('experience') ||
           trimmed.includes('skill') ||
           trimmed.includes('responsible'))) {
        keyPoints.push(trimmed);
      }
    });
  }
  
  // Return up to 5 unique key points
  return [...new Set(keyPoints)].slice(0, 5);
};

// Extract skills from the text
const extractSkills = (text) => {
  // Look for skills section
  const skillsSection = text.toLowerCase().includes('skills') ? 
    text.substring(text.toLowerCase().indexOf('skills')) : text;
  
  // Common professional skills to look for
  const skillKeywords = [
    'management', 'leadership', 'strategy', 'marketing', 'sales', 'finance',
    'development', 'programming', 'design', 'analysis', 'research', 'product',
    'engineering', 'operations', 'consulting', 'data', 'AI', 'machine learning',
    'blockchain', 'cloud', 'negotiation', 'communication', 'presentation'
  ];
  
  const foundSkills = [];
  
  // Look for skill keywords in the text
  skillKeywords.forEach(skill => {
    if (skillsSection.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(capitalizeFirstLetter(skill));
    }
  });
  
  // If not enough skills found, try to extract from bullet points
  if (foundSkills.length < 5) {
    const bulletPointRegex = /[•\-*]\s*([^•\-*\n]+)/g;
    const matches = [...skillsSection.matchAll(bulletPointRegex)];
    
    matches.forEach(match => {
      const point = match[1].trim();
      if (point.length < 30 && !foundSkills.includes(point)) {
        foundSkills.push(capitalizeFirstLetter(point));
      }
    });
  }
  
  return [...new Set(foundSkills)].slice(0, 8); // Return up to 8 unique skills
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Add back the simple description formatter for job positions
const formatSimpleDescription = (text) => {
  if (!text) return null;
  
  // Basic paragraph formatting
  return (
    <div className="simple-description">
      {text.split(/\n\n+/).map((paragraph, idx) => (
        <p key={idx} className="description-paragraph">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

const StartupCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Apply a more aggressive approach to blocking the page, but allow modal scrolling
  useEffect(() => {
    if (showDetails) {
      // Lock the body
      document.body.classList.add('body-no-scroll');
      
      // Instead of blocking all events, only block them outside the modal
      document.addEventListener('touchmove', preventScrollOutsideModal, { passive: false });
      document.addEventListener('wheel', preventScrollOutsideModal, { passive: false });
    } else {
      document.body.classList.remove('body-no-scroll');
      document.removeEventListener('touchmove', preventScrollOutsideModal);
      document.removeEventListener('wheel', preventScrollOutsideModal);
    }
    
    return () => {
      document.body.classList.remove('body-no-scroll');
      document.removeEventListener('touchmove', preventScrollOutsideModal);
      document.removeEventListener('wheel', preventScrollOutsideModal);
    };
  }, [showDetails]);

  // Only prevent scroll events if they're outside the modal
  const preventScrollOutsideModal = (e) => {
    // Check if the event target is within the modal
    const modalElement = document.querySelector('.detail-modal');
    if (modalElement && !modalElement.contains(e.target)) {
      e.preventDefault();
    }
  };

  const toggleDetails = (e) => {
    // Prevent event bubbling
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Only toggle if not already in transition
    if (!isToggling) {
      setIsToggling(true);
      
      // Use requestAnimationFrame for smoother timing
      requestAnimationFrame(() => {
        setShowDetails((prev) => !prev);
        
        // Reset toggle flag after the animation duration
        setTimeout(() => {
          setIsToggling(false);
        }, 350); // Slightly longer than animation duration
      });
    }
  };

  // Determine the college display: use merged colleges if available
  const collegeDisplay = Array.isArray(data.colleges)
    ? data.colleges.join(", ")
    : data.college || "Not specified";
    const founderName = `${data.firstName} ${data.lastName}`.toLowerCase();

    // Find the Reddit data for this founder and extract URL if available
    const redditData = iitRedditData.find(item => 
      item.query.toLowerCase().includes(founderName)
    );

    const redditUrl = redditData && 
                      redditData.results && 
                      redditData.results.length > 0 ? 
                      redditData.results[0].url : null;

    const isMentionedOnReddit = Boolean(redditData);

  return (
    <div className="card">
      {/* Source badge */}
      {data.source && (
        <div className={`source-badge ${data.source}`}>
          {data.source === 'linkedin' ? 'LinkedIn' : 'Wellfound'}
        </div>
      )}
      
      {/* Basic info shown on the card */}
      <div className="card-header">
        <h4 className="card-name">
          {/* Founder name and Wellfound profile link */}
          <a 
            href={data.linkedinProfileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {data.firstName} {data.lastName}
          </a>
          
          {/* Wellfound profile link if available - on founder name ONLY */}
          {data.wellFoundProfileURL && (
            <a 
              href={data.wellFoundProfileURL}
              target="_blank" 
              rel="noopener noreferrer"
              className="wellfound-badge"
              title="View on Wellfound"
            >
              <WellfoundIcon />
            </a>
          )}
          
          {" - "}
          
          {/* Company link - only LinkedIn URL */}
          <a 
            href={data.linkedinCompanyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {data.companyName}
          </a>
        </h4>
        <p className="card-headline">{data.linkedinHeadline || data.wellfoundHeadline}</p>
      </div>

      <div className="card-info">
        <p>
          <strong>College:</strong> {collegeDisplay}
        </p>
        <p>
          <strong>Industry:</strong> {data.companyIndustry || "Not specified"}
        </p>
        <p>
          <strong>Company:</strong> {data.companyName}
        </p>
        {/* Add console.log to debug college data */}
        {console.log('College data:', {
          colleges: data.colleges,
          college: data.college,
          display: Array.isArray(data.colleges) ? data.colleges.join(", ") : data.college
        })}
        
        {/* Reddit mention button */}
        {isMentionedOnReddit && (
          <div 
            className="reddit-mention" 
            onClick={() => redditUrl && window.open(redditUrl, "_blank")}
            style={{ cursor: redditUrl ? 'pointer' : 'default' }}
            title={redditUrl ? "Click to view Reddit discussion" : "Mentioned on Reddit"}
          >
            <strong>
              {/* Reddit icon is added via CSS ::before pseudo-element */}
              Mentioned on Reddit
            </strong>
            {/* Add a small indicator if there's a clickable link */}
            {redditUrl && <span className="reddit-link-indicator">→</span>}
          </div>
        )}
      </div>

      <button onClick={toggleDetails} className="card-button">
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      {/* The modal with details - now using createPortal */}
      {showDetails && 
        ReactDOM.createPortal(
          <div className="modal-root" key="detail-modal-portal">
            <motion.div 
              className="detail-overlay" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleDetails}
            >
              <motion.div
                className="detail-modal no-animation"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button in top-right corner with animation */}
                <motion.button 
                  className="close-button" 
                  onClick={toggleDetails}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CloseIcon />
                </motion.button>

                {/* Modal Header with staggered animation */}
                <motion.div 
                  className="modal-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Rest of the header content */}
                  <div className="profile-info">
                    {/* Source badge with animation */}
                    {data.source && (
                      <motion.div 
                        className={`source-badge ${data.source}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        {data.source === 'linkedin' ? 'LinkedIn' : 'Wellfound'}
                      </motion.div>
                    )}
                    
                    {/* Avatar with animation */}
                    <motion.div 
                      className="profile-avatar"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {data.firstName?.charAt(0)}
                      {data.lastName?.charAt(0)}
                    </motion.div>
                    
                    <div className="profile-main">
                      {/* Name with animation */}
                      <motion.h2 
                        className="profile-name"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        {data.firstName} {data.lastName}
                      </motion.h2>
                      
                      {/* Headline with animation */}
                      <motion.p 
                        className="profile-headline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        {data.linkedinHeadline || data.wellfoundHeadline}
                      </motion.p>
                      
                      {/* Location with animation */}
                      {data.location && (
                        <motion.p 
                          className="profile-location"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          <LocationIcon /> {data.location}
                        </motion.p>
                      )}
                      
                      {/* Modal profile links section */}
                      <motion.div 
                        className="profile-links"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        {/* LinkedIn profile link */}
                        {data.linkedinProfileUrl && (
                          <a 
                            href={data.linkedinProfileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="profile-link linkedin-link"
                          >
                            <LinkedInIcon /> View LinkedIn Profile
                          </a>
                        )}
                        
                        {/* Wellfound profile link */}
                        {data.wellFoundProfileURL && (
                          <a 
                            href={data.wellFoundProfileURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="profile-link wellfound-link"
                          >
                            <WellfoundIcon /> View Wellfound Profile
                          </a>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Modal Content with section-by-section reveal */}
                <motion.div 
                  className="modal-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Wrap each section in a motion.div for staggered appearance */}
                  {/* Example for the first section */}
                  {data.linkedinDescription && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {formatEnhancedDescription(data.linkedinDescription)}
                    </motion.div>
                  )}

                  {/* Current Position */}
                  {(data.currentJob || data.linkedinJobTitle || data.companyName) && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="section-title">
                        <WorkIcon /> Current Position
                      </h3>
                      <div className="detail-card">
                        <h4>
                          {data.linkedinJobTitle || "Professional"} at{" "}
                          {data.companyName}
                        </h4>
                        {data.linkedinJobDateRange && (
                          <p className="date-range">{data.linkedinJobDateRange}</p>
                        )}
                        {data.linkedinJobLocation && (
                          <p className="job-location">
                            <LocationIcon /> {data.linkedinJobLocation}
                          </p>
                        )}
                        {data.linkedinJobDescription && (
                          <div className="detail-section">
                            {formatSimpleDescription(data.linkedinJobDescription)}
                          </div>
                        )}
                        {data.companyIndustry && (
                          <p className="industry">
                            Industry: {data.companyIndustry}
                          </p>
                        )}
                        {/* Company links in a separate section */}
                        <div className="company-links">
                          {data.linkedinCompanyUrl && (
                            <a
                              href={data.linkedinCompanyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="company-link"
                            >
                              <CompanyIcon /> View on LinkedIn
                            </a>
                          )}
                          
                          {/* Only show Wellfound company URL in the company section, not next to company name */}
                          {data.wellFoundURL && (
                            <a
                              href={data.wellFoundURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="company-link wellfound-company"
                            >
                              <CompanyIcon /> View on Wellfound
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Previous Position */}
                  {(data.previousJob ||
                    data.linkedinPreviousJobTitle ||
                    data.previousCompanyName) && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="section-title">
                        <WorkIcon /> Previous Position
                      </h3>
                      <div className="detail-card">
                        <h4>
                          {data.linkedinPreviousJobTitle || "Professional"}
                          {data.previousCompanyName && ` at ${data.previousCompanyName}`}
                        </h4>
                        {data.linkedinPreviousJobDateRange && (
                          <p className="date-range">
                            {data.linkedinPreviousJobDateRange}
                          </p>
                        )}
                        {data.linkedinPreviousJobLocation && (
                          <p className="job-location">
                            <LocationIcon /> {data.linkedinPreviousJobLocation}
                          </p>
                        )}
                        {data.linkedinPreviousJobDescription && (
                          <div className="detail-section">
                            {formatSimpleDescription(data.linkedinPreviousJobDescription)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Education */}
                  {(data.currentSchool || data.linkedinSchoolName || collegeDisplay) && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="section-title">
                        <EducationIcon /> Education
                      </h3>
                      <div className="detail-card">
                        <h4>{data.linkedinSchoolName || collegeDisplay}</h4>
                        {data.linkedinSchoolDegree && (
                          <p className="degree">{data.linkedinSchoolDegree}</p>
                        )}
                        {data.linkedinSchoolDateRange && (
                          <p className="date-range">{data.linkedinSchoolDateRange}</p>
                        )}
                        {data.linkedinSchoolDescription && (
                          <div className="detail-section">
                            {formatSimpleDescription(data.linkedinSchoolDescription)}
                          </div>
                        )}
                        {data.linkedinSchoolUrl && (
                          <a
                            href={data.linkedinSchoolUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="school-link"
                          >
                            School Page
                          </a>
                        )}
                      </div>

                      {/* Previous School */}
                      {data.previousSchool && (
                        <div className="detail-card">
                          <h4>{data.linkedinPreviousSchoolName}</h4>
                          {data.linkedinPreviousSchoolDegree && (
                            <p className="degree">
                              {data.linkedinPreviousSchoolDegree}
                            </p>
                          )}
                          {data.linkedinPreviousSchoolDateRange && (
                            <p className="date-range">
                              {data.linkedinPreviousSchoolDateRange}
                            </p>
                          )}
                          {data.linkedinPreviousSchoolDescription && (
                            <div className="detail-section">
                              {formatSimpleDescription(data.linkedinPreviousSchoolDescription)}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Skills */}
                  {data.linkedinSkillsLabel && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h3 className="section-title">
                        <SkillsIcon /> Skills
                      </h3>
                      <div className="skills-container">
                        {data.linkedinSkillsLabel.split(",").map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Followers */}
                  {data.linkedinFollowersCount && (
                    <motion.div 
                      className="detail-section followers"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <h3 className="section-title">LinkedIn Network</h3>
                      <p>
                        <strong>{data.linkedinFollowersCount}</strong> followers
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default StartupCard;
