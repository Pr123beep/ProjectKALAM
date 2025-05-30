//src/components/StartupCard.js
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import ReactDOM from "react-dom"; 
import iitRedditData from "../iit-reddit.json";
import { generateFounderSummary } from "../utils/geminiApi";
import LabelButton from './LabelButton';
import RankingBadge from './RankingBadge';
import RankingDetails from './RankingDetails';


import { markProfileAsSeen, isProfileSeen, markProfileAsUnseen, getProfileLabels } from '../supabaseClient';

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

const WellfoundIcon = () => (
  <img 
    src="/wellfound.png" 
    alt="Wellfound" 
    style={{ width: '16px', height: '16px', borderRadius: '2px', verticalAlign: 'middle' }}
  />
);

const formatEnhancedDescription = (text) => {
  if (!text) return null;
  
  const paragraphs = text.split(/\n\n+/);
  
  const introduction = paragraphs[0];
  
  const keyPoints = extractKeyPoints(text, paragraphs);
  
  const skills = extractSkills(text);
  
  return (
    <div className="enhanced-profile-content">
      <div className="profile-section">
        <h3 className="profile-section-title">📝 About</h3>
        <p className="profile-introduction">{introduction}</p>
      </div>
      
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
      
      <div className="profile-connect-prompt">
        <span className="connect-emoji">🤝</span> Interested in connecting? Check out their profile for more details.
      </div>
    </div>
  );
};

const extractKeyPoints = (text, paragraphs) => {
  const keyPoints = [];
  
  const bulletPointRegex = /[•\-*]\s*([^•\-*\n]+)/g;
  const matches = [...text.matchAll(bulletPointRegex)];
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const point = match[1].trim();
      if (point.length > 10 && !keyPoints.includes(point)) {
        keyPoints.push(point);
      }
    });
  } else {
    const sentences = text.split(/\.\s+/);
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
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
  
  return [...new Set(keyPoints)].slice(0, 5);
};

const extractSkills = (text) => {
  const skillsSection = text.toLowerCase().includes('skills') ? 
    text.substring(text.toLowerCase().indexOf('skills')) : text;
  
  const skillKeywords = [
    'management', 'leadership', 'strategy', 'marketing', 'sales', 'finance',
    'development', 'programming', 'design', 'analysis', 'research', 'product',
    'engineering', 'operations', 'consulting', 'data', 'AI', 'machine learning',
    'blockchain', 'cloud', 'negotiation', 'communication', 'presentation'
  ];
  
  const foundSkills = [];
  
  skillKeywords.forEach(skill => {
    if (skillsSection.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(capitalizeFirstLetter(skill));
    }
  });
  
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
  
  return [...new Set(foundSkills)].slice(0, 8); 
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatSimpleDescription = (text) => {
  if (!text) return null;
  
  return (
    <div className="simple-description">
      {text.split(/\n\n+/).map((paragraph, idx) => (
        <motion.p 
          key={idx} 
          className="description-paragraph"
          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1 * idx,
            ease: "easeOut" 
          }}
        >
          {paragraph}
        </motion.p>
      ))}
    </div>
  );
};

const getFollowersBadgeClass = (followersCount) => {
  if (followersCount <= 100) return 'followers-low';
  if (followersCount <= 500) return 'followers-medium';
  if (followersCount <= 2000) return 'followers-high';
  if (followersCount <= 10000) return 'followers-very-high';
  return 'followers-ultra';
};

// Calculate ranking with fallbacks
// const calculateRanking = (item) => {
//   if (!item) return { rank: null, tier: null, score: null };
  
//   // Debug logging for specific profiles
//   if (item.firstName === 'Atharv' && item.lastName === 'Kaushik') {
//     console.log('Profile data for Atharv:', item);
//   }

//   // Use the uniqueRank property if it exists (from sortByRanking function)
//   if (item.uniqueRank) {
//     // For profiles with uniqueRank, determine tier based on rank
//     const tierNumber = item.uniqueRank <= 3 ? 1 : 
//                       item.uniqueRank <= 10 ? 2 :
//                       item.uniqueRank <= 30 ? 3 :
//                       item.uniqueRank <= 100 ? 4 : 5;
    
