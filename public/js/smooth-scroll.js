/* ================================================================
   UNIVERSAL SNAP SCROLL — GSAP Powered
   Snaps to sections on all pages.
   Gallery pages (shop, categories) use free scroll + card reveals.
   ================================================================ */

(function() {
  'use strict';

  if ('ontouchstart' in window) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const LERP = 0.08;
  const SNAP_COOLDOWN = 900;

  let targetScroll = 0;
  let currentScroll = 0;
  let enabled = true;
  let lastSnapTime = 0;
  let snapPoints = [];
  let isSnapPage = true;
  let isGalleryPage = false;

  function getMaxScroll() {
    return Math.max(
      document.body.scrollHeight, document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight, document.documentElement.offsetHeight
    ) - window.innerHeight;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  // ---- Build snap points from sections ----
  function buildSnapPoints() {
    snapPoints = [0];
    var els = document.querySelectorAll('section');
    for (var i = 0; i < els.length; i++) {
      var top = els[i].offsetTop;
      if (snapPoints.length > 0 && top - snapPoints[snapPoints.length - 1] < 100) continue;
      snapPoints.push(top);
    }
    var max = getMaxScroll();
    if (max - snapPoints[snapPoints.length - 1] > 100) snapPoints.push(max);
  }

  function getNextSnapIndex(scrollY, direction) {
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < snapPoints.length; i++) {
      var dist = Math.abs(scrollY - snapPoints[i]);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return clamp(best + direction, 0, snapPoints.length - 1);
  }

  // ---- Card Reveal Animation (for gallery pages) ----
  function initCardReveal() {
    var cards = document.querySelectorAll('.category-tile, .product-card');
    if (!cards.length) return;

    cards.forEach(function(card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    cards.forEach(function(card) { observer.observe(card); });
  }

  // ---- Wheel ----
  function onWheel(e) {
    if (!enabled) return;
    if (e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t.closest('input') || t.closest('textarea') || t.closest('select')) return;

    e.preventDefault();

    if (isGalleryPage) {
      targetScroll = clamp(targetScroll + e.deltaY * 1.2, 0, getMaxScroll());
    } else if (isSnapPage) {
      var now = Date.now();
      if (now - lastSnapTime < SNAP_COOLDOWN) return;
      var delta = e.deltaY;
      if (Math.abs(delta) < 10) return;
      var dir = delta > 0 ? 1 : -1;
      var nextIdx = getNextSnapIndex(window.scrollY, dir);
      if (Math.abs(window.scrollY - snapPoints[nextIdx]) > 5) {
        targetScroll = snapPoints[nextIdx];
        lastSnapTime = now;
      }
    }
  }

  // ---- Keyboard ----
  function onKeyDown(e) {
    if (!enabled) return;
    var keys = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, Home: -999, End: 999 };
    if (!(e.key in keys)) return;
    e.preventDefault();

    if (isGalleryPage) {
      if (e.key === 'Home') targetScroll = 0;
      else if (e.key === 'End') targetScroll = getMaxScroll();
      else if (e.key === 'PageDown' || e.key === 'PageUp')
        targetScroll = clamp(targetScroll + window.innerHeight * keys[e.key], 0, getMaxScroll());
      else
        targetScroll = clamp(targetScroll + keys[e.key] * 80, 0, getMaxScroll());
    } else if (isSnapPage) {
      var now = Date.now();
      if (now - lastSnapTime < SNAP_COOLDOWN) return;
      if (e.key === 'Home') { targetScroll = snapPoints[0]; lastSnapTime = now; return; }
      if (e.key === 'End') { targetScroll = snapPoints[snapPoints.length - 1]; lastSnapTime = now; return; }
      var nextIdx = getNextSnapIndex(window.scrollY, keys[e.key]);
      if (Math.abs(window.scrollY - snapPoints[nextIdx]) > 5) {
        targetScroll = snapPoints[nextIdx];
        lastSnapTime = now;
      }
    }
  }

  // ---- Touch ----
  var touchStartY = 0;
  function onTouchStart(e) { touchStartY = e.touches[0].clientY; }
  function onTouchEnd(e) {
    if (!enabled) return;
    if (!isSnapPage || isGalleryPage) return;
    var now = Date.now();
    if (now - lastSnapTime < SNAP_COOLDOWN) return;
    var diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 30) return;
    var dir = diff > 0 ? 1 : -1;
    targetScroll = snapPoints[getNextSnapIndex(window.scrollY, dir)];
    lastSnapTime = now;
  }

  // ---- Scroll sync ----
  function onScroll() {
    var diff = Math.abs(window.scrollY - currentScroll);
    if (diff > 100) {
      currentScroll = window.scrollY;
      targetScroll = window.scrollY;
    }
  }

  // ---- Animation loop ----
  function tick() {
    if (!enabled) return;
    targetScroll = clamp(targetScroll, 0, getMaxScroll());
    currentScroll = lerp(currentScroll, targetScroll, LERP);
    if (Math.abs(currentScroll - targetScroll) < 1) currentScroll = targetScroll;
    if (Math.abs(window.scrollY - currentScroll) > 0.5) window.scrollTo(0, currentScroll);
  }

  function onResize() {
    if (isSnapPage) buildSnapPoints();
    targetScroll = clamp(targetScroll, 0, getMaxScroll());
  }

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

  function init() {
    currentScroll = window.scrollY || 0;
    targetScroll = currentScroll;

    isGalleryPage = !!(document.querySelector('.shop-section') || document.querySelector('.categories-grid'));
    isSnapPage = !isGalleryPage;

    if (isSnapPage) buildSnapPoints();
    if (isGalleryPage) initCardReveal();

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    console.log('%c' + (isGalleryPage ? '📦 Gallery (card reveal)' : isSnapPage ? '🧲 Snap scroll (' + snapPoints.length + ')' : '🍎 Smooth scroll'), 'color: #C9A96E; font-size: 12px;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
