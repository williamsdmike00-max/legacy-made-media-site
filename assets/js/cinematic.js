/* Cinematic — particle field, custom cursor, reveals, 3D tilt, magnetic CTAs, counters */

(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 880px)').matches;

  // ========== PARTICLE FIELD ==========
  const canvas = document.querySelector('.cn-canvas');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    let mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      const count = isMobile ? 40 : Math.min(110, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    resize();
    initParticles();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * 0.6;
          p.y += (dy / d) * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(61, 139, 255, 0.7)';
        ctx.fill();
      }

      // connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000) {
            const op = 1 - d2 / 14000;
            ctx.strokeStyle = `rgba(61, 139, 255, ${op * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(tick);
    };
    tick();
  }

  // ========== CUSTOM CURSOR ==========
  const cur = document.querySelector('.cn-cursor');
  const ring = document.querySelector('.cn-cursor-ring');
  if (cur && ring && !isMobile) {
    cur.classList.add('is-active');
    ring.classList.add('is-active');

    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let rx = cx, ry = cy;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    });

    const ringTick = () => {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(ringTick);
    };
    ringTick();

    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cur.classList.add('is-hover');
        ring.classList.add('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        cur.classList.remove('is-hover');
        ring.classList.remove('is-hover');
      });
    });
  }

  // ========== HERO REVEAL ==========
  setTimeout(() => {
    document.querySelectorAll('.cn-word').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 80);
    });
    document.querySelectorAll('.cn-hero__sub, .cn-hero__ctas').forEach(el => el.classList.add('in'));
  }, 200);

  // ========== SCROLL REVEALS ==========
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.cn-reveal, .cn-reveal-stagger').forEach(el => observer.observe(el));

  // ========== 3D TILT ==========
  document.querySelectorAll('.cn-tilt').forEach(card => {
    if (isMobile) return;

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (y - 0.5) * -10;
      const ry = (x - 0.5) * 10;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
    });
  });

  // ========== MAGNETIC CTAs ==========
  document.querySelectorAll('.cn-magnet').forEach(btn => {
    if (isMobile) return;

    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ========== ANIMATED COUNTERS ==========
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        const display = Number.isInteger(target) ? Math.floor(value) : value.toFixed(1);
        el.textContent = `${prefix}${display}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));
})();
