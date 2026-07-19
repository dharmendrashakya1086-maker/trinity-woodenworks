/* ================================================================
   3D & GLASSMORPHISM INTERACTIONS
   Trinity Woodenworks — Premium 3D UI
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

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
  for (let i = 0; i < 20; i++) {
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

  // ---- 3D Tilt Effect on Cards ----
  const tiltCards = document.querySelectorAll('.product-card, .category-card, .stat-card-3d, .feature-card');
  
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
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      shine.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
      shine.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // ---- Scroll Reveal Animation ----
  const revealElements = document.querySelectorAll('.section, .feature-card, .product-card, .category-card, .cta-card, .about-grid');
  
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
  const counters = document.querySelectorAll('.stat-number, .counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const value = parseInt(target.textContent.replace(/[^0-9]/g, ''));
        if (isNaN(value)) return;
        
        let current = 0;
        const increment = value / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            target.textContent = target.dataset.original || target.textContent;
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
    counter.dataset.original = counter.textContent;
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
        navbar.style.background = 'rgba(4,4,6,0.9) !important';
        navbar.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5) !important';
      } else {
        navbar.style.background = '';
        navbar.style.boxShadow = '';
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

  console.log('3D Glassmorphism UI loaded successfully');
});