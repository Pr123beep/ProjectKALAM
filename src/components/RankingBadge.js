import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RankingBadge.css';

const RankingBadge = ({ rank, tier, score }) => {
  const [showDetails, setShowDetails] = useState(false);
  const badgeRef = useRef(null);
  
  // Ensure rank is a number
  const rankNum = parseInt(rank) || 999;
  
  // Define medal color, icon, and details based on rank
  const getMedalDetails = (rank) => {
    if (rank === 1) return { 
      color: '#FFD700', 
      icon: '🥇', 
      label: '1', 
      title: 'APEX FOUNDER',
      gradientStart: '#FFD700',
      gradientEnd: '#FFC800',
      shadowColor: 'rgba(255, 215, 0, 0.8)'
    };
    
    if (rank === 2) return { 
      color: '#C0C0C0', 
      icon: '🥈', 
      label: '2', 
      title: 'ELITE FOUNDER',
      gradientStart: '#C0C0C0',
      gradientEnd: '#E8E8E8',
      shadowColor: 'rgba(192, 192, 192, 0.7)'
    };
    
    if (rank === 3) return { 
      color: '#CD7F32', 
      icon: '🥉', 
      label: '3', 
      title: 'PRIME FOUNDER',
      gradientStart: '#CD7F32',
      gradientEnd: '#E8C496',
      shadowColor: 'rgba(205, 127, 50, 0.7)'
    };
    
    if (rank <= 10) return {
      color: '#1E88E5',
      icon: '🏅', 
      label: `${rank}`,
      title: 'TOP 10 FOUNDER',
      gradientStart: '#1E88E5',
      gradientEnd: '#64B5F6',
      shadowColor: 'rgba(30, 136, 229, 0.6)'
    };
    
    if (rank <= 50) return {
      color: '#43A047',
      icon: '🌟',
      label: `${rank}`,
      title: 'RISING STAR',
      gradientStart: '#43A047',
      gradientEnd: '#66BB6A',
      shadowColor: 'rgba(67, 160, 71, 0.5)'
    };
    
    // For all other ranks
    return { 
      color: '#78909C', 
      icon: '✨', 
      label: `${rank}`, 
      title: 'RANKED FOUNDER',
      gradientStart: '#78909C',
      gradientEnd: '#90A4AE',
      shadowColor: 'rgba(120, 144, 156, 0.4)'
    };
  };
  
  // Get tier designation with enhanced formatting
  const getTierLabel = (tier) => {
    if (!tier) return '';
    
    // Remove the word 'Tier' if it exists in the string
    const tierNumber = tier.replace('Tier', '').trim();
    
    return tierNumber;
  };
  
  const { icon, title, gradientStart, gradientEnd, shadowColor, color } = getMedalDetails(rankNum);
  const tierLabel = getTierLabel(tier || '');
  const isTopTen = rankNum <= 10;
  const isTopThree = rankNum <= 3;
  
  // Format score for display with K abbreviation for thousands
  const formatScore = (scoreValue) => {
    const numScore = parseInt(scoreValue) || 0;
    if (numScore >= 10000) {
      return `${(numScore / 1000).toFixed(1)}K`;
    }
    return numScore.toLocaleString();
  };
  
  // Dynamic sparkle animation for top badges
  const sparkleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: [0, 1, 0], 
      scale: [0, 1, 0],
      transition: { 
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1, 
        duration: 1.5 
      }
    }
  };
  
  // Generate random positions for sparkles
  const getRandomPosition = () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  });
  
  // Create array of sparkle positions - only for top ranks
  const sparklePositions = Array.from({ length: isTopThree ? 3 : (isTopTen ? 2 : 0) }, getRandomPosition);
  
  // Handle mouse events for hover
  const handleMouseEnter = () => {
    setShowDetails(true);
  };
  
  const handleMouseLeave = () => {
    setShowDetails(false);
  };
  
  return (
    <>
      <motion.div 
        ref={badgeRef}
        className="ranking-badge" 
        style={{ 
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          boxShadow: `0 3px 8px ${shadowColor}`
        }}
        initial={{ opacity: 0, scale: 0.8, y: -5 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: { 
            type: "spring",
            stiffness: 300,
            damping: 15 
          }
        }}
        whileHover={{ 
          scale: 1.15,
          boxShadow: `0 4px 10px ${shadowColor}`,
          transition: { duration: 0.2 }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={`Rank #${rankNum}`}
      >
        {/* Sparkle effects for top badges */}
        {sparklePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="badge-sparkle"
            style={pos}
            variants={sparkleVariants}
            initial="hidden"
            animate="visible"
          />
        ))}
        
        <motion.span 
          className="ranking-icon"
          animate={isTopTen ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={isTopTen ? {
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2,
          } : {}}
        >
          {icon}
        </motion.span>
      </motion.div>
      
      {/* Details dialog that appears on hover */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            className="ranking-details-dialog"
            style={{ borderLeftColor: color }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="details-dialog-header">
              <span>{icon}</span> {title}
            </div>
            
            <div className="details-dialog-row">
              <span className="details-label">Rank:</span>
              <span className="details-value">#{rankNum}</span>
            </div>
            
            {tierLabel && (
              <div className="details-dialog-row">
                <span className="details-label">Tier:</span>
                <span className="details-value">{tierLabel}</span>
              </div>
            )}
            
            {score && (
              <div className="details-dialog-row">
                <span className="details-label">Score:</span>
                <span className="details-value">{formatScore(score)} pts</span>
              </div>
            )}
            
            <div className="details-dialog-footer">
              Based on profile quality and network
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RankingBadge; 