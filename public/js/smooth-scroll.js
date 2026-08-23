/* ================================================================
   SCROLL ENGINE — Native smooth scroll + GSAP ScrollTrigger
   No longer intercepts wheel events — lets browser handle scrolling.
   ================================================================ */

(function() {
  'use strict';

  // ---- Card Reveal (IntersectionObserver) ----
  function initCardReveal() {
    var cards = document.querySelectorAll('.category-tile, .product-card, .products-grid > div');
    if (!cards.length) return;

    cards.forEach(function(card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'opacity 0.6s ease ' + (i % 4) * 0.1 + 's, transform 0.6s ease ' + (i % 4) * 0.1 + 's';
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    cards.forEach(function(card) { observer.observe(card); });
  }

  function init() {
    var isGalleryPage = !!(document.querySelector('.shop-section') || document.querySelector('.categories-grid'));
    if (isGalleryPage) initCardReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
