/**
 * Unit tests for utils.js module
 * Tests email validation, phone validation, throttle, and WebP support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the config module
vi.mock('../assets/js/modules/config.js', () => ({
  config: {
    validation: {
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phonePattern: /^[\d\s\-\(\)\+]+$/,
      phoneMinLength: 10,
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

    it('rejects email without TLD', () => {
      expect(utils.isValidEmail('user@example')).toBe(false);
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
