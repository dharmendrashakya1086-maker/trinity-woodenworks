/* ================================================================
   3D FUTURISTIC UI — Interactions & Effects
   Trinity Woodenworks
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- Aurora Background ----
  const aurora = document.createElement('div');
  aurora.className = 'aurora-bg';
  document.body.appendChild(aurora);

  // ---- Star Field (80 stars) ----
  const starfield = document.createElement('div');
  starfield.className = 'starfield';
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 5 + 's';
    starfield.appendChild(star);
  }
  document.body.appendChild(starfield);

  // ---- Grid Overlay ----
  const grid = document.createElement('div');
  grid.className = 'grid-overlay';
  document.body.appendChild(grid);

  // ---- Perspective Grid ----
  const perspGrid = document.createElement('div');
  perspGrid.className = 'perspective-grid';
  document.body.appendChild(perspGrid);

  // ---- Glass Orbs ----
  const orbsContainer = document.createElement('div');
  orbsContainer.className = 'glass-orbs';
  for (let i = 0; i < 5; i++) {
    const orb = document.createElement('div');
    orb.className = 'glass-orb';
    orbsContainer.appendChild(orb);
  }
  document.body.appendChild(orbsContainer);

  // ---- Particles (15 rising) ----
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (12 + Math.random() * 18) + 's';
    particle.style.width = (2 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    particlesContainer.appendChild(particle);
  }
  document.body.appendChild(particlesContainer);

  // ---- Mouse Spotlight ----
  const spotlight = document.createElement('div');
  spotlight.className = 'mouse-spotlight';
  document.body.appendChild(spotlight);
  document.addEventListener('mousemove', function(e) {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });

  // ---- Cursor Glow ----
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
    (function animateCursor() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      cursorGlow.style.left = cx + 'px';
      cursorGlow.style.top = cy + 'px';
      requestAnimationFrame(animateCursor);
    })();
  }

  // ---- 3D Tilt on Cards ----
  const tiltCards = document.querySelectorAll('.product-card, .category-card, .category-tile, .stat-card, .feature-card, .testimonial-card, .value-card');
  tiltCards.forEach(function(card) {
    card.classList.add('tilt-card');
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(shine);
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = (y - cy) / 12;
      const ry = (cx - x) / 12;
      card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(8px)';
      shine.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
      shine.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // ---- Nav 3D Hover ----
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) perspective(500px) rotateX(5deg)';
    });
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) perspective(500px) rotateX(0)';
    });
  });

  // ---- Button 3D Press ----
  document.querySelectorAll('.btn').forEach(function(btn) {
    btn.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(2px) perspective(500px) rotateX(-2deg)';
    });
    btn.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-1px) perspective(500px) rotateX(1deg)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) perspective(500px) rotateX(0)';
    });
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('.stat-number, .counter, [data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const raw = el.dataset.count || el.textContent.replace(/[^0-9]/g, '');
          const value = parseInt(raw);
          if (isNaN(value) || value === 0) return;
          let current = 0;
          const step = Math.max(1, Math.floor(value / 60));
          var timer = setInterval(function() {
            current += step;
            if (current >= value) {
              el.textContent = value.toLocaleString();
              clearInterval(timer);
            } else {
              el.textContent = Math.floor(current).toLocaleString();
            }
          }, 30);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(c) { counterObserver.observe(c); });
  }

  // ---- 3D Classes ----
  document.querySelectorAll('.product-card').forEach(function(c) { c.classList.add('product-card-3d'); });
  document.querySelectorAll('.category-card').forEach(function(c) { c.classList.add('category-card-3d'); });
  document.querySelectorAll('.feature-icon, .stat-icon').forEach(function(c) { c.classList.add('feature-icon-3d'); });
  document.querySelectorAll('.stat-card').forEach(function(c) { c.classList.add('stat-card-3d'); });
  document.querySelectorAll('.trust-badge').forEach(function(c) { c.classList.add('trust-badge-3d'); });
  document.querySelectorAll('.product-card, .category-card, .category-tile').forEach(function(c) { c.classList.add('holo-card'); });
  document.querySelectorAll('.product-image, .category-tile-image').forEach(function(img) {
    if (img.parentElement) img.parentElement.classList.add('glow-ring');
  });

  // ---- Navbar Scroll Effect ----
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('navbar-3d', window.scrollY > 50);
    });
  }

  console.log('%c✨ 3D Futuristic UI loaded', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
