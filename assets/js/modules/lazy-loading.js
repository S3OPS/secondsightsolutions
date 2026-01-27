/**
 * Lazy Loading Module
 * Handles lazy loading of images for better performance
 */

import { config } from './config.js';

export const lazyLoading = {
  /**
   * Initialize lazy loading for images
   */
  init() {
    // Use native lazy loading with fallback
    if ('loading' in HTMLImageElement.prototype) {
      this._initNativeLazyLoading();
    } else {
      this._initFallbackLazyLoading();
    }
  },

  /**
   * Initialize native lazy loading
   * @private
   */
  _initNativeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      }, { once: true, passive: true });
    });
  },

  /**
   * Initialize fallback lazy loading using IntersectionObserver
   * @private
   */
  _initFallbackLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: config.lazyLoading.rootMargin,
        threshold: config.lazyLoading.threshold
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Ultra-fallback: just load all images
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      });
    }
  }
};
