/**
 * Lightbox Module
 * Handles image lightbox functionality with keyboard navigation
 */

export const lightbox = {
  lightboxElement: null,
  lightboxImg: null,
  previouslyFocusedElement: null,

  /**
   * Initialize lightbox functionality
   */
  init() {
    this.lightboxElement = document.getElementById('lightbox');
    if (!this.lightboxElement) return;
    
    this.lightboxImg = this.lightboxElement.querySelector('img');
    this._setupLightbox();
    this._setupGalleryImages();
  },

  /**
   * Setup lightbox element and event listeners
   * @private
   */
  _setupLightbox() {
    this.lightboxElement.setAttribute('tabindex', '-1');
    this.lightboxElement.setAttribute('role', 'dialog');
    this.lightboxElement.setAttribute('aria-modal', 'true');
    this.lightboxElement.setAttribute('aria-label', 'Image lightbox');
    this.lightboxElement.setAttribute('aria-hidden', 'true');
    
    // Click outside image to close
    this.lightboxElement.addEventListener('click', (e) => {
      if (e.target === this.lightboxElement) {
        this.close();
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightboxElement.style.display === 'flex') {
        this.close();
      }
    });
  },

  /**
   * Setup gallery images for lightbox
   * @private
   */
  _setupGalleryImages() {
    const galleryImages = document.querySelectorAll('.gallery img, [data-lightbox]');
    
    galleryImages.forEach(img => {
      img.style.cursor = 'pointer';
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      
      const currentAlt = img.alt || '';
      const enhancedAlt = currentAlt ? `${currentAlt} - Click to view larger` : 'View image in lightbox';
      img.setAttribute('aria-label', enhancedAlt);
      
      img.addEventListener('click', () => this.open(img), { passive: true });
      
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.open(img);
        }
      });
    });
  },

  /**
   * Open lightbox with specified image
   * @param {HTMLImageElement} img - Image to display in lightbox
   */
  open(img) {
    this.previouslyFocusedElement = document.activeElement;
    this.lightboxImg.src = img.src;
    this.lightboxImg.alt = img.alt || 'Image in lightbox view';
    this.lightboxElement.style.display = 'flex';
    this.lightboxElement.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    this.lightboxElement.focus();
  },

  /**
   * Close the lightbox
   */
  close() {
    this.lightboxElement.style.display = 'none';
    this.lightboxElement.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }
};
