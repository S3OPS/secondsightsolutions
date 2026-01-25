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
    errorDiv.style.color = '#ff0033';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '-10px';
    errorDiv.style.marginBottom = '10px';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    field.style.borderColor = '#ff0033';
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  function clearError(field) {
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
      errorMsg.remove();
    }
    field.style.borderColor = '';
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
    
    galleryImages.forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function() {
        lightboxImg.src = this.src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
    
    lightbox.addEventListener('click', function() {
      this.style.display = 'none';
      document.body.style.overflow = '';
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
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
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      // Show CTA when scrolling down past 300px
      if (currentScroll > 300 && currentScroll > lastScroll) {
        mobileCTA.style.opacity = '1';
        mobileCTA.style.transform = 'translateX(-50%) translateY(0)';
      } else if (currentScroll < lastScroll) {
        // Hide when scrolling up
        mobileCTA.style.opacity = '0';
        mobileCTA.style.transform = 'translateX(-50%) translateY(100px)';
      }
      
      lastScroll = currentScroll;
    });
    
    // Add transition styles
    mobileCTA.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
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
