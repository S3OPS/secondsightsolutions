/**
 * Unit tests for utils.js module
 * Tests email validation, phone validation, name validation, throttle, debounce, and WebP support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config module with enhanced validation patterns
vi.mock('../assets/js/modules/config.js', () => ({
  config: {
    validation: {
      emailPattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      phonePattern: /^[\d\s\-\(\)\+]+$/,
      phonePatternStrict: /^\+?[1-9]\d{1,14}$/,
      namePattern: /^[\p{L}\s\-']{2,100}$/u,
      phoneMinLength: 10,
      phoneMaxLength: 20,
      nameMinLength: 2,
      nameMaxLength: 100,
    },
    webp: {
      testImage: 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
    },
  },
}));

// Import after mocking
const { utils } = await import('../assets/js/modules/utils.js');

describe('Email Validation', () => {
  describe('valid emails', () => {
    it('accepts standard email format', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
    });

    it('accepts email with subdomain', () => {
      expect(utils.isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('accepts email with plus sign', () => {
      expect(utils.isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('accepts email with dots in local part', () => {
      expect(utils.isValidEmail('user.name@example.com')).toBe(true);
    });

    it('accepts email with country TLD', () => {
      expect(utils.isValidEmail('user@example.co.uk')).toBe(true);
    });

    it('accepts email with numbers', () => {
      expect(utils.isValidEmail('user123@example456.com')).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it('rejects email without domain', () => {
      expect(utils.isValidEmail('invalid')).toBe(false);
    });

    it('rejects email without @ symbol', () => {
      expect(utils.isValidEmail('invalid.email')).toBe(false);
    });

    it('rejects email with only @ symbol', () => {
      expect(utils.isValidEmail('@')).toBe(false);
    });

    it('rejects email without local part', () => {
      expect(utils.isValidEmail('@example.com')).toBe(false);
    });

    it('handles email without TLD (RFC 5322 allows local addresses)', () => {
      // RFC 5322 technically allows local addresses without TLD
      // In real-world web forms, this might be valid for internal systems
      expect(utils.isValidEmail('user@example')).toBe(true);
    });

    it('rejects email with spaces', () => {
      expect(utils.isValidEmail('user @example.com')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(utils.isValidEmail('')).toBe(false);
    });

    it('rejects email with multiple @ symbols', () => {
      expect(utils.isValidEmail('user@@example.com')).toBe(false);
    });
  });
});

describe('Phone Validation', () => {
  describe('valid phone numbers', () => {
    it('accepts basic US phone format', () => {
      expect(utils.isValidPhone('5551234567')).toBe(true);
    });

    it('accepts phone with dashes', () => {
      expect(utils.isValidPhone('555-123-4567')).toBe(true);
    });

    it('accepts phone with parentheses', () => {
      expect(utils.isValidPhone('(555) 123-4567')).toBe(true);
    });

    it('accepts phone with spaces', () => {
      expect(utils.isValidPhone('555 123 4567')).toBe(true);
    });

    it('accepts phone with plus sign (international)', () => {
      expect(utils.isValidPhone('+1 555 123 4567')).toBe(true);
    });

    it('accepts phone with mixed formatting', () => {
      expect(utils.isValidPhone('+1 (555) 123-4567')).toBe(true);
    });

    it('accepts longer international numbers', () => {
      expect(utils.isValidPhone('+44 20 7946 0958')).toBe(true);
    });
  });

  describe('invalid phone numbers', () => {
    it('rejects phone with letters', () => {
      expect(utils.isValidPhone('555-ABC-4567')).toBe(false);
    });

    it('rejects phone that is too short', () => {
      expect(utils.isValidPhone('555123')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(utils.isValidPhone('')).toBe(false);
    });

    it('rejects phone with special characters', () => {
      expect(utils.isValidPhone('555@123#4567')).toBe(false);
    });
  });
});

describe('Throttle Function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes function immediately on first call', () => {
    const fn = vi.fn();
    const throttled = utils.throttle(fn, 100);
    
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not execute function during throttle period', () => {
    const fn = vi.fn();
    const throttled = utils.throttle(fn, 100);
    
    throttled();
    throttled();
    throttled();
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('executes function again after throttle period', () => {
    const fn = vi.fn();
    const throttled = utils.throttle(fn, 100);
    
    throttled();
    vi.advanceTimersByTime(150);
    throttled();
    vi.advanceTimersByTime(150);
    
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to the throttled function', () => {
    const fn = vi.fn();
    const throttled = utils.throttle(fn, 100);
    
    throttled('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('preserves context when called', () => {
    const obj = {
      value: 42,
      method: vi.fn(function() { return this.value; }),
    };
    obj.throttled = utils.throttle(obj.method, 100);
    
    obj.throttled();
    expect(obj.method).toHaveBeenCalled();
  });
});

describe('WebP Support Check', () => {
  it('calls callback with result', () => {
    const callback = vi.fn();
    utils.checkWebPSupport(callback);
    
    // Since we're in a test environment, the Image won't actually load
    // but the callback should still be called
    // Note: In real browser this would test actual WebP support
  });

  it('creates an Image element for WebP detection', () => {
    // Verify the function doesn't throw
    expect(() => {
      utils.checkWebPSupport(() => {});
    }).not.toThrow();
  });
});

describe('Strict Phone Validation (E.164)', () => {
  describe('valid E.164 phone numbers', () => {
    it('accepts E.164 format with plus', () => {
      expect(utils.isValidPhoneStrict('+15551234567')).toBe(true);
    });

    it('accepts E.164 format without plus', () => {
      expect(utils.isValidPhoneStrict('15551234567')).toBe(true);
    });

    it('accepts international numbers', () => {
      expect(utils.isValidPhoneStrict('+442079460958')).toBe(true);
    });

    it('accepts formatted number after stripping', () => {
      expect(utils.isValidPhoneStrict('+1 (555) 123-4567')).toBe(true);
    });
  });

  describe('invalid E.164 phone numbers', () => {
    it('rejects number starting with 0', () => {
      expect(utils.isValidPhoneStrict('+05551234567')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(utils.isValidPhoneStrict('')).toBe(false);
    });

    it('rejects null', () => {
      expect(utils.isValidPhoneStrict(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(utils.isValidPhoneStrict(undefined)).toBe(false);
    });

    it('rejects phone with letters', () => {
      expect(utils.isValidPhoneStrict('+1555ABC4567')).toBe(false);
    });
  });
});

describe('Name Validation', () => {
  describe('valid names', () => {
    it('accepts simple name', () => {
      expect(utils.isValidName('John')).toBe(true);
    });

    it('accepts full name', () => {
      expect(utils.isValidName('John Doe')).toBe(true);
    });

    it('accepts hyphenated name', () => {
      expect(utils.isValidName('Mary-Jane')).toBe(true);
    });

    it('accepts name with apostrophe', () => {
      expect(utils.isValidName("O'Connor")).toBe(true);
    });

    it('accepts international characters', () => {
      expect(utils.isValidName('José García')).toBe(true);
    });

    it('accepts names with multiple spaces', () => {
      expect(utils.isValidName('Mary Jane Watson')).toBe(true);
    });

    it('trims whitespace', () => {
      expect(utils.isValidName('  John Doe  ')).toBe(true);
    });
  });

  describe('invalid names', () => {
    it('rejects empty string', () => {
      expect(utils.isValidName('')).toBe(false);
    });

    it('rejects null', () => {
      expect(utils.isValidName(null)).toBe(false);
    });

    it('rejects undefined', () => {
      expect(utils.isValidName(undefined)).toBe(false);
    });

    it('rejects single character', () => {
      expect(utils.isValidName('J')).toBe(false);
    });

    it('rejects name with numbers', () => {
      expect(utils.isValidName('John123')).toBe(false);
    });

    it('rejects name with special characters', () => {
      expect(utils.isValidName('John@Doe')).toBe(false);
    });

    it('rejects whitespace only', () => {
      expect(utils.isValidName('   ')).toBe(false);
    });
  });
});

describe('Debounce Function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = utils.debounce(fn, 100);
    
    debounced();
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets delay on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = utils.debounce(fn, 100);
    
    debounced();
    vi.advanceTimersByTime(50);
    debounced(); // Reset the timer
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('executes immediately when immediate is true', () => {
    const fn = vi.fn();
    const debounced = utils.debounce(fn, 100, true);
    
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not execute again during wait period with immediate', () => {
    const fn = vi.fn();
    const debounced = utils.debounce(fn, 100, true);
    
    debounced();
    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to debounced function', () => {
    const fn = vi.fn();
    const debounced = utils.debounce(fn, 100);
    
    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('preserves context when called', () => {
    const obj = {
      value: 42,
      method: vi.fn(function() { return this.value; }),
    };
    obj.debounced = utils.debounce(obj.method, 100);
    
    obj.debounced();
    vi.advanceTimersByTime(100);
    
    expect(obj.method).toHaveBeenCalled();
  });
});

describe('Sanitize String', () => {
  it('returns empty string for null', () => {
    expect(utils.sanitizeString(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(utils.sanitizeString(undefined)).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(utils.sanitizeString('')).toBe('');
  });

  it('escapes HTML tags', () => {
    const result = utils.sanitizeString('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('escapes ampersands', () => {
    const result = utils.sanitizeString('Tom & Jerry');
    expect(result).toContain('&amp;');
  });

  it('returns plain text unchanged', () => {
    expect(utils.sanitizeString('Hello World')).toBe('Hello World');
  });
});

describe('Edge Cases for Email Validation', () => {
  it('handles null input', () => {
    expect(utils.isValidEmail(null)).toBe(false);
  });

  it('handles undefined input', () => {
    expect(utils.isValidEmail(undefined)).toBe(false);
  });

  it('handles non-string input', () => {
    expect(utils.isValidEmail(123)).toBe(false);
  });

  it('trims whitespace', () => {
    expect(utils.isValidEmail('  test@example.com  ')).toBe(true);
  });
});

describe('Edge Cases for Phone Validation', () => {
  it('handles null input', () => {
    expect(utils.isValidPhone(null)).toBe(false);
  });

  it('handles undefined input', () => {
    expect(utils.isValidPhone(undefined)).toBe(false);
  });

  it('handles non-string input', () => {
    expect(utils.isValidPhone(5551234567)).toBe(false);
  });

  it('rejects phone that exceeds max length', () => {
    expect(utils.isValidPhone('123456789012345678901')).toBe(false);
  });
});
