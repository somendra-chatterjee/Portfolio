'use strict';
document.getElementById('year').textContent = new Date().getFullYear();
const periods = [...document.querySelectorAll('.year-entry')];
const yearLinks = [...document.querySelectorAll('.year-nav a')];
function markPeriod(id) {
  yearLinks.forEach(link => {
    if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  periods.forEach(period => period.classList.toggle('is-current', period.id === id));
}
yearLinks.forEach(link => link.addEventListener('click', () => markPeriod(link.getAttribute('href').slice(1))));
if ('IntersectionObserver' in window) {
  const visible = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) visible.set(entry.target.id, entry.target); else visible.delete(entry.target.id); });
    const ordered = [...visible.values()].sort((a,b) => Math.abs(a.getBoundingClientRect().top - 120) - Math.abs(b.getBoundingClientRect().top - 120));
    if (ordered[0]) markPeriod(ordered[0].id);
  }, { rootMargin: '-10% 0px -45% 0px', threshold: 0 });
  periods.forEach(period => observer.observe(period));
}
if (periods.length) markPeriod(periods[0].id);
