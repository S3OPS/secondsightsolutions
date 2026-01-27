/**
 * Mobile CTA Module
 * Handles mobile call-to-action visibility on scroll
 */

export const mobileCTA = {
  lastScroll: 0,
  ticking: false,
  ctaElement: null,

  /**
   * Initialize mobile CTA functionality
   */
  init() {
    this.ctaElement = document.querySelector('.mobile-cta');
    if (!this.ctaElement) return;
    
    window.addEventListener('scroll', () => this._handleScroll(), { passive: true });
  },

  /**
   * Handle scroll event with request animation frame for performance
   * @private
   */
  _handleScroll() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => this._updateCTA());
      this.ticking = true;
    }
  },

  /**
   * Update CTA visibility based on scroll position
   * @private
   */
  _updateCTA() {
    const currentScroll = window.scrollY;
    
    // Show CTA when scrolling down past 300px
    if (currentScroll > 300 && currentScroll > this.lastScroll) {
      this.ctaElement.classList.add('visible');
      this.ctaElement.classList.remove('hidden');
    } else if (currentScroll < this.lastScroll) {
      // Hide when scrolling up
      this.ctaElement.classList.add('hidden');
      this.ctaElement.classList.remove('visible');
    }
    
    this.lastScroll = currentScroll;
    this.ticking = false;
  }
};
