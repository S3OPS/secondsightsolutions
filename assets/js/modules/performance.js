/**
 * Performance Monitoring Module
 * Logs performance metrics in development
 */

import { config } from './config.js';

export const performance = {
  /**
   * Initialize performance monitoring
   */
  init() {
    // Only log performance in development
    if (config.isDevelopment() && config.performance.enabled()) {
      this._logPerformance();
    }
  },

  /**
   * Log performance metrics to console
   * @private
   */
  _logPerformance() {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      window.addEventListener('load', function() {
        setTimeout(function() {
          const perfData = window.performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log('🚀 Performance Metrics:');
            console.log('  DOM Content Loaded:', Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart), 'ms');
            console.log('  Page Load:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
            console.log('  Total Time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
          }
        }, 0);
      }, { once: true, passive: true });
    }
  }
};
