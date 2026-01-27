/**
 * Performance Monitoring Module
 * Logs performance metrics in development
 */

export const performance = {
  /**
   * Initialize performance monitoring
   */
  init() {
    // Only log performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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
