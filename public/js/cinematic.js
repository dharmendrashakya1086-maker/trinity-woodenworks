/* ================================================================
   CINEMATIC SCROLL STORYTELLING — Minimal & Safe
   Only hero entrance + progress bar. No scroll-hiding animations.
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

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

  // ---- Scroll Progress Indicator ----
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

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

  console.log('%c🎬 Cinematic loaded', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
