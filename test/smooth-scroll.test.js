/**
 * Unit tests for smooth-scroll.js module
 * Tests smooth scrolling for anchor links
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Import the smooth scroll module
const { smoothScroll } = await import('../assets/js/modules/smooth-scroll.js');

describe('Smooth Scroll Module', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <nav>
            <a href="#section1">Section 1</a>
            <a href="#section2">Section 2</a>
            <a href="#">Skip Link</a>
            <a href="other-page.html">External Link</a>
            <a href="#nonexistent">Non-existent Section</a>
          </nav>
          <main>
            <section id="section1" style="height: 500px;">
              <h2>Section 1</h2>
            </section>
            <section id="section2" style="height: 500px;">
              <h2>Section 2</h2>
            </section>
          </main>
        </body>
      </html>
    `, { url: 'http://localhost' });
    document = dom.window.document;

    // Replace global document and window
    vi.stubGlobal('document', document);
    vi.stubGlobal('window', dom.window);

    // Mock history.pushState - the module uses global `history` object
    const mockPushState = vi.fn();
    vi.stubGlobal('history', {
      pushState: mockPushState,
    });

    // Mock scrollIntoView for all elements (JSDOM doesn't support it)
    document.querySelectorAll('section').forEach(el => {
      el.scrollIntoView = vi.fn();
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('init', () => {
    it('initializes without errors', () => {
      expect(() => smoothScroll.init()).not.toThrow();
    });

    it('adds click event listeners to anchor links', () => {
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      const addEventListenerSpies = Array.from(anchorLinks).map(link =>
        vi.spyOn(link, 'addEventListener')
      );

      smoothScroll.init();

      addEventListenerSpies.forEach(spy => {
        expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });

    it('only selects anchor links starting with #', () => {
      const externalLink = document.querySelector('a[href="other-page.html"]');
      const addEventListenerSpy = vi.spyOn(externalLink, 'addEventListener');

      smoothScroll.init();

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('click handler behavior', () => {
    beforeEach(() => {
      smoothScroll.init();
    });

    it('prevents default action for valid anchor links', () => {
      const link = document.querySelector('a[href="#section1"]');
      const event = new dom.window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      link.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('scrolls target element into view', () => {
      const link = document.querySelector('a[href="#section1"]');
      const target = document.getElementById('section1');
      // scrollIntoView is already mocked in beforeEach

      link.click();

      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('updates URL with history.pushState', () => {
      const link = document.querySelector('a[href="#section1"]');

      link.click();

      expect(history.pushState).toHaveBeenCalledWith(null, null, '#section1');
    });

    it('does not prevent default for "#" only links', () => {
      const link = document.querySelector('a[href="#"]');
      const event = new dom.window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      link.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('does not scroll for "#" only links', () => {
      const link = document.querySelector('a[href="#"]');
      const sections = document.querySelectorAll('section');

      // Reset the mock calls
      sections.forEach(section => {
        section.scrollIntoView.mockClear();
      });

      link.click();

      sections.forEach(section => {
        expect(section.scrollIntoView).not.toHaveBeenCalled();
      });
    });

    it('does not scroll for non-existent targets', () => {
      const link = document.querySelector('a[href="#nonexistent"]');
      const event = new dom.window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      link.dispatchEvent(event);

      // Should not prevent default since target doesn't exist
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('does not call history.pushState for non-existent targets', () => {
      const link = document.querySelector('a[href="#nonexistent"]');

      // Reset the mock before this specific test
      history.pushState.mockClear();

      link.click();

      expect(history.pushState).not.toHaveBeenCalled();
    });
  });

  describe('history.pushState fallback', () => {
    it('works without history.pushState', () => {
      // Remove pushState support
      vi.stubGlobal('history', {
        pushState: undefined,
      });

      // Re-initialize with no pushState
      smoothScroll.init();

      const link = document.querySelector('a[href="#section1"]');
      const target = document.getElementById('section1');

      // Should not throw
      expect(() => link.click()).not.toThrow();
      expect(target.scrollIntoView).toHaveBeenCalled();
    });
  });

  describe('multiple anchor links', () => {
    it('handles multiple anchor links on the page', () => {
      smoothScroll.init();

      const link1 = document.querySelector('a[href="#section1"]');
      const link2 = document.querySelector('a[href="#section2"]');
      const target1 = document.getElementById('section1');
      const target2 = document.getElementById('section2');

      link1.click();
      expect(target1.scrollIntoView).toHaveBeenCalled();

      link2.click();
      expect(target2.scrollIntoView).toHaveBeenCalled();
    });
  });
});
