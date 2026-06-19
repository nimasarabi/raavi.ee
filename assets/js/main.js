(() => {
  const normalizePath = (path) => {
    if (!path || path === '/') return '/';
    return path.replace(/\/+$/, '') + '/';
  };

  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.origin);
    const linkPath = normalizePath(url.pathname);
    const isHome = linkPath === '/' || linkPath === '/et/';
    const isCurrent = isHome ? currentPath === linkPath : currentPath.startsWith(linkPath);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const toggles = document.querySelectorAll('.menu-toggle');
  toggles.forEach((toggle) => {
    const header = toggle.closest('.site-header');
    if (!header) return;
    const mobileNav = header.querySelector('.mobile-nav');
    if (!mobileNav) return;

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });

  const pickers = document.querySelectorAll('.language-picker');
  const closePickers = () => {
    pickers.forEach((picker) => {
      picker.classList.remove('is-open');
      const button = picker.querySelector('.language-picker-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  };

  pickers.forEach((picker) => {
    const toggle = picker.querySelector('.language-picker-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = !picker.classList.contains('is-open');
      closePickers();
      picker.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', () => {
    closePickers();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePickers();
    }
  });

  const galleryFilter = document.querySelector('.gallery-filter');
  if (galleryFilter) {
    const tabs = Array.from(galleryFilter.querySelectorAll('.gallery-filter-tab'));
    const categories = Array.from(document.querySelectorAll('.gallery-category'));

    const applyFilter = (value) => {
      categories.forEach((category) => {
        const matches = value === 'all' || category.dataset.category === value;
        category.classList.toggle('is-hidden', !matches);
      });
      tabs.forEach((tab) => {
        tab.setAttribute('aria-pressed', tab.dataset.filter === value ? 'true' : 'false');
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        applyFilter(tab.dataset.filter);
      });
    });
  }

  const fadeGalleries = document.querySelectorAll('[data-fade-gallery]');
  const fallbackSvg = () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#f5f1ea"/><rect x="1" y="1" width="1198" height="798" fill="none" stroke="rgba(28,26,23,.14)" stroke-width="2"/><text x="600" y="408" text-anchor="middle" fill="#817a70" font-family="Arial, sans-serif" font-size="32" letter-spacing="3">RAAVI</text></svg>';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  fadeGalleries.forEach((gallery) => {
    const track = gallery.querySelector('.home-image-gallery-column');
    const originals = Array.from(track ? track.querySelectorAll('.home-image-gallery-item') : []);

    // Build decorative duplicates in JS so crawlers only see the original items
    if (track && originals.length) {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        const img = clone.querySelector('img');
        if (img) img.alt = '';
        track.appendChild(clone);
      });
    }

    const items = Array.from(gallery.querySelectorAll('.home-image-gallery-item'));
    const images = items.map((item) => item.querySelector('img')).filter(Boolean);

    images.forEach((image) => {
      const item = image.closest('.home-image-gallery-item');
      if (!item) return;

      // Disable the browser's native image drag so pointer dragging can scrub.
      image.draggable = false;

      const markLoaded = () => {
        item.classList.add('is-loaded');
      };

      image.addEventListener('load', markLoaded, { once: true });
      image.addEventListener('error', () => {
        item.classList.add('is-fallback', 'is-loaded');
        image.src = fallbackSvg();
      }, { once: true });

      if (image.complete && image.naturalWidth > 0) {
        markLoaded();
      }

      item.classList.add('is-in-view');
    });

    if (!track || items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const duplicatedStartIndex = originals.length;
    const pixelsPerSecond = 18;
    let loopDistance = 0;
    let position = 0;
    let previousTimestamp = null;
    let isHoverPaused = false;
    let isFocusPaused = false;
    let isDocumentPaused = document.hidden;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartPosition = 0;

    const isPaused = () => isHoverPaused || isDragging || isFocusPaused || isDocumentPaused;

    const normalizePosition = (value) => {
      if (loopDistance <= 0) {
        return 0;
      }
      return ((value % loopDistance) + loopDistance) % loopDistance;
    };

    const renderPosition = () => {
      track.style.transform = `translate3d(${-position}px, 0, 0)`;
    };

    const measureLoop = () => {
      const duplicateStart = items[duplicatedStartIndex];
      loopDistance = duplicateStart ? duplicateStart.offsetLeft : 0;
      if (loopDistance > 0) {
        position = normalizePosition(position);
        renderPosition();
      }
    };

    const tick = (timestamp) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
      }

      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;

      if (!isPaused() && loopDistance > 0) {
        position = normalizePosition(position + (pixelsPerSecond * elapsedSeconds));
        renderPosition();
      }

      window.requestAnimationFrame(tick);
    };

    measureLoop();
    window.addEventListener('resize', measureLoop, { passive: true });

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(measureLoop);
      resizeObserver.observe(track);
    }

    // Pause on hover, but only for a real mouse. Touch taps emit synthetic
    // hover events that never clear, which would freeze the strip on mobile.
    gallery.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') isHoverPaused = true;
    });
    gallery.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') isHoverPaused = false;
    });
    gallery.addEventListener('focusin', () => {
      isFocusPaused = true;
    });
    gallery.addEventListener('focusout', () => {
      isFocusPaused = false;
    });

    const endDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      gallery.classList.remove('is-dragging');
      if (event && event.pointerId !== undefined && gallery.hasPointerCapture(event.pointerId)) {
        gallery.releasePointerCapture(event.pointerId);
      }
    };

    gallery.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button > 0) return;
      // Stop native image drag / text selection so the gesture scrubs the strip.
      event.preventDefault();
      isDragging = true;
      dragStartX = event.clientX;
      dragStartPosition = position;
      gallery.classList.add('is-dragging');
      if (event.pointerId !== undefined) gallery.setPointerCapture(event.pointerId);
    });
    gallery.addEventListener('pointermove', (event) => {
      if (!isDragging || loopDistance <= 0) return;
      const dragDelta = event.clientX - dragStartX;
      position = normalizePosition(dragStartPosition - dragDelta);
      renderPosition();
    });
    gallery.addEventListener('pointerup', endDrag);
    gallery.addEventListener('pointercancel', endDrag);
    gallery.addEventListener('lostpointercapture', endDrag);
    gallery.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    document.addEventListener('visibilitychange', () => {
      isDocumentPaused = document.hidden;
    });

    window.requestAnimationFrame(tick);
  });
})();
