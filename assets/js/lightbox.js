(() => {
  const links = Array.from(document.querySelectorAll('.gallery-masonry-lightbox-link, .gallery-link, [data-lightbox]'));
  if (!links.length) return;
  let currentIndex = 0;

  let overlay = document.querySelector('.raavi-lightbox');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'raavi-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<button class="raavi-lightbox__close" type="button" aria-label="Close image">&times;</button>',
      '<button class="raavi-lightbox__nav raavi-lightbox__prev" type="button" aria-label="Previous image">',
      '  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      '  </svg>',
      '</button>',
      '<button class="raavi-lightbox__nav raavi-lightbox__next" type="button" aria-label="Next image">',
      '  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
      '    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      '  </svg>',
      '</button>',
      '<img class="raavi-lightbox__image" alt="">',
      '<div class="raavi-lightbox__caption"></div>'
    ].join('');
    document.body.appendChild(overlay);
  }

  const imageEl = overlay.querySelector('.raavi-lightbox__image');
  const captionEl = overlay.querySelector('.raavi-lightbox__caption');
  const closeButton = overlay.querySelector('.raavi-lightbox__close');
  const prevButton = overlay.querySelector('.raavi-lightbox__prev');
  const nextButton = overlay.querySelector('.raavi-lightbox__next');

  const normalizeIndex = (index) => {
    if (!links.length) return 0;
    return (index + links.length) % links.length;
  };

  const getImageData = (link) => {
    if (!link) return { src: null, alt: '' };
    const img = link.querySelector('img');
    const src = link.getAttribute('href') || (img ? (img.getAttribute('data-image') || img.getAttribute('data-src') || img.getAttribute('src')) : null);
    const alt = img ? (img.getAttribute('alt') || '') : '';
    return { src, alt };
  };

  const updateNavState = () => {
    const isSingle = links.length < 2;
    overlay.classList.toggle('is-single', isSingle);
    if (prevButton) prevButton.disabled = isSingle;
    if (nextButton) nextButton.disabled = isSingle;
  };

  const openAt = (index) => {
    currentIndex = normalizeIndex(index);
    const { src, alt } = getImageData(links[currentIndex]);
    if (!src) return;
    imageEl.src = src;
    imageEl.alt = alt || '';
    if (alt) {
      captionEl.textContent = alt;
      captionEl.style.display = 'block';
    } else {
      captionEl.textContent = '';
      captionEl.style.display = 'none';
    }
    updateNavState();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    imageEl.removeAttribute('src');
    imageEl.alt = '';
    captionEl.textContent = '';
    captionEl.style.display = 'none';
    document.body.classList.remove('lightbox-open');
  };

  const showNext = () => openAt(currentIndex + 1);
  const showPrev = () => openAt(currentIndex - 1);

  closeButton.addEventListener('click', close);
  if (prevButton) prevButton.addEventListener('click', (event) => {
    event.stopPropagation();
    showPrev();
  });
  if (nextButton) nextButton.addEventListener('click', (event) => {
    event.stopPropagation();
    showNext();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrev();
  });

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openAt(index);
    });
  });
})();