//     return { 
//       rank: item.uniqueRank, 
//       tier: `Tier ${tierNumber}`, 
//       score: item.uniquePoints || item.best_score || (item.job_title_score ? parseInt(item.job_title_score) : null) || '5'
//     };
//   }

  // FALLBACK SYSTEM: Even without ranking data, assign a rank based on available data
  
  // 1. Try to get ranking from explicit ranking fields
  // if (item.job_title_tier || item.best_tier) {
  //   const tier = item.best_tier || item.job_title_tier;
  //   const tierNumber = tier ? parseInt(tier.replace(/\D/g, '')) || 5 : 5;
  //   const score = item.best_score || (item.job_title_score ? parseInt(item.job_title_score) : null) || '5';
    
  //   return { 
  //     rank: tierNumber, 
  //     tier: `Tier ${tierNumber}`, 
  //     score: score 
  //   };
  // }
  
  // // 2. Fallback: Use followers count to assign a rank if no explicit ranking
  // if (item.linkedinFollowersCount) {
  //   const followers = parseInt(item.linkedinFollowersCount) || 0;
  //   let rank = 5;
    
  //   if (followers > 10000) rank = 1;
  //   else if (followers > 5000) rank = 2;
  //   else if (followers > 1000) rank = 3;
  //   else if (followers > 500) rank = 4;
    
  //   return { 
  //     rank: rank, 
  //     tier: `Tier ${rank}`, 
  //     score: followers.toString() 
  //   };
  // }
  
  // 3. Final fallback: Always return a rank (everyone is ranked)
  // Generate a consistent pseudo-random rank based on name
//   const nameHash = `${item.firstName}${item.lastName}`.split('').reduce(
//     (acc, char) => acc + char.charCodeAt(0), 0
//   );
  
//   const rank = (nameHash % 10) + 1; // Rank between 1-10
  
//   return { 
//     rank: rank, 
//     tier: `Tier ${Math.min(rank + 2, 8)}`, 
//     score: (rank * 2).toString()
//   };
// };

