/* ================================================================
   CINEMATIC SCROLL STORYTELLING — GSAP ScrollTrigger
   Hero entry, scroll progress, parallax, reveal, stagger
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---- Hero Cinematic Entry ----
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const heroTl = gsap.timeline({ delay: 0.8 });

    heroTl
      .from('.hero-badge', { opacity: 0, y: 30, scale: 0.9, duration: 0.8, ease: 'power3.out' })
      .from('.hero h1', { opacity: 0, y: 60, duration: 1, ease: 'power4.out' }, '-=0.4')
      .from('.hero-subtitle', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .from('.hero-desc', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .from('.hero-actions .btn', { opacity: 0, y: 20, scale: 0.95, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }, '-=0.3')
      .from('.hero-founders', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  }

  // ---- Hero Parallax on Scroll ----
  const hero = document.querySelector('.hero');
  if (hero) {
    gsap.to('.hero-content', {
      y: -80,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });
  }

  // ---- Scroll Progress Indicator ----
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  gsap.to(progressBar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3
    }
  });

  // ---- Section Title Reveal ----
  document.querySelectorAll('.section-title, .section-subtitle').forEach(function(el) {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Trust Badges Stagger ----
  var trustBadges = document.querySelectorAll('.trust-badge');
  if (trustBadges.length) {
    gsap.fromTo(trustBadges,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: trustBadges[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Stats Counter Reveal ----
  var statItems = document.querySelectorAll('.stat-item');
  if (statItems.length) {
    gsap.fromTo(statItems,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: {
          trigger: statItems[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Category Tiles Stagger ----
  var categoryTiles = document.querySelectorAll('.category-tile');
  if (categoryTiles.length) {
    gsap.fromTo(categoryTiles,
      { opacity: 0, y: 50, scale: 0.92 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: categoryTiles[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Product Cards Stagger ----
  var productCards = document.querySelectorAll('.product-card');
  if (productCards.length) {
    gsap.fromTo(productCards,
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: {
          trigger: productCards[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Feature Cards Reveal ----
  var featureCards = document.querySelectorAll('.feature-card, .value-card');
  if (featureCards.length) {
    gsap.fromTo(featureCards,
      { opacity: 0, y: 40, rotateX: 10 },
      {
        opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: featureCards[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Testimonial Cards Stagger ----
  var testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialCards.length) {
    gsap.fromTo(testimonialCards,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: {
          trigger: testimonialCards[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- About Preview Reveal ----
  var aboutPreview = document.querySelector('.about-preview .content, .about-content');
  if (aboutPreview) {
    gsap.fromTo(aboutPreview,
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutPreview,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Newsletter Reveal ----
  var newsletter = document.querySelector('.newsletter-section');
  if (newsletter) {
    gsap.fromTo(newsletter,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: newsletter,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- CTA Section Reveal ----
  var cta = document.querySelector('.cta-section');
  if (cta) {
    gsap.fromTo(cta,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Section Tag Decorative Lines ----
  document.querySelectorAll('.section-tag').forEach(function(tag) {
    gsap.fromTo(tag,
      { opacity: 0, scaleX: 0 },
      {
        opacity: 1, scaleX: 1, duration: 0.6, ease: 'power3.out',
        scrollTrigger: {
          trigger: tag,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Founder Card Reveal ----
  var founderCards = document.querySelectorAll('.founder-card');
  if (founderCards.length) {
    gsap.fromTo(founderCards,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: {
          trigger: founderCards[0].parentElement,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ================================================================
  // BACKGROUND PARALLAX — Layers move at different speeds on scroll
  // ================================================================

  // ---- Aurora (deepest layer, slowest) ----
  var aurora = document.querySelector('.aurora-bg');
  if (aurora) {
    gsap.to(aurora, {
      y: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });
  }

  // ---- Stars (mid layer) ----
  var starfield = document.querySelector('.starfield');
  if (starfield) {
    gsap.to(starfield, {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8
      }
    });
  }

  // ---- Floating Shapes (wrap in parallax containers in JS) ----
  var shapesContainer = document.querySelector('.floating-shapes');
  if (shapesContainer) {
    gsap.to(shapesContainer, {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });
  }

  // ---- Glass Orbs (move container, not individual orbs) ----
  var orbsContainer = document.querySelector('.glass-orbs');
  if (orbsContainer) {
    gsap.to(orbsContainer, {
      y: 70,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8
      }
    });
  }

  // ---- Grid Overlay ----
  var gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
    gsap.to(gridOverlay, {
      y: 60,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5
      }
    });
  }

  console.log('%c🎬 Cinematic loaded — scroll effects active', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
