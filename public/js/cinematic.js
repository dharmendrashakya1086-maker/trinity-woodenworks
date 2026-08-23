/* ================================================================
   CINEMATIC SCROLL STORYTELLING — GSAP ScrollTrigger
   Instant reveal on scroll — no waiting, no stagger delays
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
    const heroTl = gsap.timeline({ delay: 0.5 });

    heroTl
      .from('.hero-badge', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' })
      .from('.hero h1', { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out' }, '-=0.3')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from('.hero-desc', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from('.hero-actions .btn', { opacity: 0, y: 15, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.2')
      .from('.hero-founders', { opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
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
  var progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
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
  }

  // ---- Section Title Reveal (scroll-linked) ----
  document.querySelectorAll('.section-title, .section-subtitle').forEach(function(el) {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Trust Badges (scroll-linked, instant) ----
  var trustBadges = document.querySelectorAll('.trust-badge');
  if (trustBadges.length) {
    gsap.fromTo(trustBadges,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: trustBadges[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Stats (scroll-linked, instant) ----
  var statItems = document.querySelectorAll('.stat-item');
  if (statItems.length) {
    gsap.fromTo(statItems,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: statItems[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Category Tiles (scroll-linked, instant) ----
  var categoryTiles = document.querySelectorAll('.category-tile');
  if (categoryTiles.length) {
    gsap.fromTo(categoryTiles,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: categoryTiles[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Product Cards (scroll-linked, instant) ----
  var productCards = document.querySelectorAll('.product-card');
  if (productCards.length) {
    gsap.fromTo(productCards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out',
        scrollTrigger: {
          trigger: productCards[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Feature Cards (scroll-linked, instant) ----
  var featureCards = document.querySelectorAll('.feature-card, .value-card');
  if (featureCards.length) {
    gsap.fromTo(featureCards,
      { opacity: 0, y: 25 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: featureCards[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Testimonial Cards (scroll-linked, instant) ----
  var testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialCards.length) {
    gsap.fromTo(testimonialCards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: testimonialCards[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- About Preview (scroll-linked, instant) ----
  var aboutPreview = document.querySelector('.about-preview .content, .about-content');
  if (aboutPreview) {
    gsap.fromTo(aboutPreview,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: aboutPreview,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Newsletter (scroll-linked, instant) ----
  var newsletter = document.querySelector('.newsletter-section');
  if (newsletter) {
    gsap.fromTo(newsletter,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: newsletter,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- CTA Section (scroll-linked, instant) ----
  var cta = document.querySelector('.cta-section');
  if (cta) {
    gsap.fromTo(cta,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ---- Section Tags (scroll-linked, instant) ----
  document.querySelectorAll('.section-tag').forEach(function(tag) {
    gsap.fromTo(tag,
      { opacity: 0, scaleX: 0.8 },
      {
        opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out',
        scrollTrigger: {
          trigger: tag,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // ---- Founder Cards (scroll-linked, instant) ----
  var founderCards = document.querySelectorAll('.founder-card');
  if (founderCards.length) {
    gsap.fromTo(founderCards,
      { opacity: 0, y: 25 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: {
          trigger: founderCards[0].parentElement,
          start: 'top 95%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ================================================================
  // BACKGROUND PARALLAX
  // ================================================================

  var aurora = document.querySelector('.aurora-bg');
  if (aurora) {
    gsap.to(aurora, { y: 120, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  }

  var starfield = document.querySelector('.starfield');
  if (starfield) {
    gsap.to(starfield, { y: 80, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
  }

  var shapesContainer = document.querySelector('.floating-shapes');
  if (shapesContainer) {
    gsap.to(shapesContainer, { y: 100, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 } });
  }

  var orbsContainer = document.querySelector('.glass-orbs');
  if (orbsContainer) {
    gsap.to(orbsContainer, { y: 70, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
  }

  var gridOverlay = document.querySelector('.grid-overlay');
  if (gridOverlay) {
    gsap.to(gridOverlay, { y: 60, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
  }

  console.log('%c🎬 Cinematic loaded — instant scroll reveals active', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
