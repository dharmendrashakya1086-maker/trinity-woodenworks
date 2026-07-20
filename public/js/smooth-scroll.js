/* ================================================================
   SECTION-SNAP SMOOTH SCROLL — GSAP Powered
   Every scroll action snaps to the next/previous section.
   Falls back to smooth lerp scrolling on non-snap pages.
   ================================================================ */

(function() {
  'use strict';

  // Skip on touch devices — native momentum is better
  if ('ontouchstart' in window) return;
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const LERP = 0.1;
  const THRESHOLD = 2;
  const SNAP_COOLDOWN = 800;

  let targetScroll = 0;
  let currentScroll = 0;
  let enabled = true;
  let snapping = false;
  let lastSnapTime = 0;
  let sections = [];
  let isSnapPage = false;

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

  // ---- Detect sections for snap scrolling ----
  function detectSections() {
    sections = [];
    var els = document.querySelectorAll('section, .hero, .newsletter-section, .cta-section, footer');
    els.forEach(function(el) {
      // Skip tiny sections (badges, etc.)
      if (el.offsetHeight < window.innerHeight * 0.3) return;
      sections.push({
        el: el,
        top: el.offsetTop,
        height: el.offsetHeight
      });
    });
    // Sort by position
    sections.sort(function(a, b) { return a.top - b.top; });
  }

  function getCurrentSectionIndex() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (scrollY >= s.top - vh * 0.5 && scrollY < s.top + s.height - vh * 0.5) {
        return i;
      }
    }
    // If between sections, find closest
    var closest = 0;
    var minDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var dist = Math.abs(scrollY - sections[i].top);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    return closest;
  }

  function snapToSection(index) {
    if (index < 0 || index >= sections.length) return;
    targetScroll = clamp(sections[index].top, 0, getMaxScroll());
    snapping = true;
    lastSnapTime = Date.now();
  }

  // ---- Wheel Event Interceptor ----
  function onWheel(e) {
    if (!enabled) return;
    if (e.ctrlKey || e.metaKey) return;

    var target = e.target;
    if (target.closest('input') || target.closest('textarea') || target.closest('select')) return;

    e.preventDefault();

    if (isSnapPage) {
      var now = Date.now();
      if (now - lastSnapTime < SNAP_COOLDOWN) return;

      var delta = e.deltaY || e.detail;
      var direction = delta > 0 ? 1 : -1;
      var currentIdx = getCurrentSectionIndex();
      var nextIdx = clamp(currentIdx + direction, 0, sections.length - 1);

      if (nextIdx !== currentIdx) {
        snapToSection(nextIdx);
      } else if (direction === 1 && currentIdx === sections.length - 1) {
        // At last section, allow normal scroll to footer
        targetScroll = clamp(targetScroll + delta * 0.5, 0, getMaxScroll());
      } else if (direction === -1 && currentIdx === 0) {
        // At first section, allow normal scroll to top
        targetScroll = clamp(targetScroll + delta * 0.5, 0, getMaxScroll());
      }
    } else {
      // Free scroll mode for non-snap pages
      var delta = e.deltaY || e.detail;
      var scrollAmount = delta * 1.2;
      targetScroll = clamp(targetScroll + scrollAmount, 0, getMaxScroll());
    }
  }

  // ---- Keyboard Support ----
  function onKeyDown(e) {
    if (!enabled) return;

    var scrollKeys = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, Home: -2, End: 2 };
    if (!(e.key in scrollKeys)) return;

    e.preventDefault();

    if (isSnapPage) {
      var now = Date.now();
      if (now - lastSnapTime < SNAP_COOLDOWN) return;

      var direction = scrollKeys[e.key];
      if (e.key === 'Home') { snapToSection(0); return; }
      if (e.key === 'End') { snapToSection(sections.length - 1); return; }

      var currentIdx = getCurrentSectionIndex();
      var nextIdx = clamp(currentIdx + direction, 0, sections.length - 1);
      if (nextIdx !== currentIdx) snapToSection(nextIdx);
    } else {
      var maxScroll = getMaxScroll();
      if (e.key === 'Home') { targetScroll = 0; }
      else if (e.key === 'End') { targetScroll = maxScroll; }
      else if (e.key === 'PageDown' || e.key === 'PageUp') {
        targetScroll = clamp(targetScroll + window.innerHeight * scrollKeys[e.key], 0, maxScroll);
      } else {
        targetScroll = clamp(targetScroll + scrollKeys[e.key] * 80, 0, maxScroll);
      }
    }
  }

  // ---- Touch Support for Snap ----
  var touchStartY = 0;
  var touchStartTime = 0;

  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }

  function onTouchEnd(e) {
    if (!isSnapPage || !enabled) return;

    var now = Date.now();
    if (now - lastSnapTime < SNAP_COOLDOWN) return;

    var touchEndY = e.changedTouches[0].clientY;
    var diff = touchStartY - touchEndY;
    var elapsed = now - touchStartTime;

    // Quick swipe or significant movement
    if (Math.abs(diff) > 50 || (Math.abs(diff) > 20 && elapsed < 300)) {
      var direction = diff > 0 ? 1 : -1;
      var currentIdx = getCurrentSectionIndex();
      var nextIdx = clamp(currentIdx + direction, 0, sections.length - 1);
      if (nextIdx !== currentIdx) snapToSection(nextIdx);
    }
  }

  // ---- Sync on native scroll ----
  function onScroll() {
    if (!snapping) {
      var diff = Math.abs(window.scrollY - currentScroll);
      if (diff > 50) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    }
  }

  // ---- Animation Loop ----
  function tick() {
    if (!enabled) return;

    var maxScroll = getMaxScroll();
    targetScroll = clamp(targetScroll, 0, maxScroll);

    // Lerp toward target
    currentScroll = lerp(currentScroll, targetScroll, LERP);

    // Snap when close enough
    if (Math.abs(currentScroll - targetScroll) < THRESHOLD) {
      currentScroll = targetScroll;
      snapping = false;
    }

    // Sync native scroll
    var scrollDiff = Math.abs(window.scrollY - currentScroll);
    if (scrollDiff > 0.5) {
      setScroll(currentScroll);
    }
  }

  // ---- Resize handler ----
  function onResize() {
    if (isSnapPage) detectSections();
    targetScroll = clamp(targetScroll, 0, getMaxScroll());
  }

  // ---- Public API ----
  window.smoothScroll = {
    scrollTo: function(target, offset) {
      offset = offset || 0;
      if (typeof target === 'number') {
        targetScroll = clamp(target + offset, 0, getMaxScroll());
      } else if (target && target.nodeType) {
        var rect = target.getBoundingClientRect();
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

    // Detect if this is a snap page (home page with hero)
    isSnapPage = !!document.querySelector('.hero-3d');

    if (isSnapPage) {
      detectSections();
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    console.log('%c🍎 Smooth scroll active' + (isSnapPage ? ' (snap mode)' : ''), 'color: #C9A96E; font-size: 12px;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
