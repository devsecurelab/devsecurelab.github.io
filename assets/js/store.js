/**
 * DevSecure Lab - Storefront & Interactive Components
 * Handles hero slider, category filtering, sticky header, and mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================================
     1. Sticky Header Glass Effect & Mobile Menu
     ======================================================================== */
  const header = document.getElementById('siteHeader');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========================================================================
     2. Hero Sliding Image Showcase
     ======================================================================== */
  const sliderWrapper = document.getElementById('heroSlider');
  const slides = Array.from(document.querySelectorAll('#sliderViewport .slide'));
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_INTERVAL = 4500;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create dot indicators dynamically
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.slider-dot'));

  function goToSlide(newIndex) {
    if (newIndex === currentIndex) return;

    const prevIndex = currentIndex;
    currentIndex = (newIndex + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'prev');
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else if (idx === prevIndex) {
        slide.classList.add('prev');
      }
    });

    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  function startAutoPlay() {
    if (prefersReducedMotion) return;
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      startAutoPlay();
    });
  }

  // Pause on hover or touch
  if (sliderWrapper) {
    sliderWrapper.addEventListener('mouseenter', stopAutoPlay);
    sliderWrapper.addEventListener('mouseleave', startAutoPlay);
    sliderWrapper.addEventListener('touchstart', stopAutoPlay, { passive: true });
    sliderWrapper.addEventListener('touchend', startAutoPlay, { passive: true });

    // Keyboard arrow navigation
    sliderWrapper.setAttribute('tabindex', '0');
    sliderWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
        startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
        startAutoPlay();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    sliderWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    }, { passive: true });
  }

  startAutoPlay();

  /* ========================================================================
     3. Category Filter Strip (No Page Reload)
     ======================================================================== */
  const categoryChips = document.querySelectorAll('.category-chip');
  const productCards = document.querySelectorAll('.product-card');

  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const selectedCategory = chip.dataset.category;

      categoryChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      productCards.forEach(card => {
        const cardCategory = card.dataset.category;
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ========================================================================
     4. Newsletter Form Handler
     ======================================================================== */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterStatus = document.getElementById('newsletterStatus');

  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      if (emailInput && emailInput.value.trim()) {
        newsletterStatus.textContent = 'Checklist sent! Check your inbox shortly.';
        newsletterForm.reset();
      }
    });
  }
});
