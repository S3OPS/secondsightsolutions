/**
 * Unit tests for config.js module
 * Tests configuration values and utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../assets/js/modules/config.js';

describe('Config Module', () => {
  describe('isDevelopment', () => {
    let originalLocation;

    beforeEach(() => {
      originalLocation = window.location;
    });

    afterEach(() => {
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('returns true for localhost', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost', protocol: 'http:' },
        writable: true,
      });
      expect(config.isDevelopment()).toBe(true);
    });

    it('returns true for 127.0.0.1', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: '127.0.0.1', protocol: 'http:' },
        writable: true,
      });
      expect(config.isDevelopment()).toBe(true);
    });

    it('returns true for empty hostname', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: '', protocol: 'file:' },
        writable: true,
      });
      expect(config.isDevelopment()).toBe(true);
    });

    it('returns true for non-HTTPS protocol', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'example.com', protocol: 'http:' },
        writable: true,
      });
      expect(config.isDevelopment()).toBe(true);
    });

    it('returns false for production HTTPS', () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'secondsightsolutions.com', protocol: 'https:' },
        writable: true,
      });
      expect(config.isDevelopment()).toBe(false);
    });
  });

  describe('scroll configuration', () => {
    it('has mobile CTA threshold defined', () => {
      expect(config.scroll.mobileCtaThreshold).toBe(300);
    });

    it('has passive listeners enabled', () => {
      expect(config.scroll.passiveListeners).toBe(true);
    });
  });

  describe('lazyLoading configuration', () => {
    it('has root margin defined', () => {
      expect(config.lazyLoading.rootMargin).toBe('50px 0px');
    });

    it('has threshold defined', () => {
      expect(config.lazyLoading.threshold).toBe(0.01);
    });
  });

  describe('validation configuration', () => {
    it('has email pattern as regex', () => {
      expect(config.validation.emailPattern).toBeInstanceOf(RegExp);
    });

    it('has phone pattern as regex', () => {
      expect(config.validation.phonePattern).toBeInstanceOf(RegExp);
    });

    it('has strict phone pattern as regex', () => {
      expect(config.validation.phonePatternStrict).toBeInstanceOf(RegExp);
    });

    it('has name pattern as regex', () => {
      expect(config.validation.namePattern).toBeInstanceOf(RegExp);
    });

    it('has phone min length defined', () => {
      expect(config.validation.phoneMinLength).toBe(10);
    });

    it('has phone max length defined', () => {
      expect(config.validation.phoneMaxLength).toBe(20);
    });

    it('has name min length defined', () => {
      expect(config.validation.nameMinLength).toBe(2);
    });

    it('has name max length defined', () => {
      expect(config.validation.nameMaxLength).toBe(100);
    });

    it('has error messages defined', () => {
      expect(config.validation.messages.required).toBeDefined();
      expect(config.validation.messages.invalidEmail).toBeDefined();
      expect(config.validation.messages.invalidPhone).toBeDefined();
      expect(config.validation.messages.invalidName).toBeDefined();
      expect(config.validation.messages.tooShort).toBeDefined();
      expect(config.validation.messages.tooLong).toBeDefined();
    });

    it('email pattern matches valid emails', () => {
      expect(config.validation.emailPattern.test('test@example.com')).toBe(true);
    });

    it('email pattern matches emails with plus tags', () => {
      expect(config.validation.emailPattern.test('user+tag@example.com')).toBe(true);
    });

    it('email pattern rejects invalid emails', () => {
      expect(config.validation.emailPattern.test('invalid')).toBe(false);
    });

    it('phone pattern matches valid phones', () => {
      expect(config.validation.phonePattern.test('555-123-4567')).toBe(true);
    });

    it('phone pattern rejects invalid phones', () => {
      expect(config.validation.phonePattern.test('abc-def-ghij')).toBe(false);
    });

    it('strict phone pattern matches E.164 format', () => {
      expect(config.validation.phonePatternStrict.test('+15551234567')).toBe(true);
    });

    it('strict phone pattern rejects invalid format', () => {
      expect(config.validation.phonePatternStrict.test('555-123-4567')).toBe(false);
    });

    it('name pattern matches valid names', () => {
      expect(config.validation.namePattern.test('John Doe')).toBe(true);
    });

    it('name pattern matches names with hyphens', () => {
      expect(config.validation.namePattern.test("Mary-Jane O'Connor")).toBe(true);
    });

    it('name pattern rejects names with numbers', () => {
      expect(config.validation.namePattern.test('John123')).toBe(false);
    });
  });

  describe('analytics configuration', () => {
    it('has Google Analytics ID', () => {
      expect(config.analytics.googleId).toBeDefined();
    });

    it('has Plausible domain', () => {
      expect(config.analytics.plausibleDomain).toBe('secondsightsolutions.com');
    });

    it('has event names defined', () => {
      expect(config.analytics.events.outboundClick).toBeDefined();
      expect(config.analytics.events.formSubmit).toBeDefined();
    });
  });

  describe('performance configuration', () => {
    it('has enabled function', () => {
      expect(typeof config.performance.enabled).toBe('function');
    });

    it('has metrics array', () => {
      expect(config.performance.metrics).toBeInstanceOf(Array);
      expect(config.performance.metrics).toContain('FCP');
      expect(config.performance.metrics).toContain('LCP');
      expect(config.performance.metrics).toContain('CLS');
    });
  });

  describe('lightbox configuration', () => {
    it('has animation duration defined', () => {
      expect(config.lightbox.animationDuration).toBe(300);
    });

    it('has close on overlay enabled', () => {
      expect(config.lightbox.closeOnOverlay).toBe(true);
    });

    it('has close on escape enabled', () => {
      expect(config.lightbox.closeOnEscape).toBe(true);
    });
  });

  describe('smoothScroll configuration', () => {
    it('has behavior defined', () => {
      expect(config.smoothScroll.behavior).toBe('smooth');
    });

    it('has offset defined', () => {
      expect(config.smoothScroll.offset).toBe(80);
    });
  });

  describe('webp configuration', () => {
    it('has test image defined', () => {
      expect(config.webp.testImage).toBeDefined();
      expect(config.webp.testImage).toContain('data:image/webp;base64,');
    });
  });
});
