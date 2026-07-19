/* ================================================================
   CINEMATIC SCROLL STORYTELLING — Apple-Style
   Trinity Woodenworks — Premium E-commerce Experience
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // Wait for GSAP to load
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ---- Smooth Scroll ----
  gsap.config({ nullTargetWarn: false });

  // ---- Page Load Cinematic Reveal ----
  const loader = document.getElementById('pageLoader');
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      delay: 0.5,
      ease: 'power2.inOut',
      onComplete: () => loader.classList.add('hidden')
    });
  }

  // ---- Hero Cinematic Entry ----
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const heroTl = gsap.timeline({ delay: 0.8 });

    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 30,
        scale: 0.9,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from('.hero h1', {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power4.out'
      }, '-=0.4')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.hero-desc', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.4')
      .from('.hero-actions .btn', {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.5)'
      }, '-=0.3')
      .from('.hero-founders', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2');
  }

  // ---- Hero Parallax on Scroll ----
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      pin: false
    },
    y: 80,
    opacity: 0.4,
    ease: 'none'
  });

  // ---- Trust Badges Stagger Reveal ----
  gsap.from('.trust-badge', {
    scrollTrigger: {
      trigger: '.trust-badge',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    scale: 0.9,
    duration: 0.8,
    stagger: 0.12,
    ease: 'back.out(1.3)'
  });

  // ---- Stats Counter Animation ----
  gsap.from('.stat-item', {
    scrollTrigger: {
      trigger: '.stats-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 40,
    scale: 0.95,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out'
  });

  // ---- Feature Cards Cinematic Reveal ----
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: '.features-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 60,
    rotateX: 15,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power4.out'
  });

  // ---- Section Headers Text Reveal ----
  document.querySelectorAll('.section-header').forEach(header => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    tl.from(header.querySelector('.section-tag'), {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from(header.querySelector('h2'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.3')
    .from(header.querySelector('p'), {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');
  });

  // ---- Category Tiles Cinematic ----
  gsap.from('.category-tile', {
    scrollTrigger: {
      trigger: '.categories-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 80,
    scale: 0.9,
    duration: 1,
    stagger: 0.2,
    ease: 'power4.out'
  });

  // ---- Product Cards Stagger ----
  gsap.from('.product-card', {
    scrollTrigger: {
      trigger: '.products-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 60,
    scale: 0.92,
    duration: 0.8,
    stagger: 0.12,
    ease: 'back.out(1.2)'
  });

  // ---- Testimonial Cards ----
  gsap.from('.testimonial-card', {
    scrollTrigger: {
      trigger: '.testimonial-card',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    rotateY: 15,
    duration: 0.9,
    stagger: 0.2,
    ease: 'power4.out'
  });

  // ---- About Section Parallax ----
  gsap.from('.about-content', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    x: -80,
    duration: 1,
    ease: 'power4.out'
  });

  gsap.from('.about-visual', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    x: 80,
    duration: 1,
    ease: 'power4.out'
  });

  // ---- About Cards Stagger ----
  gsap.from('.about-card', {
    scrollTrigger: {
      trigger: '.about-visual',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 30,
    scale: 0.95,
    duration: 0.7,
    stagger: 0.15,
    ease: 'back.out(1.2)'
  });

  // ---- Newsletter Reveal ----
  gsap.from('.newsletter-form', {
    scrollTrigger: {
      trigger: '.newsletter-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 40,
    scale: 0.98,
    duration: 0.8,
    ease: 'power3.out'
  });

  // ---- CTA Card Cinematic ----
  gsap.from('.cta-card', {
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 60,
    scale: 0.9,
    duration: 1,
    ease: 'power4.out'
  });

  // ---- Parallax Depth on All Sections ----
  document.querySelectorAll('.section').forEach(section => {
    gsap.to(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      '--parallax-y': '30px',
      ease: 'none'
    });
  });

  // ---- Image Reveal on Scroll ----
  document.querySelectorAll('.product-image img, .category-tile-image img').forEach(img => {
    gsap.from(img, {
      scrollTrigger: {
        trigger: img,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      scale: 1.1,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // ---- Magnetic Button Effect ----
  document.querySelectorAll('.btn-primary, .btn-glow').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });

  // ---- Smooth Anchor Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        gsap.to(window, {
          duration: 1.2,
          scrollTo: { y: target, offsetY: 80 },
          ease: 'power3.inOut'
        });
      }
    });
  });

  // ---- Hero Background Parallax ----
  gsap.to('.hero-bg', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    },
    scale: 1.1,
    opacity: 0.7,
    ease: 'none'
  });

  // ---- Floating Elements Parallax ----
  document.querySelectorAll('.floating, .float-3d').forEach(el => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      },
      y: -50,
      ease: 'none'
    });
  });

  // ---- Footer Reveal ----
  gsap.from('.footer-content > *', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 90%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out'
  });

  // ---- Smooth Scroll Progress Indicator ----
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--gold-light));
    z-index: 100000;
    transform-origin: left;
    transform: scaleX(0);
    width: 100%;
  `;
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

  // ---- Refresh ScrollTrigger on Load ----
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  console.log('%c🎬 Cinematic Scroll Storytelling loaded', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
