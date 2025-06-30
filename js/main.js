// js/main.js

(() => {
  // Grab key elements
  const nav = document.querySelector('nav.scroll-nav');
  const links = document.querySelectorAll('nav.scroll-nav a');
  const sections = document.querySelectorAll('main section[id]');
  const header = document.getElementById('main-header');
  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // 1️⃣ Create & append the moving “rail” indicator
  const indicator = document.createElement('div');
  indicator.className = 'nav-indicator';
  nav.appendChild(indicator);

  function moveIndicator(link) {
    const linkRect = link.getBoundingClientRect();
    const navRect  = nav.getBoundingClientRect();
    indicator.style.top    = (linkRect.top - navRect.top) + 'px';
    indicator.style.height = linkRect.height + 'px';
  }

  // 2️⃣ Reveal‐on‐scroll observer
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

  // 3️⃣ Scroll‐spy observer
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // clear previous
        links.forEach(a => a.classList.remove('active'));
        // activate this link + move rail
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

  // 4️⃣ Initialize each section
  sections.forEach(sec => {
    sec.classList.add('reveal');          // start hidden
    revealObserver.observe(sec);          // animate into view
    spyObserver.observe(sec);             // drive scroll-spy
  });

  // 5️⃣ On initial load, position rail
  window.addEventListener('load', () => {
    const initial = nav.querySelector('a.active') || links[0];
    if (initial) moveIndicator(initial);

    // Restore scroll position if any
    const y = +localStorage.getItem('scrollY') || 0;
    if (y) window.scrollTo({ top: y });
  });

  // 6️⃣ Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 20);
    // persist scroll position
    localStorage.setItem('scrollY', window.scrollY);
  });

  // 7️⃣ Theme toggle + persistence
  const savedTheme = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);
  toggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'light' ? '🌙' : '☀️';
  });
})();
