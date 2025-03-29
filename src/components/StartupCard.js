"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "../App.css"
import "./StartupCard.css"

// Icon components
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
)

const CompanyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const EducationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
  </svg>
)

const WorkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
)

const SkillsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
)

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const StartupCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails((prev) => !prev)
  }

  // Determine the college display: use merged colleges if available
  const collegeDisplay = Array.isArray(data.colleges) ? data.colleges.join(", ") : data.college

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-name">
          <a href={data.linkedinProfileUrl} target="_blank" rel="noopener noreferrer">
            {data.firstName} {data.lastName}
          </a>
          {" - "}
          <a href={data.linkedinCompanyUrl} target="_blank" rel="noopener noreferrer">
            {data.companyName}
          </a>
        </h4>
        <p className="card-headline">{data.linkedinHeadline}</p>
      </div>
      <div className="card-info">
        <p>
          <strong>College:</strong> {collegeDisplay}
        </p>
        <p>
          <strong>Industry:</strong> {data.companyIndustry}
        </p>
        <p>
          <strong>Company:</strong> {data.companyName}
        </p>
      </div>
      <button onClick={toggleDetails} className="card-button">
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleDetails}
          >
            <motion.div
              className="detail-modal"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-button" onClick={toggleDetails}>
                <CloseIcon />
              </button>

              <div className="modal-header">
                <div className="profile-info">
                  <div className="profile-avatar">
                    {data.firstName?.charAt(0)}
                    {data.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2>
                      {data.firstName} {data.lastName}
                    </h2>
                    <p className="headline">{data.linkedinHeadline}</p>
                    {data.location && (
                      <p className="location">
                        <LocationIcon /> {data.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="social-links">
                  {data.linkedinProfileUrl && (
                    <a
                      href={data.linkedinProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link linkedin"
                    >
                      <LinkedInIcon /> Profile
                    </a>
                  )}
                </div>
              </div>

              <div className="modal-content">
                {data.linkedinDescription && (
                  <div className="detail-section">
                    <h3>About</h3>
                    <p>{data.linkedinDescription}</p>
                  </div>
                )}

                {/* Current Job Section */}
                {(data.currentJob || data.linkedinJobTitle || data.companyName) && (
                  <div className="detail-section">
                    <h3>
                      <WorkIcon /> Current Position
                    </h3>
                    <div className="detail-card">
                      <h4>
                        {data.linkedinJobTitle || "Professional"} at {data.companyName}
                      </h4>
                      {data.linkedinJobDateRange && <p className="date-range">{data.linkedinJobDateRange}</p>}
                      {data.linkedinJobLocation && (
                        <p className="job-location">
                          <LocationIcon /> {data.linkedinJobLocation}
                        </p>
                      )}
                      {data.linkedinJobDescription && <p className="description">{data.linkedinJobDescription}</p>}
                      {data.companyIndustry && <p className="industry">Industry: {data.companyIndustry}</p>}
                      {data.linkedinCompanyUrl && (
                        <a
                          href={data.linkedinCompanyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-link"
                        >
                          <CompanyIcon /> Company Page
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Previous Job Section */}
                {(data.previousJob || data.linkedinPreviousJobTitle || data.previousCompanyName) && (
                  <div className="detail-section">
                    <h3>
                      <WorkIcon /> Previous Position
                    </h3>
                    <div className="detail-card">
                      <h4>
                        {data.linkedinPreviousJobTitle || "Professional"}{" "}
                        {data.previousCompanyName && `at ${data.previousCompanyName}`}
                      </h4>
                      {data.linkedinPreviousJobDateRange && (
                        <p className="date-range">{data.linkedinPreviousJobDateRange}</p>
                      )}
                      {data.linkedinPreviousJobLocation && (
                        <p className="job-location">
                          <LocationIcon /> {data.linkedinPreviousJobLocation}
                        </p>
                      )}
                      {data.linkedinPreviousJobDescription && (
                        <p className="description">{data.linkedinPreviousJobDescription}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {(data.currentSchool || data.linkedinSchoolName || collegeDisplay) && (
                  <div className="detail-section">
                    <h3>
                      <EducationIcon /> Education
                    </h3>
                    <div className="detail-card">
                      <h4>{data.linkedinSchoolName || collegeDisplay}</h4>
                      {data.linkedinSchoolDegree && <p className="degree">{data.linkedinSchoolDegree}</p>}
                      {data.linkedinSchoolDateRange && <p className="date-range">{data.linkedinSchoolDateRange}</p>}
                      {data.linkedinSchoolDescription && (
                        <p className="description">{data.linkedinSchoolDescription}</p>
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
                          <p className="degree">{data.linkedinPreviousSchoolDegree}</p>
                        )}
                        {data.linkedinPreviousSchoolDateRange && (
                          <p className="date-range">{data.linkedinPreviousSchoolDateRange}</p>
                        )}
                        {data.linkedinPreviousSchoolDescription && (
                          <p className="description">{data.linkedinPreviousSchoolDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Section */}
                {data.linkedinSkillsLabel && (
                  <div className="detail-section">
                    <h3>
                      <SkillsIcon /> Skills
                    </h3>
                    <div className="skills-container">
                      {data.linkedinSkillsLabel.split(",").map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Followers Count */}
                {data.linkedinFollowersCount && (
                  <div className="detail-section followers">
                    <h3>LinkedIn Network</h3>
                    <p>
                      <strong>{data.linkedinFollowersCount}</strong> followers
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StartupCard

