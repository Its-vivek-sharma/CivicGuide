/**
 * CivicGuide — Utility Functions
 * Shared helpers: sanitization, DOM utilities, debounce, scroll observer
 */

'use strict';

const CivicUtils = (() => {

  /**
   * Sanitize user input to prevent XSS attacks.
   * Escapes HTML special characters.
   * @param {string} str - Raw input string
   * @returns {string} Sanitized string
   */
  function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    return str.replace(/[&<>"'/]/g, (char) => map[char]);
  }

  /**
   * Validate that input is a non-empty string within max length.
   * @param {string} input
   * @param {number} maxLength
   * @returns {{ valid: boolean, message: string }}
   */
  function validateInput(input, maxLength = 500) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      return { valid: false, message: 'Input cannot be empty.' };
    }
    if (input.length > maxLength) {
      return { valid: false, message: `Input must be ${maxLength} characters or fewer.` };
    }
    return { valid: true, message: '' };
  }

  /**
   * Debounce a function call.
   * @param {Function} fn
   * @param {number} delay - milliseconds
   * @returns {Function}
   */
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  /**
   * Create an IntersectionObserver for scroll-triggered animations.
   * @param {string} selector - CSS selector for target elements
   * @param {string} activeClass - Class to add when visible
   * @param {object} options - Observer options
   */
  function observeScrollAnimations(selector, activeClass = 'visible', options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add(activeClass));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(activeClass);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, ...options });
    elements.forEach((el) => observer.observe(el));
  }

  /**
   * Safely query a DOM element by selector.
   * @param {string} selector
   * @param {Element} parent
   * @returns {Element|null}
   */
  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  /**
   * Safely query all DOM elements by selector.
   * @param {string} selector
   * @param {Element} parent
   * @returns {NodeList}
   */
  function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  // Public API
  return { sanitizeInput, validateInput, debounce, observeScrollAnimations, $, $$ };
})();

// Export for testing (Node.js / Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CivicUtils;
}