const StartupCard = ({
  data,
  inSeenProfilesPage,
  isSortByRankingEnabled,
  initiallyExpanded = false,    // ← new prop, default false
  modalOnly = false,
  onClose = () => {},
}) => {
  
  // initialize showDetails from the prop
  const [showDetails, setShowDetails] = useState(initiallyExpanded);
  const [isToggling, setIsToggling] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showRankingDetails, setShowRankingDetails] = useState(false);

  const [summaryError, setSummaryError] = useState(null);
  const [isSeen, setIsSeen] = useState(false);
  const [hasLabels, setHasLabels] = useState(false);
  const [profileLabels, setProfileLabels] = useState([]);

  const handleExternalLinkClick = () => {
        if (!isSeen) {
          markProfileAsSeen(data)
            .then(() => setIsSeen(true))
            .catch(console.error);
        }
      };
  

  // if the prop flips to true later, make sure we open
  useEffect(() => {
    if (initiallyExpanded) {
      setShowDetails(true);
    }
  }, [initiallyExpanded]);

  const founderKey = useMemo(() => {
    return `${data.firstName}-${data.lastName}`;
  }, [data.firstName, data.lastName]);

  // Check if profile is already seen when the component mounts
  useEffect(() => {
    const checkSeenStatus = async () => {
      try {
        const founderId = data.id || `${data.firstName}-${data.lastName}`;
        const { isSeen: seen } = await isProfileSeen(founderId);
        setIsSeen(seen);
      } catch (error) {
        console.error('Error checking seen status:', error);
      }
    };
    
    checkSeenStatus();
  }, [data]);

  // Check if profile has any labels when component mounts
  useEffect(() => {
    const checkLabels = async () => {
      try {
        const founderId = data.id || `${data.firstName}-${data.lastName}`;
        const { labels, error } = await getProfileLabels(founderId);
        if (error) throw error;
        
        setProfileLabels(labels);
        setHasLabels(labels && labels.length > 0);
      } catch (error) {
        console.error('Error checking profile labels:', error);
      }
    };

    checkLabels();
  }, [data]);

  useEffect(() => {
    setAiSummary(null);
    setSummaryError(null);
    setIsLoadingSummary(false);
  }, [founderKey]);

  useEffect(() => {
    if (showDetails) {
      document.body.classList.add('body-no-scroll');
      document.addEventListener('touchmove', preventScrollOutsideModal, { passive: false });
      document.addEventListener('wheel', preventScrollOutsideModal, { passive: false });

      // Mark profile as seen when details are opened
      const markSeen = async () => {
        try {
          // Only mark as seen if not already seen
          if (!isSeen) {
            await markProfileAsSeen(data);
            setIsSeen(true);
          }
        } catch (error) {
          console.error('Error marking profile as seen:', error);
        }
      };

      markSeen();

      const generateSummary = async () => {
        if (!aiSummary && !summaryError && !isLoadingSummary) {
          setIsLoadingSummary(true);
          try {
            const summary = await generateFounderSummary(data);
            if (showDetails) {
              setAiSummary(summary);
            }
          } catch (error) {
            console.error('Failed to generate summary:', error);
            if (showDetails) {
              setSummaryError('Failed to generate AI summary. Please try again later.');
            }
          } finally {
            if (showDetails) {
              setIsLoadingSummary(false);
            }
          }
        }
      };

      generateSummary();
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
  }, [showDetails, data, aiSummary, summaryError, isLoadingSummary, founderKey, isSeen]);

  useEffect(() => {
    if (showDetails) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showDetails]);

  const preventScrollOutsideModal = (e) => {
    const modalElement = document.querySelector('.detail-modal');
    if (modalElement && !modalElement.contains(e.target)) {
      e.preventDefault();
    }
  };

  const toggleDetails = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isToggling) {
      setIsToggling(true);
      
      requestAnimationFrame(() => {
        const newShowDetails = !showDetails;
        setShowDetails(newShowDetails);
        
        if (!newShowDetails) {
          setAiSummary(null);
          setSummaryError(null);
          setIsLoadingSummary(false);
        }
        
        setTimeout(() => {
          setIsToggling(false);
        }, 350);
      });
    }
  };
  

  const collegeDisplay = React.useMemo(() => {
    if (Array.isArray(data.colleges) && data.colleges.length > 0) {
      return data.colleges.join(", ");
    }
    if (data.college) {
      return data.college;
    }
    return "Not specified";
  }, [data.colleges, data.college]);

  const redditData = useMemo(() => {
    if (!data.firstName || !data.lastName || !Array.isArray(iitRedditData)) {
      return null;
    }
    
    const founderName = `${data.firstName} ${data.lastName}`.toLowerCase().trim();
    const founderLastName = data.lastName.toLowerCase().trim();
    
    let match = iitRedditData.find(item => {
      const queryName = (item.query || '').toLowerCase().trim();
      return queryName === founderName || founderName === queryName;
    });
    
    if (!match) {
      match = iitRedditData.find(item => {
        const queryName = (item.query || '').toLowerCase().trim();
        
        if (queryName.includes(founderName) || founderName.includes(queryName)) {
          return true;
        }
        
        if (data.companyName && queryName.includes(founderLastName) && 
            queryName.includes(data.companyName.toLowerCase())) {
          return true;
        }
        
        return false;
      });
    }
    
    return match;
  }, [data.firstName, data.lastName, data.companyName]);

  const redditUrl = redditData?.results?.[0]?.url;
  // Only show "Mentioned on Reddit" when the URL exists
  const isMentionedOnReddit = Boolean(redditUrl);
  
  // Determine if it's a verified Reddit mention from official Reddit domains
  const isVerifiedRedditMention = redditUrl && (
    redditUrl.includes('reddit.com') || 
    redditUrl.includes('i.redd.it') || 
    redditUrl.includes('v.redd.it')
  );

  // Function to mark profile as unseen
  const handleUnseenClick = async (e) => {
    e.stopPropagation();
    try {
      const founderId = data.id || `${data.firstName}-${data.lastName}`;
      await markProfileAsUnseen(founderId);
      setIsSeen(false);
      // Add a small visual feedback
      const toast = document.createElement('div');
      toast.className = 'label-toast';
      toast.textContent = 'Profile marked as unseen';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('label-toast-hide');
        setTimeout(() => document.body.removeChild(toast), 500);
      }, 2000);
    } catch (error) {
      console.error('Error marking profile as unseen:', error);
    }
  };

  // Format the seen date for display
  const formatSeenDate = (date) => {
    if (!date) return '';
    const seenDate = new Date(date);
    
    // If it's today, return the time
    const today = new Date();
    if (seenDate.toDateString() === today.toDateString()) {
      return `Today at ${seenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (seenDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${seenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's within the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (seenDate > oneWeekAgo) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[seenDate.getDay()]} at ${seenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise return the full date
    return seenDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get ranking data
  // const rankingData = useMemo(() => calculateRanking(data), [data]);
  // Only show ranking if sortByRanking is enabled
  // const showRankingBadge = isSortByRankingEnabled && rankingData && rankingData.rank !== null;
  // ─── Use the permanent originalRank & originalPoints ───
const rank = data.originalRank;
const score = data.originalPoints;

// compute tier from originalRank
const tierNumber = rank <= 3 ? 1
                 : rank <= 10 ? 2
                 : rank <= 30 ? 3
                 : rank <= 100 ? 4
                 : 5;
const tier = `Tier ${tierNumber}`;

// only show badge when sorting-by-ranking is enabled AND we have an originalRank
const showRankingBadge = isSortByRankingEnabled && typeof rank === 'number';
// only show score badge when we're NOT sorting by ranking
const showScoreBadge = !isSortByRankingEnabled && score;

  if (modalOnly) {
    return ReactDOM.createPortal(
      <div className="detail-overlay" onClick={onClose}>
        <div
          className="detail-modal no-animation"
          onClick={e => e.stopPropagation()}
        >
          {/* ─── START COPY HERE ─── */}

<motion.button 
  className="close-button" 
  onClick={() => toggleDetails()}
  whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
  whileTap={{ scale: 0.95 }}
  initial={{ opacity: 0, rotate: -90 }}
  animate={{ opacity: 1, rotate: 0 }}
  transition={{ delay: 0.3 }}
>
  <CloseIcon />
</motion.button>

<motion.div 
  className="label-button-container modal-label-button"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
>
  <LabelButton 
    founderData={data} 
      onLabelChange={(labels) => {
          console.log('Profile labels:', labels);
          setProfileLabels(labels);
          setHasLabels(labels.length > 0);
         // …any toast or other side-effects
        }} 
    className="modal-label-button"
    dropdownDirection="down"
  />
</motion.div>

<motion.div 
  className="modal-header"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.1 }}
>
  <div className="profile-info">
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
    
    <motion.div 
      className="profile-avatar"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {data.firstName?.charAt(0)}{data.lastName?.charAt(0)}
    </motion.div>

    <div className="profile-main">
      <motion.h2 
        className="profile-name"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {data.firstName} {data.lastName}
      </motion.h2>
      
      <motion.p 
        className="profile-headline"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {data.linkedinHeadline || data.wellfoundHeadline}
      </motion.p>
      
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
      
      <motion.div 
        className="profile-links"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {/* LinkedIn & Wellfound profile links here */}
      </motion.div>
    </div>
  </div>
</motion.div>

<motion.div 
  className="modal-content"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.2 }}
>

  {/* AI Summary Section */}
  <motion.div 
    className="detail-section ai-summary"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h3 className="section-title">📋 Summary</h3>
    <div className="detail-card">
      {/* loading / error / aiSummary logic */}
    </div>
  </motion.div>
  


  {/* Enhanced Description */}
  {data.linkedinDescription && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      {formatEnhancedDescription(data.linkedinDescription)}
    </motion.div>
  )}

  {/* Current Position */}
  {(data.currentJob || data.linkedinJobTitle || data.companyName) && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <h3 className="section-title"><WorkIcon /> Current Position</h3>
      <div className="detail-card">
        {/* title, dateRange, location, industry, links */}
      </div>
    </motion.div>
  )}

  {/* Work Experience */}
  {data.linkedinJobDescription && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
      <h3 className="section-title"><WorkIcon /> Work Experience</h3>
      <div className="detail-card">
        {/* current + previous job descriptions */}
      </div>
    </motion.div>
  )}

  {/* Career History */}
  {/* …your logic grouping company3–12… */}

  {/* Education */}
  {(data.linkedinSchoolName || data.linkedinPreviousSchoolName || collegeDisplay !== "Not specified") && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
      <h3 className="section-title"><EducationIcon /> Education</h3>
      <div className="detail-card">
        {/* list of schools/colleges */}
      </div>
    </motion.div>
  )}

  {/* Location & Contact */}
  {(data.location || data.email) && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <h3 className="section-title"><LocationIcon /> Location & Contact</h3>
      <div className="detail-card">
        {/* location and email */}
      </div>
    </motion.div>
  )}

  {/* Skills */}
  {data.linkedinSkillsLabel && (
    <motion.div className="detail-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
      <h3 className="section-title"><SkillsIcon /> Skills</h3>
      <div className="detail-card">
        {/* skill tags */}
      </div>
    </motion.div>
  )}


<div className="ranking-toggle-container">
   <button
     className="ranking-toggle-button"
     onClick={() => setShowRankingDetails((v) => !v)}
   >
     📊 {showRankingDetails ? 'Hide' : 'Show'} Scoring
   </button>
</div>
{showRankingDetails && (
   <motion.div
     className="detail-section ranking-section"
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.2 }}
   >
     <h3 className="section-title">📊 Ranking</h3>
     <RankingDetails data={data} />
  </motion.div>
 )}
 </motion.div>



        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className={`card ${showDetails ? 'expanded' : ''} ${isSeen ? 'seen-profile' : ''}`} style={{ position: 'relative' }}>
      {showRankingBadge && (
  <RankingBadge 
    rank={rank} 
    tier={tier} 
    score={score} 
  />
)}

      
      {/* Source badge */}
      {data.source && (
        <div className={`source-badge ${data.source}`}>
          {data.source === 'linkedin' ? 'LinkedIn' : 'Wellfound'}
        </div>
      )}
      
      {/* Seen date badge as a tooltip on SeenProfilesPage */}
      {inSeenProfilesPage && data.seenAt && (
        <div className="seen-date-badge-compact" title={`Viewed: ${formatSeenDate(data.seenAt)}`} data-tooltip="true">
          <span className="seen-date-icon" aria-label="Seen">👁️</span>
        </div>
      )}
      
      {/* Basic info shown on the card */}
      <div className="card-header">
        <div className="badges-container">
          {/* Only show badges if NOT in seen profiles page */}
          {!inSeenProfilesPage && (
            <>
              {isSeen && (
                <>
                  <div className="seen-badge">
                    <span>Seen</span>
                  </div>
                  <button className="unsee-button" onClick={handleUnseenClick} title="Mark as unseen">
                    <span>✕</span>
                  </button>
                </>
              )}
              {hasLabels && profileLabels.length > 0 && (
                <div className="labeled-badge" title={`Labels: ${profileLabels.map(label => label.label_name).join(', ')}`}>
                  <span>🏷️ {profileLabels.length === 1 
                    ? profileLabels[0].label_name 
                    : `${profileLabels[0].label_name} +${profileLabels.length - 1}`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="card-header-top">
          <h4 className="card-name">
            {/* Founder name and Wellfound profile link */}
            <a 
              href={data.linkedinProfileUrl} 
              onClick={handleExternalLinkClick}
              target="_blank" 
              rel="noopener noreferrer"
            >
              {data.firstName} {data.lastName}
            </a>
            
            {/* Wellfound profile link if available - on founder name ONLY */}
            {data.wellFoundProfileURL && (
              <a 
                href={data.wellFoundProfileURL}
                onClick={handleExternalLinkClick}

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
              onClick={handleExternalLinkClick}
              target="_blank" 
              rel="noopener noreferrer"
            >
              {data.companyName}
            </a>
            
            {/* Score Badge with explicit label - only show when not sorting by ranking */}
            {showScoreBadge && (
              <span className="founder-score-badge" title={`Score: ${data.originalPoints}/50`}>
                <span className="score-label-text">Score:</span> {data.originalPoints}
              </span>
            )}
          </h4>
        </div>
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
        
        <div className="source-badges">
          {data.linkedinProfileUrl && (
            <a 
              href={data.linkedinProfileUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="source-badge-small linkedin" 
              title="View on LinkedIn"
            >
              <LinkedInIcon />
            </a>
          )}
          {(data.wellFoundURL || data.wellFoundProfileURL) && (
            <a 
              href={data.wellFoundProfileURL || data.wellFoundURL}
              target="_blank" 
              rel="noopener noreferrer"
              className="source-badge-small wellfound" 
              title="View on Wellfound"
            >
              <WellfoundIcon />
            </a>
          )}
        </div>
        
        {/* Reddit mention button - Updated logic with conditional label */}
        {isMentionedOnReddit && (
          <div 
            className={`reddit-mention ${isVerifiedRedditMention ? 'verified' : 'experimental'}`}
            onClick={() => redditUrl && window.open(redditUrl, "_blank")}
            style={{ cursor: redditUrl ? 'pointer' : 'default' }}
          >
            <strong>
              {isVerifiedRedditMention 
                ? "Mentioned on Reddit" 
                : "Mentioned on Reddit (Experimental)"}
            </strong>
            {redditUrl && <span className="reddit-link-indicator">→</span>}
          </div>
        )}
      </div>

      <button onClick={toggleDetails} className="card-button">
        {showDetails ? "Hide Details" : "Show Details"}
      </button>
        {/* ——— New "Show Ranking" toggle on the card itself ——— */}
      <button
        className="ranking-toggle-button"
        onClick={() => setShowRankingDetails(v => !v)}
      >
        📊 {showRankingDetails ? 'Hide' : 'Show'} Scoring
      </button>
      { showRankingDetails && (
        <div className="ranking-details-inline">
          <RankingDetails data={data} />
        </div>
      )}

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
                  onClick={()=>toggleDetails()}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CloseIcon />
                </motion.button>

                <motion.div 
                  className="label-button-container modal-label-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <LabelButton 
                    founderData={data} 
                    onLabelChange={(labels) => {
                      console.log('Profile labels:', labels);
                      
                      // Update has labels state when labels change
                      setProfileLabels(labels);
                      setHasLabels(labels && labels.length > 0);
                      
                      const labelNames = Array.isArray(labels) 
                        ? labels.map(label => (label && typeof label === 'object' && label.label_name) ? label.label_name : label).join(', ')
                        : '';
                      
                      const toast = document.createElement('div');
                      toast.className = 'label-toast';
                      toast.textContent = labels.length ? `Labels updated: ${labelNames}` : 'Labels cleared';
                      document.body.appendChild(toast);
                      
                      setTimeout(() => {
                        toast.classList.add('label-toast-hide');
                        setTimeout(() => document.body.removeChild(toast), 500);
                      }, 2000);
                    }}
                    className="modal-label-button"
                    dropdownDirection="down"
                  />
                </motion.div>

                <motion.div 
                  className="modal-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="profile-info">
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
                      <motion.h2 
                        className="profile-name"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        {data.firstName} {data.lastName}
                      </motion.h2>
                      
                      <motion.p 
                        className="profile-headline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        {data.linkedinHeadline || data.wellfoundHeadline}
                      </motion.p>
                      
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
                      
                      <motion.div 
                        className="profile-links"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        {data.linkedinProfileUrl && (
                          <div className="profile-link-group">
                            <div className="link-followers-row">
                              <a
                                href={data.linkedinProfileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-link linkedin-link"
                              >
                                <LinkedInIcon /> View LinkedIn Profile
                              </a>
                              
                              {/* LinkedIn Followers Badge */}
                              {data.linkedinFollowersCount && parseInt(data.linkedinFollowersCount) > 0 && (
                                <div className={`profile-followers-badge inline-badge ${getFollowersBadgeClass(parseInt(data.linkedinFollowersCount))}`}>
                                  <LinkedInIcon />
                                  <span className="followers-count">{parseInt(data.linkedinFollowersCount).toLocaleString()}</span> followers
                                </div>
                              )}
                            </div>
                          </div>
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
                  {/* AI Summary Section */}
                  <motion.div 
                    className="detail-section ai-summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="section-title">
                      <span role="img" aria-label="AI">📋</span> Summary
                    </h3>
                    <div className="detail-card">
                      {isLoadingSummary ? (
                        <div className="loading-summary">
                          <div className="loading-spinner"></div>
                          <motion.p
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1.5, 
                              repeatType: "reverse" 
                            }}
                          >
                            <motion.span>
                              Generating AI insights
                            </motion.span>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: [0, 1, 1, 0],
                                y: [0, -1, -1, 0]
                              }}
                              transition={{ 
                                times: [0, 0.3, 0.7, 1],
                                repeat: Infinity, 
                                duration: 2,
                                repeatDelay: 0
                              }}
                            >
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                            </motion.span>
                          </motion.p>
                          <motion.div 
                            className="loading-message"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.5 }}
                          >
                            Analyzing profile data and creating personalized insights
                          </motion.div>
                          
                        </div>
                      ) : summaryError ? (
                        <div className="summary-error">
                          <p>{summaryError}</p>
                        </div>
                      ) : aiSummary ? (
                        <motion.div 
                          className="summary-content"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            duration: 0.5,
                            type: "spring",
                            stiffness: 120,
                            damping: 10
                          }}
                        >
                          {formatSimpleDescription(aiSummary)}
                        </motion.div>
                      ) : null}
                      
                    </div>
                  </motion.div>
                  

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

                  {/* Work Experience Section */}
                  {data.linkedinJobDescription && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <h3 className="section-title">
                        <WorkIcon /> Work Experience
                      </h3>
                      <div className="detail-card">
                        <div className="work-item">
                          <h4>{data.linkedinJobTitle || "Current Role"}</h4>
                          <div className="job-description">
                            {formatSimpleDescription(data.linkedinJobDescription)}
                          </div>
                        </div>
                        
                        {data.linkedinPreviousJobTitle && data.linkedinPreviousJobDescription && (
                          <div className="work-item previous-job">
                            <h4>{data.linkedinPreviousJobTitle}</h4>
                            <div className="job-description">
                              {formatSimpleDescription(data.linkedinPreviousJobDescription)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Career History - All Previous Positions */}
                  {(data.previousJob || data.linkedinPreviousJobTitle || data.previousCompanyName || 
                    data.company3Name || data.company3Designation || 
                    data.company4Name || data.company4Designation || 
                    data.company5Name || data.company5Designation) && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h3 className="section-title">
                        <WorkIcon /> Career History
                      </h3>

                      {/* Previous Position */}
                      {(data.previousJob || data.linkedinPreviousJobTitle || data.previousCompanyName) && (
                        <div className="detail-card career-card">
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
                      )}

                      {/* Group companies 3-5 by same company name when applicable */}
                      {(() => {
                        // Check if any of the companies 3-5 exist
                        const hasCompany3 = data.company3Name || data.company3Designation;
                        const hasCompany4 = data.company4Name || data.company4Designation;
                        const hasCompany5 = data.company5Name || data.company5Designation;
                        
                        if (!hasCompany3 && !hasCompany4 && !hasCompany5) {
                          return null;
                        }
                        
                        // Extract company names
                        const company3 = data.company3Name || "";
                        const company4 = data.company4Name || "";
                        const company5 = data.company5Name || "";
                        
                        // Extract designations (which sometimes contain company names)
                        const designation3 = data.company3Designation || "";
                        const designation4 = data.company4Designation || "";
                        const designation5 = data.company5Designation || "";
                        
                        // Check if all match the same company
                        const nutanixPattern = /nutanix/i;
                        const ciscoPattern = /cisco/i;
                        
                        const isAllNutanix = 
                          (hasCompany3 && (company3 === "Nutanix" || nutanixPattern.test(designation3))) &&
                          (hasCompany4 && (company4 === "Nutanix" || nutanixPattern.test(designation4))) &&
                          (hasCompany5 && (company5 === "Nutanix" || nutanixPattern.test(designation5)));
                        
                        const isAllCisco = 
                          (hasCompany3 && (company3 === "Cisco" || ciscoPattern.test(designation3))) &&
                          (hasCompany4 && (company4 === "Cisco" || ciscoPattern.test(designation4))) &&
                          (hasCompany5 && (company5 === "Cisco" || ciscoPattern.test(designation5)));
                        
                        // If all from same company, show career progression
                        if (isAllNutanix || isAllCisco) {
                          const companyName = isAllNutanix ? "Nutanix" : "Cisco";
                          return (
                            <div className="career-company-group">
                              <h4 className="company-group-name">{companyName}</h4>
                              
                              {/* Company 5 */}
                              {hasCompany5 && (
                                <div className="detail-card career-card career-progression">
                                  <h5 className="position-title">
                                    {designation5.replace(companyName, '').replace(/^[,\s]+-?\s*/, '')}
                                  </h5>
                                  {data.company5DateRange && (
                                    <p className="date-range">{data.company5DateRange}</p>
                                  )}
                                  {data.education5Name && /\d{4}/.test(data.education5Name) && (
                                    <p className="date-range">{data.education5Name}</p>
                                  )}
                                  {hasCompany4 && <div className="career-progression-arrow">↑</div>}
                                </div>
                              )}
                              
                              {/* Company 4 */}
                              {hasCompany4 && (
                                <div className="detail-card career-card career-progression">
                                  <h5 className="position-title">
                                    {designation4.replace(companyName, '').replace(/^[,\s]+-?\s*/, '')}
                                  </h5>
                                  {data.company4DateRange && (
                                    <p className="date-range">{data.company4DateRange}</p>
                                  )}
                                  {data.education4Name && /\d{4}/.test(data.education4Name) && (
                                    <p className="date-range">{data.education4Name}</p>
                                  )}
                                  {hasCompany3 && <div className="career-progression-arrow">↑</div>}
                                </div>
                              )}
                              
                              {/* Company 3 */}
                              {hasCompany3 && (
                                <div className="detail-card career-card career-progression">
                                  <h5 className="position-title">
                                    {designation3.replace(companyName, '').replace(/^[,\s]+-?\s*/, '')}
                                  </h5>
                                  {data.company3DateRange && (
                                    <p className="date-range">{data.company3DateRange}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        // Otherwise, show as separate companies
                        return (
                          <>
                            {/* Company 3 */}
                            {hasCompany3 && (
                              <div className="detail-card career-card">
                                <h4>
                                  {designation3 || "Professional"}
                                  {company3 !== "Stealth" ? ` at ${company3}` : ""}
                                </h4>
                                {data.company3DateRange && (
                                  <p className="date-range">{data.company3DateRange}</p>
                                )}
                                <div className="career-tag">Past Position</div>
                              </div>
                            )}
                            
                            {/* Company 4 */}
                            {hasCompany4 && (
                              <div className="detail-card career-card">
                                <h4>
                                  {designation4 || "Professional"}
                                  {company4 ? ` at ${company4}` : ""}
                                </h4>
                                {data.company4DateRange && (
                                  <p className="date-range">{data.company4DateRange}</p>
                                )}
                                {data.education4Name && !isNaN(data.education4Name.substring(0, 4)) && (
                                  <p className="date-range">{data.education4Name}</p>
                                )}
                                <div className="career-tag">Past Position</div>
                              </div>
                            )}
                            
                            {/* Company 5 */}
                            {hasCompany5 && (
                              <div className="detail-card career-card">
                                <h4>
                                  {designation5 && !company5 ? `${designation5}` : (company5 || "Professional")}
                                  {data.company5DateRange && (
                                    <span className="role-title"> - {data.company5DateRange}</span>
                                  )}
                                </h4>
                                {data.education5Name && !isNaN(data.education5Name?.substring?.(0, 4)) && (
                                  <p className="date-range">{data.education5Name}</p>
                                )}
                                <div className="career-tag">Past Position</div>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {/* Show a "View More" button if there are more companies */}
                      {(data.company6Name || data.company7Name || data.company8Name ||
                        data.company9Name || data.company10Name || data.company11Name ||
                        data.company12Name) && (
                        <button 
                          className="view-more-button"
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById('additional-positions');
                            if (element) {
                              element.style.display = element.style.display === 'none' ? 'block' : 'none';
                              e.target.textContent = element.style.display === 'none' ? 'View More Positions' : 'View Less';
                            }
                          }}
                        >
                          View More Positions
                        </button>
                      )}

                      {/* Additional positions (hidden by default) */}
                      <div id="additional-positions" style={{display: 'none'}}>
                        {/* Group positions by company */}
                        {(() => {
                          // Collect all positions from company6-12
                          const positions = [];
                          for (let num = 6; num <= 12; num++) {
                            const companyName = data[`company${num}Name`];
                            const designation = data[`company${num}Designation`];
                            const dateRange = data[`company${num}DateRange`];
                            const educationDateRange = data[`education${num}Name`];
                            
                            if (companyName || designation) {
                              positions.push({
                                companyName,
                                designation,
                                dateRange,
                                educationDateRange,
                                index: num
                              });
                            }
                          }
                          
                          if (positions.length === 0) return null;
                          
                          // Group by company name
                          const companiesMap = {};
                          
                          positions.forEach(pos => {
                            // Get company name (it might be in designation if companyName is null)
                            let company = pos.companyName || pos.designation;
                            
                            // For cases where the company name appears in the designation field
                            if (!pos.companyName && pos.designation) {
                              // Common company names to check for
                              const commonCompanies = ["Nutanix", "Cisco", "Google", "Facebook", "Meta", "Amazon", "Apple", "Microsoft"];
                              
                              for (const commonCompany of commonCompanies) {
                                if (pos.designation.includes(commonCompany)) {
                                  company = commonCompany;
                                  break;
                                }
                              }
                            }
                            
                            if (!companiesMap[company]) {
                              companiesMap[company] = [];
                            }
                            
                            companiesMap[company].push(pos);
                          });
                          
                          // Render grouped positions by company
                          return Object.entries(companiesMap).map(([company, positions]) => {
                            // Sort positions by index (original order)
                            positions.sort((a, b) => a.index - b.index);
                            
                            return (
                              <div key={company} className="career-company-group">
                                <h4 className="company-group-name">{company}</h4>
                                {positions.map((pos, idx) => (
                                  <div key={`pos-${pos.index}`} className="detail-card career-card career-progression">
                                    <h5 className="position-title">
                                      {/* If designation contains company name, show only the role part */}
                                      {pos.designation && pos.designation.includes(company) 
                                        ? pos.designation.replace(company, '').replace(/^[,\s]+-?\s*/, '') 
                                        : pos.designation || "Professional"}
                                    </h5>
                                    
                                    {pos.dateRange && (
                                      <p className="date-range">{pos.dateRange}</p>
                                    )}
                                    {pos.educationDateRange && !isNaN(pos.educationDateRange?.substring?.(0, 4)) && (
                                      <p className="date-range">{pos.educationDateRange}</p>
                                    )}
                                    {idx === positions.length - 1 ? null : <div className="career-progression-arrow">↑</div>}
                                  </div>
                                ))}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </motion.div>
                  )}

                  {/* Education Section with improved data handling */}
                  {(data.linkedinSchoolName || data.linkedinPreviousSchoolName || collegeDisplay !== "Not specified") && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <h3 className="section-title">
                        <EducationIcon /> Education
                      </h3>
                      <div className="detail-card">
                        {/* Current School */}
                        {data.linkedinSchoolName && (
                          <div className="education-item">
                            <h4>{data.linkedinSchoolName}</h4>
                            {data.linkedinSchoolDegree && (
                              <p className="degree">{data.linkedinSchoolDegree}</p>
                            )}
                            {data.linkedinSchoolDateRange && (
                              <p className="date-range">{data.linkedinSchoolDateRange}</p>
                            )}
                            {data.linkedinSchoolDescription && (
                              <div className="description">
                                {formatSimpleDescription(data.linkedinSchoolDescription)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Previous School */}
                        {data.linkedinPreviousSchoolName && (
                          <div className="education-item previous-education">
                            <h4>{data.linkedinPreviousSchoolName}</h4>
                            {data.linkedinPreviousSchoolDegree && (
                              <p className="degree">{data.linkedinPreviousSchoolDegree}</p>
                            )}
                            {data.linkedinPreviousSchoolDateRange && (
                              <p className="date-range">{data.linkedinPreviousSchoolDateRange}</p>
                            )}
                            {data.linkedinPreviousSchoolDescription && (
                              <div className="description">
                                {formatSimpleDescription(data.linkedinPreviousSchoolDescription)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* College from dataset */}
                        {collegeDisplay !== "Not specified" && (
                          <div className="education-item">
                            <h4>{collegeDisplay}</h4>
                          </div>
                        )}
                        
                        {/* Additional Education Entries - some might have dates in name field */}
                        {data.education3Name && !/^\d{4}\s?-\s?\d{4}$/.test(data.education3Name) && (
                          <div className="education-item">
                            <h4>{data.education3Name}</h4>
                            {data.education3DateRange && (
                              <p className="date-range">{data.education3DateRange}</p>
                            )}
                          </div>
                        )}
                        
                        {data.education4Name && !/^\d{4}\s?-\s?\d{4}$/.test(data.education4Name) && (
                          <div className="education-item">
                            <h4>{data.education4Name}</h4>
                            {data.education4DateRange && (
                              <p className="date-range">{data.education4DateRange}</p>
                            )}
                          </div>
                        )}
                        
                        {data.education5Name && !/^\d{4}\s?-\s?\d{4}$/.test(data.education5Name) && (
                          <div className="education-item">
                            <h4>{data.education5Name}</h4>
                            {data.education5DateRange && (
                              <p className="date-range">{data.education5DateRange}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Location/Contact Section */}
                  {(data.location || data.email) && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <h3 className="section-title">
                        <LocationIcon /> Location & Contact
                      </h3>
                      <div className="detail-card">
                        {data.location && (
                          <p className="location-info">
                            <LocationIcon /> {data.location}
                          </p>
                        )}
                        {data.email && (
                          <p className="contact-info">
                            <span>📧</span> {data.email}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Skills Section */}
                  {data.linkedinSkillsLabel && (
                    <motion.div 
                      className="detail-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <h3 className="section-title">
                        <SkillsIcon /> Skills
                      </h3>
                      <div className="detail-card">
                        <div className="skills-container">
                          {data.linkedinSkillsLabel.split(',').map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
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