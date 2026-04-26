/**
 * CivicGuide — Main Application Entry Point
 * Initializes all modules and sets up global behavior.
 */

'use strict';

const CivicGuideApp = (() => {

  /**
   * Setup mobile menu toggle.
   */
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('mobile-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('open');
      nav.setAttribute('aria-hidden', String(isOpen));

      // Toggle tabindex on mobile links
      const links = nav.querySelectorAll('.mobile-nav-link');
      links.forEach((link) => {
        link.setAttribute('tabindex', isOpen ? '-1' : '0');
      });
    });

    // Close on link click
    nav.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        btn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'true');
        nav.querySelectorAll('.mobile-nav-link').forEach((l) => l.setAttribute('tabindex', '-1'));
      });
    });
  }

  /**
   * Smooth-scroll header offset for anchor links.
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /**
   * Active nav link highlighting on scroll.
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { threshold: 0.3 });

    sections.forEach((section) => observer.observe(section));
  }

  /**
   * Initialize everything on DOM ready.
   */
  function init() {
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();

    // Initialize feature modules
    TimelineModule.init();
    ChatModule.init();
    CivicModule.init();

    // Scroll animations
    CivicUtils.observeScrollAnimations('.animate-on-scroll');
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
