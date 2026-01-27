/**
 * Unit tests for lazy-loading.js module
 * Tests lazy loading initialization and fallback behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock the config module
vi.mock('../assets/js/modules/config.js', () => ({
  config: {
    lazyLoading: {
      rootMargin: '50px 0px',
      threshold: 0.01,
    },
  },
}));

// Import after mocking
const { lazyLoading } = await import('../assets/js/modules/lazy-loading.js');

describe('Lazy Loading Module', () => {
  let dom;
  let document;
  let originalHTMLImageElement;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <img src="image1.jpg" loading="lazy" alt="Lazy image 1">
          <img src="image2.jpg" loading="lazy" alt="Lazy image 2">
          <img data-src="image3.jpg" alt="Fallback lazy image">
        </body>
      </html>
    `, { url: 'http://localhost' });
    document = dom.window.document;

    // Store original HTMLImageElement
    originalHTMLImageElement = global.HTMLImageElement;

    // Replace global document and window
    vi.stubGlobal('document', document);
    vi.stubGlobal('window', dom.window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.HTMLImageElement = originalHTMLImageElement;
  });

  describe('init', () => {
    it('initializes without errors', () => {
      expect(() => lazyLoading.init()).not.toThrow();
    });

    it('calls native lazy loading when supported', () => {
      // Mock native lazy loading support
      const mockHTMLImageElement = {
        prototype: { loading: true },
      };
      vi.stubGlobal('HTMLImageElement', mockHTMLImageElement);

      const initNativeSpy = vi.spyOn(lazyLoading, '_initNativeLazyLoading');

      lazyLoading.init();

      expect(initNativeSpy).toHaveBeenCalled();
    });

    it('calls fallback lazy loading when native not supported', () => {
      // Mock no native lazy loading support
      const mockHTMLImageElement = {
        prototype: {},
      };
      vi.stubGlobal('HTMLImageElement', mockHTMLImageElement);

      const initFallbackSpy = vi.spyOn(lazyLoading, '_initFallbackLazyLoading');

      lazyLoading.init();

      expect(initFallbackSpy).toHaveBeenCalled();
    });
  });

  describe('_initNativeLazyLoading', () => {
    it('selects images with loading="lazy" attribute', () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      expect(images.length).toBe(2);
    });

    it('adds load event listener to images', () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      const addEventListenerSpies = Array.from(images).map(img =>
        vi.spyOn(img, 'addEventListener')
      );

      lazyLoading._initNativeLazyLoading();

      addEventListenerSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledWith(
          'load',
          expect.any(Function),
          { once: true, passive: true }
        );
      });
    });

    it('adds loaded class when image loads', () => {
      const img = document.querySelector('img[loading="lazy"]');

      lazyLoading._initNativeLazyLoading();

      // Simulate load event
      const loadEvent = new dom.window.Event('load');
      img.dispatchEvent(loadEvent);

      expect(img.classList.contains('loaded')).toBe(true);
    });
  });

  describe('_initFallbackLazyLoading', () => {
    it('selects images with data-src attribute', () => {
      const images = document.querySelectorAll('img[data-src]');
      expect(images.length).toBe(1);
    });

    describe('with IntersectionObserver support', () => {
      let mockObserver;
      let observeCallback;

      beforeEach(() => {
        mockObserver = {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
        };

        // Mock IntersectionObserver on the window object used by the module
        observeCallback = null;
        const MockIntersectionObserver = vi.fn((callback) => {
          observeCallback = callback;
          return mockObserver;
        });

        // The module uses window.IntersectionObserver, we need to mock it on dom.window
        dom.window.IntersectionObserver = MockIntersectionObserver;
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
      });

      it('creates an IntersectionObserver', () => {
        lazyLoading._initFallbackLazyLoading();

        expect(dom.window.IntersectionObserver).toHaveBeenCalled();
      });

      it('observes images with data-src', () => {
        lazyLoading._initFallbackLazyLoading();

        expect(mockObserver.observe).toHaveBeenCalled();
      });

      it('sets src from data-src when image intersects', () => {
        const img = document.querySelector('img[data-src]');
        img.dataset.src = 'test-image.jpg';

        lazyLoading._initFallbackLazyLoading();

        // Simulate intersection
        observeCallback([{ isIntersecting: true, target: img }]);

        expect(img.src).toContain('test-image.jpg');
        expect(img.classList.contains('loaded')).toBe(true);
        expect(mockObserver.unobserve).toHaveBeenCalledWith(img);
      });

      it('does not load image if not intersecting', () => {
        const img = document.querySelector('img[data-src]');
        const originalSrc = img.src;

        lazyLoading._initFallbackLazyLoading();

        // Simulate non-intersection
        observeCallback([{ isIntersecting: false, target: img }]);

        expect(img.src).toBe(originalSrc);
        expect(mockObserver.unobserve).not.toHaveBeenCalled();
      });

      it('uses config values for IntersectionObserver options', () => {
        lazyLoading._initFallbackLazyLoading();

        expect(dom.window.IntersectionObserver).toHaveBeenCalledWith(
          expect.any(Function),
          {
            rootMargin: '50px 0px',
            threshold: 0.01,
          }
        );
      });
    });

    describe('without IntersectionObserver support', () => {
      beforeEach(() => {
        // Remove IntersectionObserver from window by deleting it
        delete dom.window.IntersectionObserver;
      });

      it('loads all images immediately as fallback', () => {
        const img = document.querySelector('img[data-src]');
        img.dataset.src = 'fallback-image.jpg';

        lazyLoading._initFallbackLazyLoading();

        expect(img.src).toContain('fallback-image.jpg');
        expect(img.classList.contains('loaded')).toBe(true);
      });
    });
  });
});
