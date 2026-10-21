'use strict';
(() => {
  const root = document.documentElement;
  root.dataset.theme = 'light'; // Deliberately reset on every fresh load. No storage or system theme.
  root.classList.add('js');
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  $('#year').textContent = new Date().getFullYear();
  const theme = $('#theme-toggle');
  theme.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    theme.dataset.mode = dark ? 'dark' : 'light';
    theme.setAttribute('aria-checked', String(dark));
    theme.querySelector('.theme-label').textContent = dark ? 'Dark' : 'Light';
    theme.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name="color-scheme"]').content = dark ? 'dark' : 'light';
  });
  let toastTimer;
  function toast(message) {
    const n = $('#toast');
    clearTimeout(toastTimer);
    n.textContent = message;
    n.classList.add('visible');
    toastTimer = setTimeout(() => n.classList.remove('visible'), 4500);
  }
  const resumeDialog = $('#resume-dialog');
  $$('[data-resume-dialog]').forEach(link => link.addEventListener('click', event => {
    if (typeof resumeDialog.showModal !== 'function') return;
    event.preventDefault(); resumeDialog.showModal();
  }));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close();
  }));
  $$('a[download]').forEach(a => a.addEventListener('click', () => {
    if (resumeDialog.open) resumeDialog.close();
    toast('PDF download requested. Check your browser’s downloads.');
  }));
  resumeDialog.querySelector('#view-resume').addEventListener('click', () => resumeDialog.close());
  async function copy(text, message = 'Copied to clipboard.') {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text); toast(message);
    } catch (_) {
      // Local-file browsers may block the asynchronous clipboard API.
      const priorFocus = document.activeElement;
      const holder = document.querySelector('dialog[open]') || document.body;
      const temp = document.createElement('textarea'); temp.value = text;
      temp.setAttribute('aria-label', 'Copy contact value');
      temp.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      holder.append(temp); temp.focus(); temp.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {}
      temp.remove(); priorFocus?.focus();
      if (copied) { toast(message); return; }
      const area = $('#copy-fallback'); area.value = text;
      const dialog = $('#copy-dialog');
      if (typeof dialog.showModal === 'function') { dialog.showModal(); area.focus(); area.select(); }
      else { window.prompt('Copy this text:', text); }
    }
  }
  $('#select-copy').addEventListener('click', () => { $('#copy-fallback').focus(); $('#copy-fallback').select(); });
  $$('[data-copy-target]').forEach(b => b.addEventListener('click', () => {
    const target = document.getElementById(b.dataset.copyTarget);
    copy(target.innerText.trim(), 'Text copied.');
  }));
  $$('[data-copy-value]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copyValue)));
  $$('[data-share]').forEach(b => b.addEventListener('click', () => {
    if (location.protocol === 'file:') { toast('Shareable section links are available after the website is published.'); return; }
    const url = new URL(location.href); url.hash = b.dataset.share;
    copy(url.href, 'Section link copied.');
  }));
  const disclosures = $$('details.expandable');
  function updateViewStatus(mode, message) {
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === mode)));
    $('#view-status').textContent = message;
  }
  function view(mode) {
    disclosures.forEach(d => { d.open = mode === 'full'; });
    updateViewStatus(mode, mode === 'full' ? 'Full details: all sections expanded.' : 'Quick overview: details collapsed. Open any role or project to explore.');
    requestAnimationFrame(updateScroll);
  }
  $$('[data-view]').forEach(b => b.addEventListener('click', () => view(b.dataset.view)));
  $('[data-expand]').addEventListener('click', () => view('full'));
  $('[data-collapse]').addEventListener('click', () => {
    disclosures.forEach(d => { d.open = false; });
    updateViewStatus('', 'All details collapsed. Key results remain visible.');
    requestAnimationFrame(updateScroll);
  });
  disclosures.forEach(d => d.addEventListener('toggle', () => requestAnimationFrame(updateScroll)));
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    let parent = target.closest('details');
    while (parent) { parent.open = true; parent = parent.parentElement.closest('details'); }
    if (target.classList.contains('year-entry') || target.classList.contains('project')) target.querySelector('details').open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealHash);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', () => {
    if (a.hash === location.hash) revealHash();
  }));
  const sectionLinks = $$('#navigation a[href^="#"]');
  const sections = sectionLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const periods = $$('.year-entry');
  const yearLinks = $$('.year-nav a');
  function markClosest(nodes, links, offset) {
    if (!nodes.length) return;
    let current = nodes[0];
    for (const node of nodes) { if (node.getBoundingClientRect().top <= offset) current = node; }
    links.forEach(a => {
      if (a.hash === '#' + current.id) a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
  }
  function updateScroll() {
    const max = Math.max(0, root.scrollHeight - window.innerHeight);
    $('#reading-progress').style.transform = `scaleX(${max ? Math.min(1, Math.max(0, window.scrollY / max)) : 1})`;
    $('.back-to-top').hidden = window.scrollY < 650;
    const h = $('.header').getBoundingClientRect().height;
    root.style.setProperty('--header-height', h + 'px');
    markClosest(sections, sectionLinks, h + 90);
    markClosest(periods, yearLinks, h + 100);
  }
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return; scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateScroll(); });
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  if ('ResizeObserver' in window) new ResizeObserver(updateScroll).observe(document.body);
  let printState;
  function preparePrint() {
    if (printState) return;
    printState = disclosures.map(d => d.open);
    disclosures.forEach(d => { d.open = true; });
  }
  function restorePrint() {
    if (!printState) return;
    disclosures.forEach((d,i) => { d.open = printState[i]; });
    printState = null;
  }
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', restorePrint);
  $('#print-profile').addEventListener('click', () => { preparePrint(); window.print(); });
  view('overview'); revealHash(); updateScroll();
})();
