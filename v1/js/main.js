// Prevent FOUC
window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

(() => {
  const nav = document.querySelector('nav.scroll-nav');
  const links = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('main section[id]');
  const header = document.getElementById('main-header');
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Reveal-on-scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, {
    rootMargin: '0px 0px -20% 0px',
    threshold: 0
  });

  // Scroll-spy (20% down trigger)
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        const activeLink = nav.querySelector(`a[href="#${e.target.id}"]`);
        activeLink?.classList.add('active');
      }
    });
  }, {
    rootMargin: '0px 0px -80% 0px',
    threshold: 0
  });

// 1) Observe sections
sections.forEach(sec => {
  sec.classList.add('reveal');
  revealObserver.observe(sec);
  spyObserver.observe(sec);
});

// 2) Smooth-scroll “About” back to top and highlight it
const aboutLink = nav.querySelector('a[href="#summary"]');
if (aboutLink) {
  aboutLink.addEventListener('click', e => {
    e.preventDefault();                        // stop default anchor jump
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // update active state immediately
    links.forEach(a => a.classList.remove('active'));
    aboutLink.classList.add('active');
    // update URL hash without reload
    history.replaceState(null, '', '#summary');
  });
}

  // Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 20);
    localStorage.setItem('scrollY', window.scrollY);
  });

  // Theme toggle & persistence
  const saved = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', saved);
  toggle.textContent = saved === 'light' ? '🌙' : '☀️';
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'light' ? '🌙' : '☀️';
  });

  // Restore scroll position
  window.addEventListener('load', () => {
    const y = +localStorage.getItem('scrollY') || 0;
    if (y) window.scrollTo({ top: y });
  });
})();
