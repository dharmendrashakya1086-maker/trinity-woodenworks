/* ================================================================
   APPLE-STYLE SMOOTH SCROLL — GSAP Powered
   Lerp-based momentum scrolling with inertia
   ================================================================ */

(function() {
  'use strict';

  // Skip on touch devices — native momentum is better
  if ('ontouchstart' in window) return;
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Skip home page — parallax engine handles scroll there
  if (document.querySelector('.hero-3d')) return;

  const LERP = 0.12;
  const SCROLL_SPEED = 1.2;
  const INERTIA_DECAY = 0.95;
  const THRESHOLD = 0.5;

  let targetScroll = 0;
  let currentScroll = 0;
  let velocity = 0;
  let ticking = false;
  let enabled = true;

  const body = document.body;
  const html = document.documentElement;

  function getMaxScroll() {
    return Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    ) - window.innerHeight;
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function setScroll(val) {
    window.scrollTo(0, val);
  }

  // ---- Wheel Event Interceptor ----
  function onWheel(e) {
    if (!enabled) return;

    // Ignore scroll-triggered anchors
    if (e.ctrlKey || e.metaKey) return;

    const delta = e.deltaY || e.detail;
    const direction = delta > 0 ? 1 : -1;
    const magnitude = Math.abs(delta);

    // Smooth delta normalization
    const scrollAmount = (magnitude > 50 ? magnitude * 0.3 : magnitude) * SCROLL_SPEED * direction;

    targetScroll = clamp(targetScroll + scrollAmount, 0, getMaxScroll());
    velocity = scrollAmount * 0.3;

    // Prevent default only for non-anchor links
    const target = e.target;
    if (!target.closest('a[href^="#"]') && !target.closest('input') && !target.closest('textarea') && !target.closest('select')) {
      e.preventDefault();
    }
  }

  // ---- Animation Loop (GSAP Ticker) ----
  function tick() {
    if (!enabled) return;

    const maxScroll = getMaxScroll();
    targetScroll = clamp(targetScroll, 0, maxScroll);

    // Lerp toward target
    currentScroll = lerp(currentScroll, targetScroll, LERP);

    // Apply momentum decay
    if (Math.abs(velocity) > 0.1) {
      targetScroll += velocity;
      velocity *= INERTIA_DECAY;
    }

    // Snap when close enough
    if (Math.abs(currentScroll - targetScroll) < THRESHOLD) {
      currentScroll = targetScroll;
    }

    // Sync native scroll for ScrollTrigger
    const scrollDiff = Math.abs(window.scrollY - currentScroll);
    if (scrollDiff > 0.5) {
      setScroll(currentScroll);
    }

    ticking = false;
  }

  // ---- Keyboard Support ----
  function onKeyDown(e) {
    if (!enabled) return;

    const scrollKeys = { ArrowDown: 60, ArrowUp: -60, PageDown: 0.85, PageUp: -0.85, Home: -1, End: 1 };
    if (!(e.key in scrollKeys)) return;

    e.preventDefault();
    const maxScroll = getMaxScroll();

    if (e.key === 'Home') { targetScroll = 0; }
    else if (e.key === 'End') { targetScroll = maxScroll; }
    else if (e.key === 'PageDown' || e.key === 'PageUp') {
      targetScroll = clamp(targetScroll + window.innerHeight * scrollKeys[e.key], 0, maxScroll);
    } else {
      targetScroll = clamp(targetScroll + scrollKeys[e.key], 0, maxScroll);
    }
  }

  // ---- Sync on native scroll (scrollbar drag, etc.) ----
  function onScroll() {
    if (!ticking) {
      // If user scrolled via scrollbar or keyboard, sync target
      const diff = Math.abs(window.scrollY - currentScroll);
      if (diff > 50) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    }
  }

  // ---- Resize handler ----
  function onResize() {
    targetScroll = clamp(targetScroll, 0, getMaxScroll());
  }

  // ---- Public API for GSAP ScrollTrigger compatibility ----
  window.smoothScroll = {
    scrollTo: function(target, offset) {
      offset = offset || 0;
      if (typeof target === 'number') {
        targetScroll = clamp(target + offset, 0, getMaxScroll());
      } else if (target && target.nodeType) {
        const rect = target.getBoundingClientRect();
        targetScroll = clamp(rect.top + window.scrollY - 80 + offset, 0, getMaxScroll());
      }
    },
    getPosition: function() { return currentScroll; },
    enable: function() { enabled = true; },
    disable: function() { enabled = false; }
  };

  // ---- Init ----
  function init() {
    currentScroll = window.scrollY || 0;
    targetScroll = currentScroll;

    // Use capture to intercept before ScrollTrigger
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Start GSAP ticker loop
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    console.log('%c🍎 Smooth scroll active', 'color: #C9A96E; font-size: 12px;');
  }

  // Wait for DOM + GSAP
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
