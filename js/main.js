// Prevent FOUC
window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

(() => {
  const nav      = document.querySelector('nav.scroll-nav');
  const links    = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('main section[id]');
  const header   = document.getElementById('main-header');
  const toggle   = document.getElementById('theme-toggle');
  const root     = document.documentElement;

  // Reveal-on-scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0 });

  // Scroll-spy
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        const activeLink = nav.querySelector(`a[href="#${e.target.id}"]`);
        activeLink?.classList.add('active');
      }
    });
  }, { rootMargin: '0px 0px -75% 0px', threshold: 0 });

  sections.forEach(sec => {
    sec.classList.add('reveal');
    revealObserver.observe(sec);
    spyObserver.observe(sec);
  });

  // Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 20);
    localStorage.setItem('scrollY', window.scrollY);
  });

  // Theme toggle
  const saved = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', saved);
  toggle.textContent = saved === 'light' ? '🌙' : '☀️';
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Restore scroll
  window.addEventListener('load', () => {
    const y = +localStorage.getItem('scrollY') || 0;
    if (y) window.scrollTo({ top: y });
  });
})();
