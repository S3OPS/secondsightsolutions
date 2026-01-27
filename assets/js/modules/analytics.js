/**
 * Analytics Module
 * Handles analytics tracking for user interactions
 */

export const analytics = {
  /**
   * Initialize analytics tracking
   */
  init() {
    this._trackOutboundLinks();
    this._trackFormSubmissions();
  },

  /**
   * Track outbound link clicks
   * @private
   */
  _trackOutboundLinks() {
    const outboundLinks = document.querySelectorAll('a[href^="http"]');
    
    outboundLinks.forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function() {
          analytics._track('click', {
            event_category: 'outbound',
            event_label: this.href
          });
        }, { passive: true });
      }
    });
  },

  /**
   * Track form submissions
   * @private
   */
  _trackFormSubmissions() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function() {
        const formName = this.name || this.id || 'unnamed_form';
        analytics._track('form_submit', {
          event_category: 'engagement',
          event_label: formName
        });
      }, { passive: true });
    });
  },

  /**
   * Send tracking event to analytics service
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Event data
   * @private
   */
  _track(eventName, eventData) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventData);
    } else if (typeof plausible !== 'undefined') {
      plausible(eventName === 'click' ? 'Outbound Link' : 'Form Submit', {
        props: eventData
      });
    }
  }
};
