import { useEffect } from 'react';

/**
 * Component that scrolls the page to the top when mounted
 */
function ScrollToTop() {
  useEffect(() => {
    // Immediately scroll to top on render
    window.scrollTo(0, 0);
    
    // Extra methods for cross-browser compatibility
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    
    // Attempt smooth scrolling as a fallback
    try {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    } catch (e) {
      // Ignore errors
    }
  }, []);

  return null; // This component doesn't render anything
}

export default ScrollToTop; 