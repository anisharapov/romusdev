(function () {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const langButtons = document.querySelectorAll('.lang-btn');
  const translations = window.translations || {};

  // ---------- THÈME ----------
  let currentTheme =
    localStorage.getItem('romus-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light');

  root.setAttribute('data-theme', currentTheme);

  function updateIcon() {
    if (!toggle) return;
    toggle.innerHTML = currentTheme === 'dark' ? '☀' : '☾';
    toggle.setAttribute(
      'aria-label',
      currentTheme === 'dark'
        ? 'Activer le mode clair'
        : 'Activer le mode sombre'
    );
  }

  updateIcon();

  toggle?.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    localStorage.setItem('romus-theme', currentTheme);
    updateIcon();
  });

  // ---------- LANGUES ----------
  function applyLanguage(lang) {
    if (!window.translations || !translations[lang]) return;

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key || !translations[lang][key]) return;

      if (el.tagName === 'TITLE') {
        el.textContent = translations[lang][key];
      } else if (
        el.tagName === 'META' &&
        el.getAttribute('name') === 'description'
      ) {
        el.setAttribute('content', translations[lang][key]);
      } else {
        el.textContent = translations[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key || !translations[lang][key]) return;

      el.setAttribute('placeholder', translations[lang][key]);
    });

    if (typeof langButtons !== 'undefined' && langButtons.length) {
      langButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
    }

    localStorage.setItem('romus-lang', lang);
  }

  const savedLang = localStorage.getItem('romus-lang');
  const browserLang = (navigator.language || 'fr').slice(0, 2).toLowerCase();

  const defaultLang =
    savedLang && ['fr', 'en', 'ru'].includes(savedLang)
      ? savedLang
      : ['fr', 'en', 'ru'].includes(browserLang)
        ? browserLang
        : 'fr';

  applyLanguage(defaultLang);

  if (typeof langButtons !== 'undefined' && langButtons.length) {
    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (!['fr', 'en', 'ru'].includes(lang)) return;
        applyLanguage(lang);
      });
    });
  }

  // ---------- ANIMATION REVEAL ----------
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ---------- CARROUSEL ----------
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let currentIndex = 0;
    let intervalId = null;

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (index === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Slide ' + (index + 1));
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
        restartCarousel();
      });
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function updateCarousel() {
      track.style.opacity = '0.35';

      requestAnimationFrame(() => {
        track.style.transform = 'translateX(-' + currentIndex * 100 + '%)';
        track.style.opacity = '1';
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      slides.forEach((slide, index) => {
        slide.setAttribute(
          'aria-hidden',
          index === currentIndex ? 'false' : 'true'
        );
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    }

    function startCarousel() {
      intervalId = setInterval(nextSlide, 3000);
    }

    function restartCarousel() {
      clearInterval(intervalId);
      startCarousel();
    }

    const carouselShell = document.querySelector('.carousel-shell');

    carouselShell?.addEventListener('mouseenter', () => {
      clearInterval(intervalId);
    });

    carouselShell?.addEventListener('mouseleave', () => {
      clearInterval(intervalId);
      startCarousel();
    });

    carouselShell?.addEventListener('focusin', () => {
      clearInterval(intervalId);
    });

    carouselShell?.addEventListener('focusout', () => {
      clearInterval(intervalId);
      startCarousel();
    });

    prevBtn?.addEventListener('click', () => {
      prevSlide();
      restartCarousel();
    });

    nextBtn?.addEventListener('click', () => {
      nextSlide();
      restartCarousel();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        restartCarousel();
      }

      if (e.key === 'ArrowRight') {
        nextSlide();
        restartCarousel();
      }
    });

    updateCarousel();
    startCarousel();
  }
})();

/* ========= CHEMINEE : fumee 3s quand on passe de dark vers light ========= */
const fireplaceCard = document.querySelector('.roman-fireplace-card');
const root = document.documentElement;
let previousTheme = root.getAttribute('data-theme') || 'light';

function syncFireplaceTheme() {
  const currentTheme = root.getAttribute('data-theme') || 'light';
  if (!fireplaceCard) return;

  if (previousTheme === 'dark' && currentTheme === 'light') {
    fireplaceCard.classList.remove('is-extinguishing');
    void fireplaceCard.offsetWidth; // reset animation
    fireplaceCard.classList.add('is-extinguishing');

    setTimeout(() => {
      fireplaceCard.classList.remove('is-extinguishing');
    }, 3000);
  }

  if (currentTheme === 'dark') {
    fireplaceCard.classList.remove('is-extinguishing');
  }

  previousTheme = currentTheme;
}

const observer = new MutationObserver(syncFireplaceTheme);
observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

syncFireplaceTheme();

/* ========= VIDEO AUTOPLAY ========= */
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector('[data-autoplay="full-visible"]');
  if (!video) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.9) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: [0, 0.9, 1]
    }
  );

  observer.observe(video);
});


/* ========= PAGE TRANSFER TO FORM ========= */
// document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
//   link.addEventListener('click', function (e) {
//     const href = this.getAttribute('href');
//     if (!href) return;

//     const target = document.querySelector(href);
//     if (!target) return;

//     e.preventDefault();
//     target.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start'
//     });

//     history.replaceState(null, '', href);
//   });
// });
