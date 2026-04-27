/* Legacy Made Media — Shared site behavior */

(() => {
  // ---------- Mobile nav toggle ----------
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      const open = navLinks.classList.contains('is-open');
      hamburger.setAttribute('aria-expanded', open);
      hamburger.textContent = open ? '✕' : '☰';
    });
  }

  // ---------- Sticky CTA bar (only on agency pages) ----------
  const sticky = document.querySelector('.sticky-cta');
  if (sticky) {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 240) {
        sticky.classList.add('is-hidden');
      } else if (y < lastY) {
        sticky.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---------- Contact form -> mailto ----------
  const form = document.querySelector('[data-mailto-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const to = form.dataset.mailtoTo || 'contact@legacymademedia.net';
      const subject = form.dataset.mailtoSubject || 'Legacy Made Media — Inquiry';

      const lines = [];
      for (const [k, v] of data.entries()) {
        if (v && String(v).trim()) {
          const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          lines.push(`${label}: ${v}`);
        }
      }

      const body = lines.join('\n') + '\n\n— sent from legacymademedia.net contact form';
      const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;

      const status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent = 'Opening your email app… if nothing happens, email contact@legacymademedia.net directly.';
        status.style.color = 'var(--yellow)';
      }
    });
  }

  // ---------- Active nav link ----------
  const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---------- Smooth-fade on internal anchor ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
