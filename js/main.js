/* ============================================================
   General Malick Limited – main.js
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================
     NAVIGATION – sticky scroll effect + burger menu
  =========================================================== */
  const header    = document.getElementById('header');
  const navBurger = document.getElementById('nav-burger');
  const navList   = document.getElementById('nav-list');
  const navLinks  = document.querySelectorAll('.nav__link');

  // Active nav link highlighting based on scroll position
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.nav__link[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }

  // Scroll-triggered header background
  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightActiveNav();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger toggle
  if (navBurger && navList) {
    navBurger.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navBurger.classList.toggle('open', isOpen);
      navBurger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close menu on link click (only for same-page anchors)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navList) navList.classList.remove('open');
      if (navBurger) {
        navBurger.classList.remove('open');
        navBurger.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    });
  });

  /* ===========================================================
     SMOOTH SCROLL for all anchor links
  =========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 72;
      const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ===========================================================
     HERO COUNTER ANIMATION
  =========================================================== */
  function animateCounters() {
    document.querySelectorAll('.stat__number[data-target]').forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step     = 16;
      const increment = target / (duration / step);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current);
      }, step);
    });
  }

  // Trigger counters when hero stats enter viewport
  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }

  /* ===========================================================
     SCROLL-REVEAL ANIMATION
  =========================================================== */
  const revealTargets = [
    '.about__card',
    '.biz-card',
    '.value-item',
    '.contact__info-item',
    '.section__header',
    '.about__text',
    '.about__visual',
    '.service-card',
    '.page-about__content',
  ];

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const delay = idx * 60;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  });

  /* ===========================================================
     TESTIMONIALS CAROUSEL
  =========================================================== */
  const testimonials = document.querySelectorAll('.testimonial');
  const dots         = document.querySelectorAll('.dot');
  let   currentSlide = 0;
  let   autoplayTimer;

  if (testimonials.length > 0) {
    function showSlide(index) {
      testimonials.forEach((t, i) => t.classList.toggle('active', i === index));
      dots.forEach((d, i)         => d.classList.toggle('active', i === index));
      currentSlide = index;
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % testimonials.length);
    }

    function startAutoplay() {
      autoplayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAutoplay();
        showSlide(i);
        startAutoplay();
      });
    });

    startAutoplay();

    // Touch/swipe support for testimonials
    const slider = document.getElementById('testimonials-slider');
    if (slider) {
      let touchStartX = 0;
      slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      slider.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          stopAutoplay();
          showSlide(diff > 0
            ? (currentSlide + 1) % testimonials.length
            : (currentSlide - 1 + testimonials.length) % testimonials.length
          );
          startAutoplay();
        }
      }, { passive: true });
    }
  }

  /* ===========================================================
     CONTACT FORM – Formspree Integration
  =========================================================== */
  const form        = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const btn       = form.querySelector('[type="submit"]');
      const btnText   = btn.querySelector('.btn__text');
      const btnLoader = btn.querySelector('.btn__loader');

      btn.disabled     = true;
      btnText.hidden   = true;
      btnLoader.hidden = false;

      try {
        // Route business enquiries to sales@, general enquiries to info@
        const businessSelect = form.querySelector('#business');
        const endpoint = (businessSelect && businessSelect.value !== 'general')
          ? 'https://formspree.io/f/xqegvbyj'
          : 'https://formspree.io/f/xpqoello';

        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => { formSuccess.hidden = true; }, 6000);
        } else {
          alert('Something went wrong. Please try again or email us directly at info@gmltzs.com');
        }
      } catch {
        alert('Network error. Please check your connection or email us at info@gmltzs.com');
      } finally {
        btn.disabled     = false;
        btnText.hidden   = false;
        btnLoader.hidden = true;
      }
    });

    // Live validation feedback
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });
  }

  function validateField(field) {
    const errorEl = document.getElementById(`${field.id}-error`);
    let message = '';

    if (field.required && !field.value.trim()) {
      message = 'This field is required.';
    } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
      message = 'Please enter a valid email address.';
    }

    if (errorEl) errorEl.textContent = message;
    field.classList.toggle('error', !!message);
    return !message;
  }

  function validateForm() {
    const fields = form.querySelectorAll('[required]');
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ===========================================================
     FOOTER YEAR
  =========================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===========================================================
     FEATURED PROJECT – Lightbox, Slider, 3D Lazy Load
  =========================================================== */

  // --- Photo Gallery Lightbox ---
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('.lightbox__content img');
    const lbCurrent = document.getElementById('lb-current');
    const lbTotal = document.getElementById('lb-total');

    // Collect all gallery images
    const galleryItems = document.querySelectorAll('.project__gallery-main, .project__gallery-thumb');
    const galleryEl = document.querySelector('.project__gallery');
    let galleryImages = [];
    const allImagesAttr = galleryEl && galleryEl.dataset.allImages;
    if (allImagesAttr) {
      galleryImages = JSON.parse(allImagesAttr);
    } else {
      galleryItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) galleryImages.push(img.src);
      });
    }
    if (lbTotal) lbTotal.textContent = galleryImages.length;

    let lbIndex = 0;

    function openLightbox(index) {
      lbIndex = index;
      lbImg.src = galleryImages[lbIndex];
      if (lbCurrent) lbCurrent.textContent = lbIndex + 1;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function lbNav(dir) {
      lbIndex = (lbIndex + dir + galleryImages.length) % galleryImages.length;
      lbImg.src = galleryImages[lbIndex];
      if (lbCurrent) lbCurrent.textContent = lbIndex + 1;
    }

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10) || 0;
        openLightbox(idx);
      });
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', () => lbNav(-1));
    lightbox.querySelector('.lightbox__next').addEventListener('click', () => lbNav(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbNav(-1);
      if (e.key === 'ArrowRight') lbNav(1);
    });
  }

  // --- Video & 3D Slider ---
  const slider = document.getElementById('media-slider');
  if (slider) {
    const track = slider.querySelector('.project__slider-track');
    const slides = slider.querySelectorAll('.project__slide');
    const dots = slider.querySelectorAll('.project__slider-dot');
    const prevBtn = slider.querySelector('.project__slider-btn--prev');
    const nextBtn = slider.querySelector('.project__slider-btn--next');
    let currentSlide = 0;

    function goToSlide(i) {
      currentSlide = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.slide, 10)));
    });

    // Touch/swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goToSlide(currentSlide + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Video play – replace poster with video/iframe
    slider.querySelectorAll('.project__slide-play').forEach(playBtn => {
      playBtn.addEventListener('click', () => {
        const videoSrc = playBtn.dataset.videoSrc;
        if (!videoSrc) return;
        const inner = playBtn.closest('.project__slide-inner');
        if (playBtn.dataset.local === 'true') {
          const video = document.createElement('video');
          video.src = videoSrc;
          video.controls = true;
          video.autoplay = true;
          video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;';
          inner.appendChild(video);
        } else {
          const iframe = document.createElement('iframe');
          iframe.src = videoSrc + '?autoplay=1&rel=0';
          iframe.allow = 'autoplay; encrypted-media';
          iframe.allowFullscreen = true;
          iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
          inner.appendChild(iframe);
        }
        playBtn.classList.add('loaded');
      });
    });

    // 3D lazy load in slider
    slider.querySelectorAll('.project__slide-3d-placeholder').forEach(ph => {
      ph.addEventListener('click', () => {
        const iframe = ph.parentElement.querySelector('iframe');
        if (iframe && iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          ph.classList.add('loaded');
        }
      });
    });
  }

});
