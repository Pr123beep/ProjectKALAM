import React, { useState, useEffect } from 'react';

/**
 * A button that appears when user scrolls down and allows scrolling back to top
 */
const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top with a custom, satisfying animation
  const scrollToTop = () => {
    // Get current scroll position
    const currentPosition = window.pageYOffset;
    
    // If we're already at the top, do nothing
    if (currentPosition === 0) return;
    
    // Animation settings
    const duration = 1000; // Longer duration (1 second) for more satisfying effect
    const startTime = performance.now();
    
    // Easing function for a smooth, satisfying deceleration
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    
    // Animation function using requestAnimationFrame for smoother results
    function animateScroll(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = easeOutCubic(progress);
      
      // Calculate new position and scroll to it
      const position = currentPosition - (currentPosition * easeProgress);
      window.scrollTo(0, position);
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Ensure we're exactly at the top when animation finishes
        window.scrollTo(0, 0);
      }
    }
    
    // Start the animation
    requestAnimationFrame(animateScroll);
  };

  // Define button styles
  const buttonStyle = {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    zIndex: '1000',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#2a9d8f',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    opacity: visible ? '1' : '0',
    transition: 'opacity 0.3s, transform 0.3s',
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    pointerEvents: visible ? 'auto' : 'none',
  };

  return (
    <button 
      style={buttonStyle} 
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollButton; 