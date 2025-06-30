// Prevent FOUC
window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});

(() => {
  // Element references
  const nav      = document.querySelector('nav.scroll-nav');
  const links    = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('main section[id]');
  const header   = document.getElementById('main-header');
  const toggle   = document.getElementById('theme-toggle');
  const root     = document.documentElement;

  // Create the moving rail indicator
  const indicator = document.createElement('div');
  indicator.className = 'nav-indicator';
  nav.appendChild(indicator);

  function moveIndicator(link) {
    const linkRect = link.getBoundingClientRect();
    const navRect  = nav.getBoundingClientRect();
    indicator.style.top    = (linkRect.top - navRect.top) + 'px';
    indicator.style.height = linkRect.height + 'px';
  }

  // 1. Reveal-on-scroll observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -20% 0px',
    threshold: 0
  });

  // 2. Scroll-spy observer
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // clear previous
        links.forEach(a => a.classList.remove('active'));
        // activate this link and move rail
        const link = nav.querySelector(`a[href="#${entry.target.id}"]`);
        if (link) {
          link.classList.add('active');
          moveIndicator(link);
        }
      }
    });
  }, {
    rootMargin: '0px 0px -66% 0px',
    threshold: 0
  });

  // Observe sections
  sections.forEach(sec => {
    sec.classList.add('reveal');    // start hidden
    revealObserver.observe(sec);    // reveal animations
    spyObserver.observe(sec);       // scroll-spy
  });

  // On load: position rail at the first active link
  window.addEventListener('load', () => {
    const initial = nav.querySelector('a.active') || links[0];
    if (initial) moveIndicator(initial);
  });

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
