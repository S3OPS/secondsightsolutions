/**
 * Utility Module
 * Common helper functions used across the application
 */

import { config } from './config.js';

export const utils = {
  /**
   * Email validation
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid email format
   */
  isValidEmail(email) {
    return config.validation.emailPattern.test(email);
  },

  /**
   * Phone number validation
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid phone format
   */
  isValidPhone(phone) {
    return phone.length >= config.validation.phoneMinLength && 
           config.validation.phonePattern.test(phone);
  },

  /**
   * Throttle function execution
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
