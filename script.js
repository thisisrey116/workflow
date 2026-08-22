'use strict';

/* ==========================================================================
   FORM ENDPOINT
   Replace this placeholder with your real form-handling endpoint.

   Examples:
   - Formspree:  const FORM_ENDPOINT = 'https://formspree.io/f/yourFormId';
   - Getform:    const FORM_ENDPOINT = 'https://getform.io/f/yourFormId';
   - Custom API: const FORM_ENDPOINT = 'https://api.yourdomain.com/enquiries';
   ========================================================================== */
const FORM_ENDPOINT = 'https://example.com/api/enquiries';

/* ==========================================================================
   Mobile nav toggle
   Opens/closes the hamburger menu and syncs aria-expanded for screen readers.
   ========================================================================== */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   Smooth scroll for in-page anchor links
   Intercepts clicks on [data-scroll] (and nav links) so the hamburger menu
   closes and scrolling respects prefers-reduced-motion.
   ========================================================================== */
function initSmoothScroll() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      history.pushState(null, '', targetId);
    });
  });
}

/* ==========================================================================
   Fade-in-on-scroll
   Reveals elements marked .fade-in as they enter the viewport. Skips the
   animation entirely for users who prefer reduced motion.
   ========================================================================== */
function initFadeInObserver() {
  const items = document.querySelectorAll('.fade-in');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

/* ==========================================================================
   Testimonial carousel (mobile)
   Builds dot indicators, wires prev/next buttons, and keeps dots in sync
   when the user swipes the track directly on touch devices.
   ========================================================================== */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  let activeIndex = 0;
  let syncing = false;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
  }

  function goToSlide(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    syncing = true;
    slides[activeIndex].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    updateDots();
    window.setTimeout(() => { syncing = false; }, 400);
  }

  prevBtn.addEventListener('click', () => goToSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(activeIndex + 1));

  // Keep dots in sync when the user swipes the track directly.
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    if (syncing) return;
    clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
        const distance = Math.abs(trackCenter - slideCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });
      activeIndex = closestIndex;
      updateDots();
    }, 100);
  });

  updateDots();
}

/* ==========================================================================
   Enquiry form validation + submission
   Validates on blur and on submit, then submits via fetch() as JSON.
   ========================================================================== */
function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');
  const successPanel = document.getElementById('enquirySuccess');
  const resetLink = document.getElementById('resetFormLink');
  if (!form || !submitBtn || !statusEl || !successPanel) return;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

  const fields = {
    name: {
      el: form.elements.name,
      errorEl: document.getElementById('name-error'),
      validate: (value) => (value.trim() ? '' : 'Please enter your full name.'),
    },
    email: {
      el: form.elements.email,
      errorEl: document.getElementById('email-error'),
      validate: (value) => {
        if (!value.trim()) return 'Please enter your email address.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      },
    },
    phone: {
      el: form.elements.phone,
      errorEl: document.getElementById('phone-error'),
      validate: (value) => {
        if (!value.trim()) return 'Please enter your phone number.';
        if (!PHONE_REGEX.test(value.trim())) return 'Please enter a valid phone number.';
        return '';
      },
    },
    service: {
      el: form.elements.service,
      errorEl: document.getElementById('service-error'),
      validate: (value) => (value ? '' : 'Please select a service.'),
    },
    message: {
      el: form.elements.message,
      errorEl: document.getElementById('message-error'),
      validate: (value) => (value.trim() ? '' : 'Please tell us a little about what you need.'),
    },
  };

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.el.value);
    field.errorEl.textContent = message;
    field.el.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener('blur', () => validateField(key));
  });

  function validateAll() {
    return Object.keys(fields)
      .map((key) => validateField(key))
      .every(Boolean);
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'form-status' + (type ? ` ${type}` : '');
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('loading', isLoading);
  }

  function showSuccess() {
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  }

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach((key) => {
      fields[key].errorEl.textContent = '';
      fields[key].el.removeAttribute('aria-invalid');
    });
    setStatus('', '');
    successPanel.hidden = true;
    form.hidden = false;
  }

  if (resetLink) {
    resetLink.addEventListener('click', (event) => {
      event.preventDefault();
      resetForm();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('', '');

    // Honeypot: if this hidden field has a value, silently drop the submission.
    if (form.elements.website && form.elements.website.value) {
      return;
    }

    if (!validateAll()) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      company: form.elements.company.value.trim(),
      service: form.elements.service.value,
      message: form.elements.message.value.trim(),
    };

    setLoading(true);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccess();
      } else {
        setStatus(`Something went wrong on our end (error ${response.status}). Please try again or call us directly.`, 'error');
      }
    } catch (error) {
      setStatus('We could not reach the server. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  });
}

/* ==========================================================================
   Footer current year
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initSmoothScroll();
  initFadeInObserver();
  initTestimonialCarousel();
  initEnquiryForm();
  initFooterYear();
});
