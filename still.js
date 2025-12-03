console.log('stills lightbox ready');

(() => {
  const grid = document.getElementById('stills-grid');
  const lb   = document.getElementById('lightbox');

  // If this page doesn't have the gallery/lightbox, exit quietly.
  if (!grid || !lb) return;

  // Only query inside the lightbox *after* we've confirmed it exists.
  const lbImg    = document.getElementById('lb-image');
  const lbCap    = document.getElementById('lb-caption');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev  = lb.querySelector('.lb-prev');
  const btnNext  = lb.querySelector('.lb-next');

  const items = Array.from(grid.querySelectorAll('a.still'));
  let idx = 0;
  let lastFocused = null;

  function show(i) {
    idx = (i + items.length) % items.length;
    const a = items[idx];
    lbImg.src = a.getAttribute('href');
    lbImg.alt = a.querySelector('img')?.alt || '';
    lbCap.textContent = a.dataset.caption || '';
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    btnClose.focus();
    document.body.style.overflow = 'hidden'; // prevent page scroll behind
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocused) lastFocused.focus();
  }

  grid.addEventListener('click', (e) => {
    const a = e.target.closest('a.still');
    if (!a) return;
    e.preventDefault();
    const i = items.indexOf(a);
    if (i >= 0) open(i);
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(idx - 1));
  btnNext.addEventListener('click', () => show(idx + 1));

  lb.addEventListener('click', (e) => {
    // click backdrop to close
    if (e.target === lb) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
})();