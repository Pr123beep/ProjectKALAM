import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();
  
  // Custom smooth scrolling animation with easing
  const smoothScrollToTop = () => {
    // Get current scroll position
    const currentPosition = window.pageYOffset;
    
    // If we're already at the top, skip animation
    if (currentPosition === 0) return;
    
    // Animation settings
    const duration = 800; // Adjust for more satisfying effect
    const startTime = performance.now();
    
    // Easing function for smooth deceleration
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    
    // Animation function
    function animateScroll(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = easeOutCubic(progress);
      
      // Calculate position and scroll
      const position = currentPosition - (currentPosition * easeProgress);
      window.scrollTo(0, position);
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure we end at the top
        window.scrollTo(0, 0);
      }
    }
    
    // Start the animation
    requestAnimationFrame(animateScroll);
  };
  
  const handleClick = (pageNum) => {
    // Start the smooth scrolling animation
    smoothScrollToTop();
    
    // Change the page after a short delay to allow scrolling to be visible
    setTimeout(() => {
      onPageChange(pageNum);
    }, 300);
  };

  // Hook to enhance the scrolling effect
  useEffect(() => {
    // Make document scrollable with smooth behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      // Reset scroll behavior when component unmounts
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div 
      className="pagination-container"
      onClick={() => {
        // Extra scroll trigger on any pagination click
        window.scrollTo(0, 0);
      }}
    >
      <button 
        className="pagination-arrow"
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>
      
      {pageNumbers.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
        ) : (
          <motion.button
            key={page}
            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => handleClick(page)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {page}
          </motion.button>
        )
      ))}
      
      <button 
        className="pagination-arrow"
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination; 