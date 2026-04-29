// Nav scroll-fade + mobile burger
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const isHero = document.body.classList.contains('has-hero');
  const update = () => {
    if (!isHero) { nav.classList.add('solid'); return; }
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      links.classList.toggle('open');
    });
  }
})();

// Portfolio: filter + lightbox
(function () {
  const grid = document.querySelector('.masonry-grid');
  if (!grid) return;

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      grid.querySelectorAll('.masonry-item').forEach(item => {
        const cat = item.dataset.category;
        item.classList.toggle('is-hidden', !(f === 'all' || cat === f));
      });
    });
  });

  // Lightbox
  const lb = document.querySelector('.lightbox');
  if (!lb) return;
  const lbImg = lb.querySelector('.lightbox-img img');
  const lbCap = lb.querySelector('.lightbox-caption');
  const closeBtn = lb.querySelector('.lightbox-close');
  const prevBtn = lb.querySelector('.lightbox-prev');
  const nextBtn = lb.querySelector('.lightbox-next');

  let visible = [];
  let idx = 0;

  const show = (i) => {
    if (!visible.length) return;
    idx = (i + visible.length) % visible.length;
    const item = visible[idx];
    lbImg.src = item.dataset.full || item.querySelector('img').src;
    lbImg.alt = item.querySelector('img').alt || '';
    lbCap.textContent = item.dataset.caption || '';
  };
  const open = (item) => {
    visible = Array.from(grid.querySelectorAll('.masonry-item:not(.is-hidden)'));
    idx = visible.indexOf(item);
    show(idx);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };

  grid.querySelectorAll('.masonry-item').forEach(item => {
    item.addEventListener('click', (e) => { e.preventDefault(); open(item); });
  });
  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => show(idx - 1));
  nextBtn?.addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
