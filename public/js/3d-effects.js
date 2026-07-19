/* ================================================================
   3D & GLASSMORPHISM INTERACTIONS
   Trinity Woodenworks — Premium 3D UI
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- Create Aurora Background ----
  const aurora = document.createElement('div');
  aurora.className = 'aurora-bg';
  document.body.appendChild(aurora);

  // ---- Create Star Field ----
  const starfield = document.createElement('div');
  starfield.className = 'starfield';
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    starfield.appendChild(star);
  }
  document.body.appendChild(starfield);

  // ---- Create Animated Grid ----
  const grid = document.createElement('div');
  grid.className = 'grid-overlay';
  document.body.appendChild(grid);

  // ---- Create Perspective Grid ----
  const perspGrid = document.createElement('div');
  perspGrid.className = 'perspective-grid';
  document.body.appendChild(perspGrid);

  // ---- Create Floating Shapes ----
  const shapesContainer = document.createElement('div');
  shapesContainer.className = 'floating-shapes';
  const shapeTypes = ['shape-cube', 'shape-diamond', 'shape-ring', 'shape-hex', 'shape-cube', 'shape-diamond'];
  shapeTypes.forEach((type, i) => {
    const shape = document.createElement('div');
    shape.className = 'shape ' + type;
    shapesContainer.appendChild(shape);
  });
  document.body.appendChild(shapesContainer);

  // ---- Create Energy Lines ----
  const energyContainer = document.createElement('div');
  energyContainer.className = 'energy-lines';
  for (let i = 0; i < 6; i++) {
    const line = document.createElement('div');
    line.className = 'energy-line';
    energyContainer.appendChild(line);
  }
  document.body.appendChild(energyContainer);

  // ---- Create Pulse Waves ----
  const pulseContainer = document.createElement('div');
  pulseContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-2;overflow:hidden;';
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'pulse-wave';
    pulseContainer.appendChild(wave);
  }
  document.body.appendChild(pulseContainer);

  // ---- Create Glass Orbs ----
  const orbsContainer = document.createElement('div');
  orbsContainer.className = 'glass-orbs';
  for (let i = 0; i < 5; i++) {
    const orb = document.createElement('div');
    orb.className = 'glass-orb';
    orbsContainer.appendChild(orb);
  }
  document.body.appendChild(orbsContainer);

  // ---- Create Floating Particles ----
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    particle.style.opacity = 0.1 + Math.random() * 0.3;
    particlesContainer.appendChild(particle);
  }
  document.body.appendChild(particlesContainer);

  // ---- Mouse Spotlight ----
  const spotlight = document.createElement('div');
  spotlight.className = 'mouse-spotlight';
  document.body.appendChild(spotlight);

  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });

  // ---- 3D Tilt Effect on Cards ----
  const tiltCards = document.querySelectorAll('.product-card, .category-card, .stat-card-3d, .feature-card, .testimonial-card');
  
  tiltCards.forEach(card => {
    card.classList.add('tilt-card');
    
    // Add shine element
    const shine = document.createElement('div');
    shine.className = 'tilt-shine';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(shine);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      shine.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
      shine.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // ---- Scroll Reveal Animation ----
  const revealElements = document.querySelectorAll('.section, .feature-card, .product-card, .category-card, .cta-card, .about-grid, .testimonial-card, .trust-badge');
  
  revealElements.forEach(el => {
    el.classList.add('reveal-3d');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Parallax Effect on Hero ----
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;
      hero.style.transform = `translateY(${rate}px)`;
    });
  }

  // ---- Smooth 3D Navigation ----
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) perspective(500px) rotateX(5deg)';
    });
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) perspective(500px) rotateX(0)';
    });
  });

  // ---- 3D Button Press Effect ----
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(2px) perspective(500px) rotateX(-2deg)';
    });
    btn.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-3px) perspective(500px) rotateX(2deg)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) perspective(500px) rotateX(0)';
    });
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('.stat-number, .counter, [data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const value = parseInt(target.dataset.count || target.textContent.replace(/[^0-9]/g, ''));
        if (isNaN(value)) return;
        
        let current = 0;
        const increment = value / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            target.textContent = value.toLocaleString();
            clearInterval(timer);
          } else {
            target.textContent = Math.floor(current).toLocaleString();
          }
        }, 30);
        
        counterObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });

  // ---- Add 3D classes to existing elements ----
  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.add('product-card-3d');
  });
  
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.add('category-card-3d');
  });

  document.querySelectorAll('.feature-icon').forEach(icon => {
    icon.classList.add('feature-icon-3d');
  });

  document.querySelectorAll('.stat-card').forEach(card => {
    card.classList.add('stat-card-3d');
  });

  // ---- Navbar Scroll Effect ----
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-3d');
      } else {
        navbar.classList.remove('navbar-3d');
      }
    });
  }

  // ---- Cursor Glow Effect ----
  const cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
  `;
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  // ---- Magnetic Buttons ----
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-glow');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ---- Hero Text Animation ----
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    heroTitle.classList.add('neon-text');
  }

  // ---- Add Holo Effect to Cards ----
  document.querySelectorAll('.product-card, .category-card').forEach(card => {
    card.classList.add('holo-card');
  });

  // ---- Add Glow Ring to Images ----
  document.querySelectorAll('.product-image, .category-tile-image').forEach(img => {
    img.parentElement.classList.add('glow-ring');
  });

  console.log('%c✨ 3D Futuristic UI loaded', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
