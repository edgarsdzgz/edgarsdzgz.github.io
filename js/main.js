// js/main.js
// Prevent FOUC
window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});


// Scroll-spy
const links = document.querySelectorAll('nav.scroll-nav a');
const sections = document.querySelectorAll('main section[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { rootMargin: '0px 0px -20% 0px', threshold: 0 });

sections.forEach(sec => {
  sec.classList.add('reveal');
  observer.observe(sec);
});

sections.forEach(sec => observer.observe(sec));

// Sticky header toggle
const header = document.getElementById('main-header');
window.addEventListener('scroll', () =>
  header.classList.toggle('sticky', window.scrollY > 20)
);

// Theme toggle + persistence
const toggle = document.getElementById('theme-toggle');
const root = document.documentElement;
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
window.addEventListener('beforeunload', () =>
  localStorage.setItem('scrollY', window.scrollY)
);
window.addEventListener('load', () => {
  const y = +localStorage.getItem('scrollY') || 0;
  window.scrollTo({ top: y });
});
