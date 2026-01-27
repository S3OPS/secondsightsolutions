/**
 * Unit tests for form-validation.js module
 * Tests form validation, error handling, and submission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the config and utils modules
vi.mock('../assets/js/modules/config.js', () => ({
  config: {
    validation: {
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phonePattern: /^[\d\s\-\(\)\+]+$/,
      phoneMinLength: 10,
      messages: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        invalidPhone: 'Please enter a valid phone number',
      },
    },
  },
}));

vi.mock('../assets/js/modules/utils.js', () => ({
  utils: {
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidPhone: (phone) => phone.length >= 10 && /^[\d\s\-\(\)\+]+$/.test(phone),
  },
}));

// Import after mocking
const { formValidation } = await import('../assets/js/modules/form-validation.js');

describe('Form Validation Module', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="test-form">
            <input type="text" name="name" required>
            <input type="email" name="email" required>
            <input type="tel" name="phone">
            <textarea name="message" required></textarea>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `, { url: 'http://localhost' });
    document = dom.window.document;
    
    // Replace global document
    vi.stubGlobal('document', document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('init', () => {
    it('initializes without errors', () => {
      expect(() => formValidation.init()).not.toThrow();
    });

    it('sets up event listeners on forms', () => {
      const form = document.querySelector('#test-form');
      const addEventListenerSpy = vi.spyOn(form, 'addEventListener');
      
      formValidation.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
    });
  });

  describe('_showError', () => {
    it('creates error message element', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'Test error message');
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.classList.contains('error-message')).toBe(true);
      expect(errorMsg.textContent).toBe('Test error message');
    });

    it('adds field-error class to field', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'Test error');
      
      expect(field.classList.contains('field-error')).toBe(true);
    });

    it('sets accessibility attributes', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'Test error');
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg.getAttribute('role')).toBe('alert');
      expect(errorMsg.getAttribute('aria-live')).toBe('polite');
    });

    it('clears previous error before showing new one', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'First error');
      formValidation._showError(field, 'Second error');
      
      const errors = document.querySelectorAll('.error-message');
      expect(errors.length).toBe(1);
      expect(errors[0].textContent).toBe('Second error');
    });
  });

  describe('_clearFieldError', () => {
    it('removes error message element', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'Test error');
      formValidation._clearFieldError(field);
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg?.classList.contains('error-message')).toBeFalsy();
    });

    it('removes field-error class from field', () => {
      const field = document.querySelector('input[name="name"]');
      
      formValidation._showError(field, 'Test error');
      formValidation._clearFieldError(field);
      
      expect(field.classList.contains('field-error')).toBe(false);
    });

    it('handles field without error gracefully', () => {
      const field = document.querySelector('input[name="name"]');
      
      expect(() => formValidation._clearFieldError(field)).not.toThrow();
    });
  });

  describe('_validateField', () => {
    it('shows error for empty required field', () => {
      const field = document.querySelector('input[name="name"]');
      field.value = '';
      
      formValidation._validateField(field);
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg?.classList.contains('error-message')).toBe(true);
    });

    it('shows error for invalid email', () => {
      const field = document.querySelector('input[name="email"]');
      field.value = 'invalid-email';
      
      formValidation._validateField(field);
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg?.classList.contains('error-message')).toBe(true);
      expect(errorMsg?.textContent).toContain('email');
    });

    it('clears error for valid input', () => {
      const field = document.querySelector('input[name="email"]');
      field.value = 'valid@example.com';
      
      formValidation._showError(field, 'Previous error');
      formValidation._validateField(field);
      
      const errorMsg = field.nextElementSibling;
      expect(errorMsg?.classList.contains('error-message')).toBeFalsy();
    });

    it('validates non-empty required field without error', () => {
      const field = document.querySelector('input[name="name"]');
      field.value = 'John Doe';
      
      formValidation._validateField(field);
      
      expect(field.classList.contains('field-error')).toBe(false);
    });
  });

  describe('_handleSubmit', () => {
    it('prevents submission when required fields are empty', () => {
      const form = document.querySelector('#test-form');
      const event = new dom.window.Event('submit', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      formValidation._handleSubmit(event, form);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('shows errors for all invalid fields', () => {
      const form = document.querySelector('#test-form');
      const event = new dom.window.Event('submit', { cancelable: true });
      
      formValidation._handleSubmit(event, form);
      
      const errors = document.querySelectorAll('.error-message');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('validates email format on submit', () => {
      const form = document.querySelector('#test-form');
      const nameField = document.querySelector('input[name="name"]');
      const emailField = document.querySelector('input[name="email"]');
      const messageField = document.querySelector('textarea[name="message"]');
      
      nameField.value = 'John Doe';
      emailField.value = 'invalid-email';
      messageField.value = 'Test message';
      
      const event = new dom.window.Event('submit', { cancelable: true });
      formValidation._handleSubmit(event, form);
      
      const emailError = emailField.nextElementSibling;
      expect(emailError?.classList.contains('error-message')).toBe(true);
    });

    it('clears previous errors before validation', () => {
      const form = document.querySelector('#test-form');
      const field = document.querySelector('input[name="name"]');
      
      // Add a pre-existing error
      formValidation._showError(field, 'Old error');
      
      // Fill in the field
      field.value = 'John Doe';
      
      const event = new dom.window.Event('submit', { cancelable: true });
      formValidation._handleSubmit(event, form);
      
      // Old error should be cleared (though new ones might appear for other fields)
      const oldErrors = Array.from(document.querySelectorAll('.error-message'))
        .filter(e => e.textContent === 'Old error');
      expect(oldErrors.length).toBe(0);
    });
  });

  describe('_setupFormValidation', () => {
    it('sets up blur event listeners on inputs', () => {
      const form = document.querySelector('#test-form');
      const input = document.querySelector('input[name="name"]');
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener');
      
      formValidation._setupFormValidation(form);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'blur',
        expect.any(Function),
        { passive: true }
      );
    });

    it('sets up input event listeners for clearing errors', () => {
      const form = document.querySelector('#test-form');
      const input = document.querySelector('input[name="name"]');
      const addEventListenerSpy = vi.spyOn(input, 'addEventListener');
      
      formValidation._setupFormValidation(form);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'input',
        expect.any(Function),
        { passive: true }
      );
    });
  });
});
