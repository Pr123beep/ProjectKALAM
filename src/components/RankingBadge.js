import React from 'react';
import { motion } from 'framer-motion';
import './RankingBadge.css';

const RankingBadge = ({ rank, tier, score }) => {
  // Ensure rank is a number
  const rankNum = parseInt(rank) || 999;
  
  // Debug log to check what's coming in
  console.log('RankingBadge received:', { rank, tier, score, rankNum });

  // Define medal color and icon based on rank
  const getMedalDetails = (rank) => {
    if (rank === 1) return { color: '#FFD700', icon: '🏆', label: '#1' };
    if (rank === 2) return { color: '#C0C0C0', icon: '🥈', label: '#2' };
    if (rank === 3) return { color: '#CD7F32', icon: '🥉', label: '#3' };
    
    // For other ranks
    return { 
      color: '#0077B5', 
      icon: rank <= 10 ? '🌟' : '🔵', 
      label: `#${rank}` 
    };
  };
  
  // Get tier designation
  const getTierLabel = (tier) => {
    if (!tier) return '';
    
    // Remove the word 'Tier' if it exists in the string
    return tier.replace('Tier', '').trim();
  };
  
  const { color, icon, label } = getMedalDetails(rankNum);
  const tierLabel = getTierLabel(tier || '');
  const isTopTen = rankNum <= 10;
  
  return (
    <motion.div 
      className="ranking-badge" 
      style={{ backgroundColor: color }}
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
        transition: { duration: 0.2 }
      }}
    >
      <div className="ranking-badge-content">
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
        {tierLabel && <span className="ranking-tier">Tier {tierLabel}</span>}
        {score && <span className="ranking-score">{parseInt(score).toLocaleString()} points</span>}
      </div>
    </motion.div>
  );
};

export default RankingBadge; 