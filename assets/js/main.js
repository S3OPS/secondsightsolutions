/**
 * Second Sight Solutions - Main JavaScript
 * Handles form validation, lazy loading, lightbox, and analytics
 */

(function() {
  'use strict';

  // ==========================================
  // LAZY LOADING IMAGES
  // ==========================================
  function initLazyLoading() {
    // Use native lazy loading with fallback
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      const lazyImages = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
      } else {
        // Ultra-fallback: just load all images
        lazyImages.forEach(img => {
          img.src = img.dataset.src;
          img.classList.add('loaded');
        });
      }
    }
  }

  // ==========================================
  // FORM VALIDATION
  // ==========================================
  function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear previous error messages
        form.querySelectorAll('.error-message').forEach(msg => msg.remove());
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
          } else if (field.type === 'email' && !isValidEmail(field.value)) {
            isValid = false;
            showError(field, 'Please enter a valid email address');
          } else if (field.type === 'tel' && !isValidPhone(field.value)) {
            isValid = false;
            showError(field, 'Please enter a valid phone number');
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          
          // Focus first error field
          const firstError = form.querySelector('.error-message');
          if (firstError && firstError.previousElementSibling) {
            firstError.previousElementSibling.focus();
          }
        }
      });
      
      // Real-time validation
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', function() {
          if (this.hasAttribute('required') && !this.value.trim()) {
            showError(this, 'This field is required');
          } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
            showError(this, 'Please enter a valid email address');
          } else {
            clearError(this);
          }
        });
        
        input.addEventListener('input', function() {
          if (this.nextElementSibling && this.nextElementSibling.classList.contains('error-message')) {
            clearError(this);
          }
        });
      });
    });
  }

  function showError(field, message) {
    clearError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    
    field.classList.add('field-error');
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  function clearError(field) {
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
      errorMsg.remove();
    }
    field.classList.remove('field-error');
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function isValidPhone(phone) {
    const re = /^[\d\s\-\(\)\+]+$/;
    return phone.length >= 10 && re.test(phone);
  }

  // ==========================================
  // LIGHTBOX FOR IMAGES
  // ==========================================
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    const lightboxImg = lightbox.querySelector('img');
    const galleryImages = document.querySelectorAll('.gallery img, [data-lightbox]');
    let previouslyFocusedElement = null;
    
    galleryImages.forEach(img => {
      img.style.cursor = 'pointer';
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.setAttribute('aria-label', img.alt || 'View image in lightbox');
      
      // Click handler
      img.addEventListener('click', function() {
        openLightbox(this);
      });
      
      // Keyboard handler
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(this);
        }
      });
    });
    
    function openLightbox(img) {
      previouslyFocusedElement = document.activeElement;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Enlarged image';
      lightbox.style.display = 'flex';
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // Focus the lightbox for keyboard accessibility
      lightbox.focus();
    }
    
    function closeLightbox() {
      lightbox.style.display = 'none';
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Return focus to the element that opened the lightbox
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    }
    
    // Click outside image to close
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeLightbox();
      }
    });
    
    // Make lightbox focusable
    lightbox.setAttribute('tabindex', '-1');
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image lightbox');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  // ==========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        // Skip if it's just "#"
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without triggering a jump
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }

  // ==========================================
  // MOBILE CTA VISIBILITY
  // ==========================================
  function initMobileCTA() {
    const mobileCTA = document.querySelector('.mobile-cta');
    if (!mobileCTA) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    // Throttled scroll handler for better performance
    function updateMobileCTA() {
      const currentScroll = window.scrollY || window.pageYOffset;
      
      // Show CTA when scrolling down past 300px
      if (currentScroll > 300 && currentScroll > lastScroll) {
        mobileCTA.classList.add('visible');
        mobileCTA.classList.remove('hidden');
      } else if (currentScroll < lastScroll) {
        // Hide when scrolling up
        mobileCTA.classList.add('hidden');
        mobileCTA.classList.remove('visible');
      }
      
      lastScroll = currentScroll;
      ticking = false;
    }
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateMobileCTA);
        ticking = true;
      }
    });
  }

  // ==========================================
  // ANALYTICS (Google Analytics / Plausible)
  // ==========================================
  function initAnalytics() {
    // Track outbound links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function() {
          if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
              event_category: 'outbound',
              event_label: this.href
            });
          } else if (typeof plausible !== 'undefined') {
            plausible('Outbound Link', { props: { url: this.href } });
          }
        });
      }
    });
    
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function() {
        const formName = this.name || this.id || 'unnamed_form';
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: formName
          });
        } else if (typeof plausible !== 'undefined') {
          plausible('Form Submit', { props: { form: formName } });
        }
      });
    });
  }

  // ==========================================
  // WEBP SUPPORT CHECK
  // ==========================================
  function checkWebPSupport() {
    const webpTestImage = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();
    
    img.onload = img.onerror = function() {
      if (img.height === 1) {
        document.documentElement.classList.add('webp');
      } else {
        document.documentElement.classList.add('no-webp');
      }
    };
    
    img.src = webpTestImage;
  }

  // ==========================================
  // PERFORMANCE MONITORING
  // ==========================================
  function logPerformance() {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      window.addEventListener('load', function() {
        setTimeout(function() {
          const perfData = window.performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log('🚀 Performance Metrics:');
            console.log('  DOM Content Loaded:', Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart), 'ms');
            console.log('  Page Load:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
            console.log('  Total Time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
          }
        }, 0);
      });
    }
  }

  // ==========================================
  // INITIALIZE ALL ON DOM READY
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    checkWebPSupport();
    initLazyLoading();
    initFormValidation();
    initLightbox();
    initSmoothScroll();
    initMobileCTA();
    initAnalytics();
    
    // Only log performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      logPerformance();
    }
    
    console.log('✨ Second Sight Solutions - Site initialized');
  }

})();
