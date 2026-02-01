(() => {
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
})();
