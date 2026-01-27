/**
 * Form Validation Module
 * Handles client-side form validation with accessibility support
 */

import { utils } from './utils.js';
import { config } from './config.js';

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
