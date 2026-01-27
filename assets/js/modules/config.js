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
   * Enhanced with RFC 5322 compliant email and E.164 phone validation
   */
  validation: {
    // Email validation pattern (RFC 5322 simplified but more comprehensive)
    // Validates: user@example.com, user.name@example.co.uk, user+tag@example.com
    emailPattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    
    // Phone validation pattern (basic international format)
    // Allows: digits, spaces, dashes, parentheses, plus sign
    phonePattern: /^[\d\s\-\(\)\+]+$/,
    
    // Strict phone pattern for E.164 international format
    // Validates: +1234567890, +12345678901234 (1-15 digits after optional +)
    phonePatternStrict: /^\+?[1-9]\d{1,14}$/,
    
    // Name validation pattern (2-100 characters, letters, spaces, hyphens, apostrophes)
    // Allows international characters with Unicode support
    namePattern: /^[\p{L}\s\-']{2,100}$/u,
    
    // Minimum phone number length
    phoneMinLength: 10,
    
    // Maximum phone number length
    phoneMaxLength: 20,
    
    // Name constraints
    nameMinLength: 2,
    nameMaxLength: 100,
    
    // Error messages
    messages: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      invalidName: 'Please enter a valid name (2-100 characters)',
      tooShort: 'This field is too short',
      tooLong: 'This field is too long',
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
