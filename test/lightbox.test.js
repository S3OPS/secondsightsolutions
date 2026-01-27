/**
 * Unit tests for lightbox.js module
 * Tests lightbox initialization, opening, closing, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Import the lightbox module
const { lightbox } = await import('../assets/js/modules/lightbox.js');

describe('Lightbox Module', () => {
  let dom;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="lightbox" style="display: none;">
            <img id="lightbox-img" src="" alt="">
          </div>
          <div class="gallery">
            <img src="gallery1.jpg" alt="Gallery image 1">
            <img src="gallery2.jpg" alt="Gallery image 2">
          </div>
          <img data-lightbox src="lightbox-image.jpg" alt="Lightbox trigger">
        </body>
      </html>
    `, { url: 'http://localhost' });
    document = dom.window.document;

    // Replace global document
    vi.stubGlobal('document', document);
    vi.stubGlobal('window', dom.window);

    // Reset lightbox state
    lightbox.lightboxElement = null;
    lightbox.lightboxImg = null;
    lightbox.previouslyFocusedElement = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('init', () => {
    it('initializes without errors', () => {
      expect(() => lightbox.init()).not.toThrow();
    });

    it('sets lightbox element reference', () => {
      lightbox.init();
      expect(lightbox.lightboxElement).not.toBeNull();
    });

    it('sets lightbox image reference', () => {
      lightbox.init();
      expect(lightbox.lightboxImg).not.toBeNull();
    });

    it('returns early if no lightbox element found', () => {
      document.getElementById('lightbox').remove();
      expect(() => lightbox.init()).not.toThrow();
      expect(lightbox.lightboxImg).toBeNull();
    });
  });

  describe('_setupLightbox', () => {
    beforeEach(() => {
      lightbox.lightboxElement = document.getElementById('lightbox');
      lightbox.lightboxImg = lightbox.lightboxElement.querySelector('img');
    });

    it('sets accessibility attributes on lightbox', () => {
      lightbox._setupLightbox();

      expect(lightbox.lightboxElement.getAttribute('tabindex')).toBe('-1');
      expect(lightbox.lightboxElement.getAttribute('role')).toBe('dialog');
      expect(lightbox.lightboxElement.getAttribute('aria-modal')).toBe('true');
      expect(lightbox.lightboxElement.getAttribute('aria-label')).toBe('Image lightbox');
      expect(lightbox.lightboxElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('closes lightbox when clicking on overlay', () => {
      lightbox._setupLightbox();
      lightbox.lightboxElement.style.display = 'flex';
      
      const closeSpy = vi.spyOn(lightbox, 'close');
      
      // Create and dispatch click event on the lightbox (overlay)
      const clickEvent = new dom.window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, 'target', { value: lightbox.lightboxElement });
      lightbox.lightboxElement.dispatchEvent(clickEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('does not close lightbox when clicking on image', () => {
      lightbox._setupLightbox();
      lightbox.lightboxElement.style.display = 'flex';
      
      const closeSpy = vi.spyOn(lightbox, 'close');
      
      // Create and dispatch click event on the image
      const clickEvent = new dom.window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, 'target', { value: lightbox.lightboxImg });
      lightbox.lightboxElement.dispatchEvent(clickEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('closes lightbox on Escape key', () => {
      lightbox._setupLightbox();
      lightbox.lightboxElement.style.display = 'flex';
      
      const closeSpy = vi.spyOn(lightbox, 'close');
      
      const escapeEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      expect(closeSpy).toHaveBeenCalled();
    });

    it('does not close lightbox on Escape key if lightbox is hidden', () => {
      lightbox._setupLightbox();
      lightbox.lightboxElement.style.display = 'none';
      
      const closeSpy = vi.spyOn(lightbox, 'close');
      
      const escapeEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('_setupGalleryImages', () => {
    beforeEach(() => {
      lightbox.lightboxElement = document.getElementById('lightbox');
      lightbox.lightboxImg = lightbox.lightboxElement.querySelector('img');
    });

    it('sets up click handlers on gallery images', () => {
      const galleryImages = document.querySelectorAll('.gallery img');
      
      lightbox._setupGalleryImages();
      
      galleryImages.forEach(img => {
        expect(img.style.cursor).toBe('pointer');
      });
    });

    it('sets accessibility attributes on gallery images', () => {
      const galleryImages = document.querySelectorAll('.gallery img');
      
      lightbox._setupGalleryImages();
      
      galleryImages.forEach(img => {
        expect(img.getAttribute('role')).toBe('button');
        expect(img.getAttribute('tabindex')).toBe('0');
        expect(img.getAttribute('aria-label')).toContain('Click to view larger');
      });
    });

    it('sets up data-lightbox images', () => {
      const lightboxImg = document.querySelector('[data-lightbox]');
      
      lightbox._setupGalleryImages();
      
      expect(lightboxImg.style.cursor).toBe('pointer');
      expect(lightboxImg.getAttribute('role')).toBe('button');
    });

    it('opens lightbox when clicking gallery image', () => {
      lightbox._setupGalleryImages();
      
      const galleryImg = document.querySelector('.gallery img');
      
      galleryImg.click();
      
      // Verify that the lightbox is displayed (effect of open())
      expect(lightbox.lightboxElement.style.display).toBe('flex');
      expect(lightbox.lightboxImg.src).toContain('gallery1.jpg');
    });

    it('opens lightbox on Enter key', () => {
      lightbox._setupGalleryImages();
      
      const galleryImg = document.querySelector('.gallery img');
      
      const enterEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      galleryImg.dispatchEvent(enterEvent);
      
      // Verify that the lightbox is displayed (effect of open())
      expect(lightbox.lightboxElement.style.display).toBe('flex');
    });

    it('opens lightbox on Space key', () => {
      lightbox._setupGalleryImages();
      
      const galleryImg = document.querySelector('.gallery img');
      
      const spaceEvent = new dom.window.KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      galleryImg.dispatchEvent(spaceEvent);
      
      // Verify that the lightbox is displayed (effect of open())
      expect(lightbox.lightboxElement.style.display).toBe('flex');
    });

    it('uses default aria-label for images without alt text', () => {
      // Get the data-lightbox image and remove its alt attribute
      const imgWithDataLightbox = document.querySelector('[data-lightbox]');
      imgWithDataLightbox.removeAttribute('alt');
      
      lightbox._setupGalleryImages();
      
      expect(imgWithDataLightbox.getAttribute('aria-label')).toBe('View image in lightbox');
    });
  });

  describe('open', () => {
    beforeEach(() => {
      lightbox.lightboxElement = document.getElementById('lightbox');
      lightbox.lightboxImg = lightbox.lightboxElement.querySelector('img');
    });

    it('stores previously focused element', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      
      const sourceImg = document.querySelector('.gallery img');
      lightbox.open(sourceImg);
      
      expect(lightbox.previouslyFocusedElement).toBe(button);
    });

    it('sets lightbox image src from source image', () => {
      const sourceImg = document.querySelector('.gallery img');
      
      lightbox.open(sourceImg);
      
      expect(lightbox.lightboxImg.src).toContain('gallery1.jpg');
    });

    it('sets lightbox image alt from source image', () => {
      const sourceImg = document.querySelector('.gallery img');
      
      lightbox.open(sourceImg);
      
      expect(lightbox.lightboxImg.alt).toBe('Gallery image 1');
    });

    it('uses default alt text for images without alt', () => {
      const sourceImg = document.createElement('img');
      sourceImg.src = 'no-alt.jpg';
      document.body.appendChild(sourceImg);
      
      lightbox.open(sourceImg);
      
      expect(lightbox.lightboxImg.alt).toBe('Image in lightbox view');
    });

    it('displays lightbox', () => {
      const sourceImg = document.querySelector('.gallery img');
      
      lightbox.open(sourceImg);
      
      expect(lightbox.lightboxElement.style.display).toBe('flex');
    });

    it('sets aria-hidden to false', () => {
      const sourceImg = document.querySelector('.gallery img');
      
      lightbox.open(sourceImg);
      
      expect(lightbox.lightboxElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('disables body scroll', () => {
      const sourceImg = document.querySelector('.gallery img');
      
      lightbox.open(sourceImg);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('focuses on lightbox element', () => {
      const sourceImg = document.querySelector('.gallery img');
      const focusSpy = vi.spyOn(lightbox.lightboxElement, 'focus');
      
      lightbox.open(sourceImg);
      
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    beforeEach(() => {
      lightbox.lightboxElement = document.getElementById('lightbox');
      lightbox.lightboxImg = lightbox.lightboxElement.querySelector('img');
      lightbox.lightboxElement.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    it('hides lightbox', () => {
      lightbox.close();
      
      expect(lightbox.lightboxElement.style.display).toBe('none');
    });

    it('sets aria-hidden to true', () => {
      lightbox.close();
      
      expect(lightbox.lightboxElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('restores body scroll', () => {
      lightbox.close();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('restores focus to previously focused element', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      lightbox.previouslyFocusedElement = button;
      
      const focusSpy = vi.spyOn(button, 'focus');
      lightbox.close();
      
      expect(focusSpy).toHaveBeenCalled();
    });

    it('handles missing previous element gracefully', () => {
      lightbox.previouslyFocusedElement = null;
      
      expect(() => lightbox.close()).not.toThrow();
    });
  });
});
