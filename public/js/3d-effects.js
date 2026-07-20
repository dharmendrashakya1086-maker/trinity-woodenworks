/* ================================================================
   3D FUTURISTIC UI — Interactions & Effects
   Trinity Woodenworks
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // ---- Aurora Background ----
  (function() {
    var aurora = document.createElement('div');
    aurora.className = 'aurora-bg';
    document.body.appendChild(aurora);
  })();

  // ---- Star Field (100 stars) ----
  (function() {
    var starfield = document.createElement('div');
    starfield.className = 'starfield';
    for (var i = 0; i < 100; i++) {
      var star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 6 + 's';
      starfield.appendChild(star);
    }
    document.body.appendChild(starfield);
  })();

  // ---- Grid Overlay ----
  (function() {
    var grid = document.createElement('div');
    grid.className = 'grid-overlay';
    document.body.appendChild(grid);
  })();

  // ---- Perspective Grid ----
  (function() {
    var pg = document.createElement('div');
    pg.className = 'perspective-grid';
    document.body.appendChild(pg);
  })();

  // ---- Glass Orbs ----
  (function() {
    var container = document.createElement('div');
    container.className = 'glass-orbs';
    for (var i = 0; i < 5; i++) {
      var orb = document.createElement('div');
      orb.className = 'glass-orb';
      container.appendChild(orb);
    }
    document.body.appendChild(container);
  })();

  // ---- Particles (20 rising) ----
  (function() {
    var container = document.createElement('div');
    container.className = 'particles';
    for (var i = 0; i < 20; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 18 + 's';
      p.style.animationDuration = (12 + Math.random() * 20) + 's';
      p.style.width = (2 + Math.random() * 2) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);
    }
    document.body.appendChild(container);
  })();

  // ---- Shooting Stars ----
  (function() {
    var container = document.createElement('div');
    container.className = 'starfield'; // re-use same z-index
    function createShootingStar() {
      var star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.top = (5 + Math.random() * 40) + '%';
      star.style.left = (60 + Math.random() * 40) + '%';
      star.style.animation = 'shoot ' + (2 + Math.random() * 3) + 's ease-out forwards';
      star.style.animationDelay = '0s';
      container.appendChild(star);
      setTimeout(function() { star.remove(); }, 5000);
    }
    document.body.appendChild(container);
    setInterval(createShootingStar, 8000 + Math.random() * 12000);
  })();

  // ---- Floating 3D Shapes ----
  (function() {
    var container = document.createElement('div');
    container.className = 'floating-shapes';
    var types = ['shape-cube', 'shape-diamond', 'shape-ring', 'shape-hex', 'shape-cube2', 'shape-ring2'];
    for (var i = 0; i < types.length; i++) {
      var shape = document.createElement('div');
      shape.className = 'floating-shape ' + types[i];
      container.appendChild(shape);
    }
    document.body.appendChild(container);
  })();

  // ---- Pulse Waves ----
  (function() {
    var container = document.createElement('div');
    container.className = 'pulse-waves';
    for (var i = 0; i < 3; i++) {
      var wave = document.createElement('div');
      wave.className = 'pulse-wave';
      container.appendChild(wave);
    }
    document.body.appendChild(container);
  })();

  // ---- Energy Beams ----
  (function() {
    var container = document.createElement('div');
    container.className = 'energy-beams';
    for (var i = 0; i < 3; i++) {
      var beam = document.createElement('div');
      beam.className = 'energy-beam';
      container.appendChild(beam);
    }
    document.body.appendChild(container);
  })();

  // ---- Scanline Overlay ----
  (function() {
    var scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    document.body.appendChild(scanlines);
  })();

  // ---- Hero Glow ----
  (function() {
    var hero = document.querySelector('.hero');
    if (hero) {
      var glow = document.createElement('div');
      glow.className = 'hero-glow';
      hero.appendChild(glow);
    }
  })();

  // ---- Mouse Spotlight ----
  (function() {
    var spot = document.createElement('div');
    spot.className = 'mouse-spotlight';
    document.body.appendChild(spot);
    document.addEventListener('mousemove', function(e) {
      spot.style.left = e.clientX + 'px';
      spot.style.top = e.clientY + 'px';
    });
  })();

  // ---- Cursor Glow (smooth follow) ----
  if (window.matchMedia('(pointer: fine)').matches) {
    (function() {
      var cg = document.createElement('div');
      cg.className = 'cursor-glow';
      document.body.appendChild(cg);
      var mx = 0, my = 0, cx = 0, cy = 0;
      document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
      (function anim() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        cg.style.left = cx + 'px';
        cg.style.top = cy + 'px';
        requestAnimationFrame(anim);
      })();
    })();
  }

  // ---- 3D Tilt on Cards ----
  (function() {
    var cards = document.querySelectorAll('.product-card, .category-card, .category-tile, .stat-card, .feature-card, .testimonial-card, .value-card, .founder-card, .trust-badge');
    cards.forEach(function(card) {
      card.classList.add('tilt-card');
      var shine = document.createElement('div');
      shine.className = 'tilt-shine';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(shine);
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rx = (y - cy) / 12;
        var ry = (cx - x) / 12;
        card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(8px)';
        shine.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
        shine.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  })();

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
  (function() {
    var counters = document.querySelectorAll('.stat-number, .counter, [data-count]');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var raw = el.dataset.count || el.textContent.replace(/[^0-9]/g, '');
        var value = parseInt(raw);
        if (isNaN(value) || value === 0) return;
        var current = 0;
        var step = Math.max(1, Math.floor(value / 60));
        var timer = setInterval(function() {
          current += step;
          if (current >= value) {
            el.textContent = value.toLocaleString();
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current).toLocaleString();
          }
        }, 30);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function(c) { observer.observe(c); });
  })();

  // ---- 3D Classes ----
  document.querySelectorAll('.product-card').forEach(function(c) { c.classList.add('product-card-3d', 'holo-card'); });
  document.querySelectorAll('.category-card').forEach(function(c) { c.classList.add('category-card-3d', 'holo-card'); });
  document.querySelectorAll('.category-tile').forEach(function(c) { c.classList.add('holo-card'); });
  document.querySelectorAll('.feature-icon, .stat-icon').forEach(function(c) { c.classList.add('feature-icon-3d'); });
  document.querySelectorAll('.stat-card').forEach(function(c) { c.classList.add('stat-card-3d'); });
  document.querySelectorAll('.trust-badge').forEach(function(c) { c.classList.add('trust-badge-3d'); });
  document.querySelectorAll('.product-image, .category-tile-image').forEach(function(img) {
    if (img.parentElement) img.parentElement.classList.add('glow-ring');
  });

  // ---- Navbar Scroll Effect ----
  (function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function() {
      navbar.classList.toggle('navbar-3d', window.scrollY > 50);
    });
  })();

  console.log('%c✨ 3D Futuristic UI loaded', 'color: #C9A96E; font-size: 14px; font-weight: bold;');
});
