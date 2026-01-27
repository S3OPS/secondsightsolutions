/**
 * Smooth Scroll Module
 * Handles smooth scrolling for anchor links
 */

export const smoothScroll = {
  /**
   * Initialize smooth scroll for anchor links
   */
  init() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without triggering a jump
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }
};
