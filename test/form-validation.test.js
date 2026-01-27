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
const { formValidation, rateLimit } = await import('../assets/js/modules/form-validation.js');

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

  describe('rateLimit', () => {
    let mockLocalStorage;

    beforeEach(() => {
      mockLocalStorage = {
        store: {},
        getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
        setItem: vi.fn((key, value) => { mockLocalStorage.store[key] = value; }),
        removeItem: vi.fn((key) => { delete mockLocalStorage.store[key]; }),
        clear: vi.fn(() => { mockLocalStorage.store = {}; }),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('canSubmit', () => {
      it('returns true when no previous submissions', () => {
        expect(rateLimit.canSubmit()).toBe(true);
      });

      it('returns true when under rate limit', () => {
        const submissions = [Date.now() - 1000, Date.now() - 2000];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(submissions);
        
        expect(rateLimit.canSubmit()).toBe(true);
      });

      it('returns false when at rate limit', () => {
        const now = Date.now();
        const submissions = [now - 1000, now - 2000, now - 3000];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(submissions);
        
        expect(rateLimit.canSubmit()).toBe(false);
      });

      it('returns true when localStorage fails', () => {
        mockLocalStorage.getItem = vi.fn(() => { throw new Error('Storage error'); });
        
        expect(rateLimit.canSubmit()).toBe(true);
      });

      it('filters out old submissions', () => {
        const now = Date.now();
        // Mix of old (expired) and recent submissions
        const submissions = [
          now - 15 * 60 * 1000, // 15 minutes ago (expired)
          now - 12 * 60 * 1000, // 12 minutes ago (expired)
          now - 1000,           // 1 second ago (recent)
        ];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(submissions);
        
        expect(rateLimit.canSubmit()).toBe(true);
      });
    });

    describe('recordSubmission', () => {
      it('adds new submission to storage', () => {
        rateLimit.recordSubmission();
        
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        const stored = JSON.parse(mockLocalStorage.store['sss_form_submissions']);
        expect(stored.length).toBe(1);
      });

      it('preserves recent submissions', () => {
        const now = Date.now();
        const existing = [now - 1000, now - 2000];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(existing);
        
        rateLimit.recordSubmission();
        
        const stored = JSON.parse(mockLocalStorage.store['sss_form_submissions']);
        expect(stored.length).toBe(3);
      });

      it('cleans old submissions', () => {
        const now = Date.now();
        const existing = [
          now - 15 * 60 * 1000, // 15 minutes ago (will be cleaned)
          now - 1000,           // 1 second ago (will be kept)
        ];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(existing);
        
        rateLimit.recordSubmission();
        
        const stored = JSON.parse(mockLocalStorage.store['sss_form_submissions']);
        expect(stored.length).toBe(2); // Only recent and new
      });

      it('handles localStorage failures silently', () => {
        mockLocalStorage.setItem = vi.fn(() => { throw new Error('Storage error'); });
        
        expect(() => rateLimit.recordSubmission()).not.toThrow();
      });
    });

    describe('getRemainingTime', () => {
      it('returns 0 when no submissions', () => {
        expect(rateLimit.getRemainingTime()).toBe(0);
      });

      it('returns remaining time until window expires', () => {
        const now = Date.now();
        // Oldest submission was 5 minutes ago
        const submissions = [now - 5 * 60 * 1000];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(submissions);
        
        const remaining = rateLimit.getRemainingTime();
        // Should be approximately 5 minutes (300 seconds) remaining
        expect(remaining).toBeGreaterThan(290);
        expect(remaining).toBeLessThanOrEqual(300);
      });

      it('returns 0 when window has expired', () => {
        const now = Date.now();
        // All submissions are old
        const submissions = [now - 15 * 60 * 1000];
        mockLocalStorage.store['sss_form_submissions'] = JSON.stringify(submissions);
        
        expect(rateLimit.getRemainingTime()).toBe(0);
      });

      it('returns 0 when localStorage fails', () => {
        mockLocalStorage.getItem = vi.fn(() => { throw new Error('Storage error'); });
        
        expect(rateLimit.getRemainingTime()).toBe(0);
      });
    });
  });

  describe('_showRateLimitError', () => {
    it('shows rate limit error message', () => {
      const form = document.querySelector('#test-form');
      
      formValidation._showRateLimitError(form, 'Too many submissions');
      
      const errorMsg = document.querySelector('.rate-limit-message');
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.textContent).toBe('Too many submissions');
    });

    it('inserts error before submit button', () => {
      const form = document.querySelector('#test-form');
      const submitButton = form.querySelector('[type="submit"]');
      
      formValidation._showRateLimitError(form, 'Rate limit error');
      
      const errorMsg = document.querySelector('.rate-limit-message');
      expect(errorMsg.nextElementSibling).toBe(submitButton);
    });

    it('prepends error to form when no submit button', () => {
      const form = document.querySelector('#test-form');
      const submitButton = form.querySelector('[type="submit"]');
      submitButton.removeAttribute('type');
      
      formValidation._showRateLimitError(form, 'Rate limit error');
      
      const errorMsg = document.querySelector('.rate-limit-message');
      expect(errorMsg.parentElement).toBe(form);
    });

    it('sets accessibility attributes', () => {
      const form = document.querySelector('#test-form');
      
      formValidation._showRateLimitError(form, 'Rate limit error');
      
      const errorMsg = document.querySelector('.rate-limit-message');
      expect(errorMsg.getAttribute('role')).toBe('alert');
      expect(errorMsg.getAttribute('aria-live')).toBe('assertive');
    });
  });
});
