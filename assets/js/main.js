/**
 * Second Sight Solutions - Main JavaScript Entry Point
 * Optimized and modularized for better performance and maintainability
 */

import { utils } from './modules/utils.js';
import { lazyLoading } from './modules/lazy-loading.js';
import { formValidation } from './modules/form-validation.js';
import { lightbox } from './modules/lightbox.js';
import { analytics } from './modules/analytics.js';
import { smoothScroll } from './modules/smooth-scroll.js';
import { mobileCTA } from './modules/mobile-cta.js';
import { performance } from './modules/performance.js';

/**
 * Application initialization
 */
class App {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize all application modules
   */
  init() {
    if (this.initialized) return;

    // Check WebP support
    utils.checkWebPSupport((isSupported) => {
      document.documentElement.classList.add(isSupported ? 'webp' : 'no-webp');
    });

    // Initialize all modules
    lazyLoading.init();
    formValidation.init();
    lightbox.init();
    smoothScroll.init();
    mobileCTA.init();
    analytics.init();
    performance.init();

    this.initialized = true;
    console.log('✨ Second Sight Solutions - Site initialized');
  }
}

// Initialize app when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
