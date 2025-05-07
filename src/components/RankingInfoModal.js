import React from 'react';
import { motion } from 'framer-motion';
import './RankingInfoModal.css';

// Icon components
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RankingInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="ranking-info-overlay" onClick={onClose}>
      <motion.div 
        className="ranking-info-modal"
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
        <motion.button 
          className="close-button" 
          onClick={onClose}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CloseIcon />
        </motion.button>

        <div className="ranking-info-header">
          <h2>Ranking Tiers Explanation</h2>
          <p>This explains how we rank founders based on their background and experience.</p>
        </div>

        <div className="ranking-info-content">
          <div className="ranking-info-section">
            <h3>Rule-Based Ranking Overview (50% of total score)</h3>
            <p>Each component contributes to 50% (or 0.5) of the total score.</p>
            
            <table className="ranking-weight-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Weight (out of 0.5)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>School Background</td>
                  <td>20% → 0.2</td>
                </tr>
                <tr>
                  <td>Company Background</td>
                  <td>18% → 0.18</td>
                </tr>
                <tr>
                  <td>Job Title</td>
                  <td>12% → 0.12</td>
                </tr>
                <tr className="total-row">
                  <td>Total</td>
                  <td>50% → 0.5</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ranking-info-section">
            <h3>College Prestige - 8 Tiers</h3>
            <div className="ranking-info-image-container">
              <img 
                src="/collegeTiers.png" 
                alt="College Prestige Tier Chart" 
                className="ranking-info-image"
              />
            </div>
          </div>

          <div className="ranking-info-section">
            <h3>Company Prestige - 8 Tiers</h3>
            <div className="ranking-info-image-container">
              <img 
                src="/companyTiers.png" 
                alt="Company Prestige Tier Chart" 
                className="ranking-info-image"
              />
            </div>
          </div>

          <div className="ranking-info-section">
            <h3>Job Title Prestige - 8 Tiers</h3>
            <div className="ranking-info-image-container">
              <img 
                src="/jobTiers.png" 
                alt="Job Title Prestige Tier Chart" 
                className="ranking-info-image"
              />
            </div>
          </div>

          <div className="ranking-info-section">
            <p className="ranking-note">
              Note: Founders who are still students may not have full-time professional experience, 
              so scoring them on company pedigree the same way as experienced professionals would be unfair. 
              We treat student founders as a separate track, and assign scores based on the quality of 
              internships, programs, and initiatives they've been part of, rather than full-time company history.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RankingInfoModal; 