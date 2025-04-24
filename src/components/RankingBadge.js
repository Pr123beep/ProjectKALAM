import React from 'react';
import { motion } from 'framer-motion';
import './RankingBadge.css';

const RankingBadge = ({ rank, tier, score }) => {
  // Ensure rank is a number
  const rankNum = parseInt(rank) || 999;
  
  // Define medal color, icon, and details based on rank
  const getMedalDetails = (rank) => {
    if (rank === 1) return { 
      color: '#FFD700', 
      icon: '🏆', 
      label: '#1', 
      title: 'APEX FOUNDER',
      gradientStart: '#FFD700',
      gradientEnd: '#FFC800',
      shadowColor: 'rgba(255, 215, 0, 0.8)'
    };
    
    if (rank === 2) return { 
      color: '#C0C0C0', 
      icon: '🥈', 
      label: '#2', 
      title: 'ELITE FOUNDER',
      gradientStart: '#C0C0C0',
      gradientEnd: '#E8E8E8',
      shadowColor: 'rgba(192, 192, 192, 0.7)'
    };
    
    if (rank === 3) return { 
      color: '#CD7F32', 
      icon: '🥉', 
      label: '#3', 
      title: 'PRIME FOUNDER',
      gradientStart: '#CD7F32',
      gradientEnd: '#E8C496',
      shadowColor: 'rgba(205, 127, 50, 0.7)'
    };
    
    if (rank <= 10) return {
      color: '#1E88E5',
      icon: '🌟',
      label: `#${rank}`,
      title: 'TOP 10 FOUNDER',
      gradientStart: '#1E88E5',
      gradientEnd: '#64B5F6',
      shadowColor: 'rgba(30, 136, 229, 0.6)'
    };
    
    if (rank <= 30) return {
      color: '#43A047',
      icon: '💎',
      label: `#${rank}`,
      title: 'RISING STAR',
      gradientStart: '#43A047',
      gradientEnd: '#66BB6A',
      shadowColor: 'rgba(67, 160, 71, 0.5)'
    };
    
    if (rank <= 100) return {
      color: '#7E57C2',
      icon: '✨',
      label: `#${rank}`,
      title: 'NOTABLE FOUNDER',
      gradientStart: '#7E57C2',
      gradientEnd: '#9575CD',
      shadowColor: 'rgba(126, 87, 194, 0.5)'
    };
    
    // For all other ranks
    return { 
      color: '#78909C', 
      icon: '📊', 
      label: `#${rank}`, 
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
  
  const { icon, label, title, gradientStart, gradientEnd, shadowColor } = getMedalDetails(rankNum);
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
  
  // Create array of sparkle positions
  const sparklePositions = Array.from({ length: isTopThree ? 6 : (isTopTen ? 3 : 0) }, getRandomPosition);
  
  return (
    <motion.div 
      className="ranking-badge" 
      style={{ 
        background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        boxShadow: `0 4px 20px ${shadowColor}`
      }}
      initial={{ opacity: 0, scale: 0.8, y: -10, rotate: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        rotate: 5,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 15 
        }
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 0,
        boxShadow: `0 8px 30px ${shadowColor}`,
        transition: { duration: 0.2 }
      }}
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
      
      <div className="ranking-badge-content">
        <div className="ranking-badge-header">
          <motion.span 
            className="ranking-icon"
            animate={isTopTen ? {
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0, -5, 0],
            } : {}}
            transition={isTopTen ? {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2,
            } : {}}
          >
            {icon}
          </motion.span>
          <span className="ranking-label">{label}</span>
        </div>
        
        <div className="ranking-info">
          {rankNum <= 100 && <span className="ranking-title">{title}</span>}
          {tierLabel && <span className="ranking-tier">TIER {tierLabel}</span>}
          {score && (
            <div className="ranking-score-container">
              <span className="ranking-score">
                <span className="score-value">{formatScore(score)}</span>
                <span className="score-label">PTS</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RankingBadge; 