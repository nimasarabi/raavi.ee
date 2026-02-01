(() => {
  const forms = document.querySelectorAll('.contact-form');
  if (!forms.length) return;

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
