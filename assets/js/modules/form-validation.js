/**
 * Form Validation Module
 * Handles client-side form validation with accessibility support
 * Includes rate limiting to prevent spam submissions
 */

import { utils } from './utils.js';
import { config } from './config.js';

/**
 * Rate limiting configuration and tracking
 * Prevents spam by limiting form submissions per time window
 */
const rateLimit = {
  maxSubmissions: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes
  storageKey: 'sss_form_submissions',

  /**
   * Check if user can submit the form
   * @returns {boolean} True if submission is allowed
   */
  canSubmit() {
    try {
      const submissions = JSON.parse(
        localStorage.getItem(this.storageKey) || '[]'
      );
      const now = Date.now();
      const recentSubmissions = submissions.filter(
        (time) => now - time < this.windowMs
      );
      return recentSubmissions.length < this.maxSubmissions;
    } catch {
      return true; // Allow if localStorage fails
    }
  },

  /**
   * Record a form submission
   */
  recordSubmission() {
    try {
      const submissions = JSON.parse(
        localStorage.getItem(this.storageKey) || '[]'
      );
      const now = Date.now();

      // Add new submission
      submissions.push(now);

      // Clean old submissions
      const cleaned = submissions.filter(
        (time) => now - time < this.windowMs
      );

      localStorage.setItem(this.storageKey, JSON.stringify(cleaned));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  },

  /**
   * Get remaining time until rate limit resets (in seconds)
   * @returns {number} Seconds until reset, or 0 if not rate limited
   */
  getRemainingTime() {
    try {
      const submissions = JSON.parse(
        localStorage.getItem(this.storageKey) || '[]'
      );
      if (submissions.length === 0) return 0;

      const oldest = Math.min(...submissions);
      const elapsed = Date.now() - oldest;
      return Math.max(0, Math.ceil((this.windowMs - elapsed) / 1000));
    } catch {
      return 0;
    }
  },
};

export const formValidation = {
  /**
   * Initialize form validation for all forms on the page
   */
  init() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => this._setupFormValidation(form));
  },

  /**
   * Setup validation for a specific form
   * @param {HTMLFormElement} form - The form element to validate
   * @private
   */
  _setupFormValidation(form) {
    form.addEventListener('submit', (e) => this._handleSubmit(e, form));
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this._validateField(input), { passive: true });
      input.addEventListener('input', () => this._clearFieldError(input), { passive: true });
    });
  },

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   * @param {HTMLFormElement} form - Form being submitted
   * @private
   */
  _handleSubmit(e, form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Clear previous error messages
    form.querySelectorAll('.error-message').forEach(msg => msg.remove());
    form.querySelectorAll('.rate-limit-message').forEach(msg => msg.remove());

    // Check rate limiting first
    if (!rateLimit.canSubmit()) {
      e.preventDefault();
      const remainingTime = rateLimit.getRemainingTime();
      const minutes = Math.ceil(remainingTime / 60);
      this._showRateLimitError(form, 
        `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
      );
      return;
    }
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        this._showError(field, config.validation.messages.required);
      } else if (field.type === 'email' && !utils.isValidEmail(field.value)) {
        isValid = false;
        this._showError(field, config.validation.messages.invalidEmail);
      } else if (field.type === 'tel' && !utils.isValidPhone(field.value)) {
        isValid = false;
        this._showError(field, config.validation.messages.invalidPhone);
      }
    });
    
    if (!isValid) {
      e.preventDefault();
      
      // Focus first error field
      const firstError = form.querySelector('.error-message');
      if (firstError && firstError.previousElementSibling) {
        firstError.previousElementSibling.focus();
      }
    } else {
      // Record successful submission attempt
      rateLimit.recordSubmission();
    }
  },

  /**
   * Show rate limit error message on form
   * @param {HTMLFormElement} form - Form to show error on
   * @param {string} message - Error message to display
   * @private
   */
  _showRateLimitError(form, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'rate-limit-message error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');
    
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.parentNode.insertBefore(errorDiv, submitButton);
    } else {
      form.prepend(errorDiv);
    }
  },

  /**
   * Validate a single field
   * @param {HTMLInputElement|HTMLTextAreaElement} field - Field to validate
   * @private
   */
  _validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
      this._showError(field, config.validation.messages.required);
    } else if (field.type === 'email' && field.value && !utils.isValidEmail(field.value)) {
      this._showError(field, config.validation.messages.invalidEmail);
    } else {
      this._clearFieldError(field);
    }
  },

  /**
   * Show error message for a field
   * @param {HTMLElement} field - Field with error
   * @param {string} message - Error message to display
   * @private
   */
  _showError(field, message) {
    this._clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    
    field.classList.add('field-error');
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  },

  /**
   * Clear error from a field
   * @param {HTMLElement} field - Field to clear error from
   * @private
   */
  _clearFieldError(field) {
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
      errorMsg.remove();
    }
    field.classList.remove('field-error');
  }
};

// Export rate limit for testing
export { rateLimit };
