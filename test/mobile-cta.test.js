/**
 * Unit tests for mobile-cta.js module
 * Tests mobile call-to-action visibility on scroll
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the config module
vi.mock('../assets/js/modules/config.js', () => ({
  config: {
    scroll: {
      mobileCtaThreshold: 300,
    },
  },
}));

// Import after mocking
const { mobileCTA } = await import('../assets/js/modules/mobile-cta.js');

describe('Mobile CTA Module', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div style="height: 2000px;">
            <a href="contact.html" class="mobile-cta">Request a Quote</a>
          </div>
        </body>
      </html>
    `, { url: 'http://localhost' });
    document = dom.window.document;

    // Replace global document and window
    vi.stubGlobal('document', document);
    vi.stubGlobal('window', dom.window);

    // Reset mobileCTA state
    mobileCTA.lastScroll = 0;
    mobileCTA.ticking = false;
    mobileCTA.ctaElement = null;

    // Mock scrollY
    Object.defineProperty(dom.window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });

    // Mock requestAnimationFrame
    dom.window.requestAnimationFrame = vi.fn((callback) => {
      callback();
      return 1;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('init', () => {
    it('initializes without errors', () => {
      expect(() => mobileCTA.init()).not.toThrow();
    });

    it('sets ctaElement reference', () => {
      mobileCTA.init();
      expect(mobileCTA.ctaElement).not.toBeNull();
    });

    it('returns early if no CTA element found', () => {
      document.querySelector('.mobile-cta').remove();
      
      const addEventListenerSpy = vi.spyOn(dom.window, 'addEventListener');
      mobileCTA.init();
      
      expect(mobileCTA.ctaElement).toBeNull();
      expect(addEventListenerSpy).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
    });

    it('adds scroll event listener', () => {
      const addEventListenerSpy = vi.spyOn(dom.window, 'addEventListener');
      
      mobileCTA.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    });
  });

  describe('_handleScroll', () => {
    beforeEach(() => {
      mobileCTA.ctaElement = document.querySelector('.mobile-cta');
    });

    it('calls requestAnimationFrame when not ticking', () => {
      mobileCTA.ticking = false;
      
      mobileCTA._handleScroll();
      
      expect(dom.window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('sets ticking to true after calling requestAnimationFrame', () => {
      mobileCTA.ticking = false;
      
      // Prevent the callback from being called to check ticking state
      dom.window.requestAnimationFrame = vi.fn(() => 1);
      
      mobileCTA._handleScroll();
      
      expect(mobileCTA.ticking).toBe(true);
    });

    it('does not call requestAnimationFrame when already ticking', () => {
      mobileCTA.ticking = true;
      dom.window.requestAnimationFrame = vi.fn();
      
      mobileCTA._handleScroll();
      
      expect(dom.window.requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('_updateCTA', () => {
    beforeEach(() => {
      mobileCTA.ctaElement = document.querySelector('.mobile-cta');
      mobileCTA.lastScroll = 0;
      mobileCTA.ticking = true;
    });

    it('shows CTA when scrolling down past threshold', () => {
      // Scroll position past threshold (300), scrolling down
      Object.defineProperty(dom.window, 'scrollY', { value: 400, writable: true, configurable: true });
      mobileCTA.lastScroll = 200;
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(true);
      expect(mobileCTA.ctaElement.classList.contains('hidden')).toBe(false);
    });

    it('hides CTA when scrolling up', () => {
      // Previously scrolled down, now scrolling up
      Object.defineProperty(dom.window, 'scrollY', { value: 200, writable: true, configurable: true });
      mobileCTA.lastScroll = 400;
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.ctaElement.classList.contains('hidden')).toBe(true);
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(false);
    });

    it('does not show CTA when below threshold', () => {
      // Below threshold (300)
      Object.defineProperty(dom.window, 'scrollY', { value: 100, writable: true, configurable: true });
      mobileCTA.lastScroll = 50;
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(false);
    });

    it('does not show CTA when scrolling up past threshold', () => {
      // Above threshold but scrolling up
      Object.defineProperty(dom.window, 'scrollY', { value: 350, writable: true, configurable: true });
      mobileCTA.lastScroll = 400;
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.ctaElement.classList.contains('hidden')).toBe(true);
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(false);
    });

    it('updates lastScroll after update', () => {
      Object.defineProperty(dom.window, 'scrollY', { value: 500, writable: true, configurable: true });
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.lastScroll).toBe(500);
    });

    it('resets ticking to false after update', () => {
      mobileCTA.ticking = true;
      
      mobileCTA._updateCTA();
      
      expect(mobileCTA.ticking).toBe(false);
    });

    it('does not change CTA state when scroll position equals lastScroll', () => {
      Object.defineProperty(dom.window, 'scrollY', { value: 400, writable: true, configurable: true });
      mobileCTA.lastScroll = 400;
      
      mobileCTA._updateCTA();
      
      // Neither visible nor hidden class should be added in this case
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(false);
      expect(mobileCTA.ctaElement.classList.contains('hidden')).toBe(false);
    });
  });

  describe('scroll integration', () => {
    it('shows and hides CTA through scroll simulation', () => {
      mobileCTA.init();
      
      // Scroll down past threshold
      Object.defineProperty(dom.window, 'scrollY', { value: 400, writable: true, configurable: true });
      mobileCTA.lastScroll = 100;
      mobileCTA.ticking = false;
      mobileCTA._handleScroll();
      
      expect(mobileCTA.ctaElement.classList.contains('visible')).toBe(true);
      
      // Scroll up
      Object.defineProperty(dom.window, 'scrollY', { value: 300, writable: true, configurable: true });
      mobileCTA.ticking = false;
      mobileCTA._handleScroll();
      
      expect(mobileCTA.ctaElement.classList.contains('hidden')).toBe(true);
    });
  });
});
