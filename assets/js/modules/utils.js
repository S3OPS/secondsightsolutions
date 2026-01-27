/**
 * Utility Module
 * Common helper functions used across the application
 * Optimized for performance with enhanced validation
 */

import { config } from './config.js';

export const utils = {
  /**
   * Email validation using RFC 5322 compliant pattern
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid email format
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return config.validation.emailPattern.test(email.trim());
  },

  /**
   * Phone number validation with flexible formatting
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid phone format
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    const trimmedPhone = phone.trim();
    return trimmedPhone.length >= config.validation.phoneMinLength && 
           trimmedPhone.length <= config.validation.phoneMaxLength &&
           config.validation.phonePattern.test(trimmedPhone);
  },

  /**
   * Strict phone validation using E.164 international format
   * Use this for backend validation or when precise format is needed
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid E.164 phone format
   */
  isValidPhoneStrict(phone) {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    // Remove formatting characters for strict validation
    const digitsOnly = phone.replace(/[\s\-\(\)]/g, '');
    return config.validation.phonePatternStrict.test(digitsOnly);
  },

  /**
   * Name validation with international character support
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid name format
   */
  isValidName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    const trimmedName = name.trim();
    if (trimmedName.length < config.validation.nameMinLength ||
        trimmedName.length > config.validation.nameMaxLength) {
      return false;
    }
    return config.validation.namePattern.test(trimmedName);
  },

  /**
   * Throttle function execution - limits how often a function can fire
   * Good for scroll/resize handlers
   * @param {Function} func - Function to throttle
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, wait) {
    let timeout;
    let lastRan;
    
    return function(...args) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if ((Date.now() - lastRan) >= wait) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, wait - (Date.now() - lastRan));
      }
    };
  },

  /**
   * Debounce function execution - delays execution until after wait period
   * Good for search/input handlers where you want to wait for user to stop typing
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately on first call
   * @returns {Function} Debounced function
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    
    return function(...args) {
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          func.apply(this, args);
        }
      }, wait);
      
      if (callNow) {
        func.apply(this, args);
      }
    };
  },

  /**
   * Sanitize string for safe display (prevent basic XSS)
   * Note: Use textContent for DOM insertion when possible
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeString(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Check WebP support
   * @param {Function} callback - Callback with boolean result
   */
  checkWebPSupport(callback) {
    const img = new Image();
    
    img.onload = img.onerror = function() {
      callback(img.height === 1);
    };
    
    img.src = config.webp.testImage;
  }
};
