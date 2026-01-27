/**
 * Configuration Module
 * Centralized configuration for all modules
 * Contains magic numbers, thresholds, patterns, and other constants
 */

export const config = {
  /**
   * Development environment detection
   */
  isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '' ||
      window.location.protocol !== 'https:'
    );
  },

  /**
   * Scroll-related configuration
   */
  scroll: {
    // Mobile CTA scroll threshold (pixels)
    mobileCtaThreshold: 300,
    
    // Use passive event listeners for scroll performance
    passiveListeners: true,
  },

  /**
   * Lazy loading configuration
   */
  lazyLoading: {
    // Root margin for IntersectionObserver (load images before they're visible)
    rootMargin: '50px 0px',
    
    // Threshold for when to trigger lazy loading (0.01 = 1% visible)
    threshold: 0.01,
  },

  /**
   * Form validation patterns and rules
   */
  validation: {
    // Email validation pattern (RFC 5322 simplified)
    // Validates: user@example.com, user.name@example.co.uk
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // Phone validation pattern (basic international format)
    // Allows: digits, spaces, dashes, parentheses, plus sign
    phonePattern: /^[\d\s\-\(\)\+]+$/,
    
    // Minimum phone number length
    phoneMinLength: 10,
    
    // Error messages
    messages: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
    },
  },

  /**
   * Analytics configuration
   */
  analytics: {
    // Google Analytics ID (placeholder - update with actual ID)
    googleId: 'G-XXXXXXXXXX',
    
    // Plausible Analytics domain
    plausibleDomain: 'secondsightsolutions.com',
    
    // Event names
    events: {
      outboundClick: 'click',
      formSubmit: 'form_submit',
    },
  },

  /**
   * Performance monitoring configuration
   */
  performance: {
    // Enable performance monitoring only in development
    enabled() {
      return config.isDevelopment();
    },
    
    // Metrics to track
    metrics: ['FCP', 'LCP', 'CLS', 'FID', 'TTFB'],
  },

  /**
   * Lightbox configuration
   */
  lightbox: {
    // Animation duration (milliseconds)
    animationDuration: 300,
    
    // Close on overlay click
    closeOnOverlay: true,
    
    // Close on escape key
    closeOnEscape: true,
  },

  /**
   * Smooth scroll configuration
   */
  smoothScroll: {
    // Scroll behavior
    behavior: 'smooth',
    
    // Offset for fixed header (pixels)
    offset: 80,
  },

  /**
   * WebP support test image
   */
  webp: {
    testImage: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
  },
};
