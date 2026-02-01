(() => {
  const forms = document.querySelectorAll('.contact-form');
  if (!forms.length) return;

  const syncContactHeights = () => {
    const shouldSync = window.matchMedia('(min-width: 901px)').matches;
    document.querySelectorAll('.contact-grid').forEach((grid) => {
      const photo = grid.querySelector('.contact-photo');
      const card = grid.querySelector('.contact-form-card');
      if (!photo || !card) return;
      if (!shouldSync) {
        card.style.removeProperty('height');
        return;
      }
      const height = Math.round(photo.getBoundingClientRect().height);
      if (height) {
        card.style.height = `${height}px`;
      }
    });
  };

  const dateInputs = document.querySelectorAll('.date-input');
  let datePickers = [];
  const isTouch = navigator.maxTouchPoints > 0
    || window.matchMedia('(pointer: coarse)').matches
    || 'ontouchstart' in window;

  const getViewportWidth = () => (
    window.visualViewport && window.visualViewport.width
      ? window.visualViewport.width
      : window.innerWidth
  );

  const initDatePickers = () => {
    if (!dateInputs.length || typeof flatpickr === 'undefined') return;
    const viewportWidth = getViewportWidth();
    const shouldInline = !isTouch && viewportWidth >= 900;
    if (!shouldInline) return;
    const showThreeMonths = viewportWidth >= 1400;
    const showTwoMonths = viewportWidth >= 1200;
    datePickers = Array.from(dateInputs).map((input) => {
      const container = input.closest('.form-date');
      return flatpickr(input, {
        dateFormat: 'Y-m-d',
        allowInput: true,
        inline: true,
        showMonths: showThreeMonths ? 3 : showTwoMonths ? 2 : 1,
        appendTo: container || undefined,
      });
    });
  };

  const destroyDatePickers = () => {
    datePickers.forEach((picker) => picker.destroy());
    datePickers = [];
  };

  const refreshDatePickers = () => {
    destroyDatePickers();
    initDatePickers();
  };

  initDatePickers();

  const scheduleSync = () => {
    window.requestAnimationFrame(syncContactHeights);
  };

  window.addEventListener('load', scheduleSync);
  window.addEventListener('resize', (() => {
    let timeout;
    return () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(scheduleSync, 150);
      window.setTimeout(refreshDatePickers, 160);
    };
  })());

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshDatePickers);
  }

  document.querySelectorAll('.contact-photo img').forEach((image) => {
    if (image.complete) return;
    image.addEventListener('load', scheduleSync, { once: true });
  });

  const setFeedback = (form, message, status) => {
    const feedback = form.querySelector('.form-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.status = status || '';
  };

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.submitting === 'true') return;

      const submitButton = form.querySelector('button[type="submit"]');
      form.dataset.submitting = 'true';
      form.setAttribute('aria-busy', 'true');
      if (submitButton) submitButton.disabled = true;

      setFeedback(form, form.dataset.sending || 'Sending...', 'pending');

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          form.reset();
          setFeedback(form, form.dataset.success || 'Thanks! Your message has been sent.', 'success');
        } else {
          let message = form.dataset.error || 'Something went wrong. Please try again.';
          try {
            const data = await response.json();
            if (data && data.error) message = data.error;
          } catch {
            // Ignore JSON parse errors.
          }
          setFeedback(form, message, 'error');
        }
      } catch {
        setFeedback(form, form.dataset.error || 'Something went wrong. Please try again.', 'error');
      } finally {
        delete form.dataset.submitting;
        form.removeAttribute('aria-busy');
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
})();
