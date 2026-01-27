/**
 * Mobile CTA Module
 * Handles mobile call-to-action visibility on scroll
 */

import { config } from './config.js';

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
    const threshold = config.scroll.mobileCtaThreshold;
    
    // Show CTA when scrolling down past threshold
    if (currentScroll > threshold && currentScroll > this.lastScroll) {
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
