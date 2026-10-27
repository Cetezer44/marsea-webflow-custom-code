/* =========================================================
   MARSEA — Scripts globaux (chargés en defer en fin de page)
   Dépendances : GSAP + ScrollTrigger (fournis par Webflow),
   Lenis, Swiper (chargés avant ce fichier, en defer).
   simpleParallax est chargé à la demande.
   ========================================================= */
(function () {
  'use strict';

  var SIMPLE_PARALLAX_URL = 'https://cdn.jsdelivr.net/npm/simple-parallax-js@5.6.2/dist/simpleParallax.min.js';

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  function initLenis() {
    if (!window.Lenis) return;
    var lenis = new window.Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 2
    });
    window.lenis = lenis;

    /* Intégration recommandée avec GSAP / ScrollTrigger (fournis par Webflow) */
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(performance.now());
    }
  }

  /* ---------- Parallax via [data-parallax] (simpleParallax chargé à la demande) ---------- */
  function initParallax() {
    var containers = document.querySelectorAll('[data-parallax]');
    if (!containers.length) return;
    var start = function () {
      containers.forEach(function (container) {
        var img = container.querySelector('img');
        if (!img) return;
        container.style.overflow = 'hidden';
        new window.simpleParallax(img, {
          scale: parseFloat(container.getAttribute('data-parallax-scale')) || 1.2,
          delay: parseFloat(container.getAttribute('data-parallax-delay')) || 0.4,
          orientation: container.getAttribute('data-parallax-orientation') || 'down',
          overflow: true
        });
      });
    };
    if (window.simpleParallax) start();
    else loadScript(SIMPLE_PARALLAX_URL).then(start).catch(function () {});
  }

  /* ---------- Mega menu (Préoccupations / Solutions) ---------- */
  function initMegaMenu() {
    var ecoleTrigger = document.querySelector('.ecole-dd-mega-menu');
    var ecoleMenu = document.querySelector('.mega-menu-ecole-container');
    var programmeTrigger = document.querySelector('.programme-dd-mega-menu');
    var programmeMenu = document.querySelector('.mega-menu-programme-container');
    if (!ecoleTrigger || !ecoleMenu || !programmeTrigger || !programmeMenu) return;

    var state = { ecole: false, programme: false };
    ecoleMenu.style.transition = 'none';
    programmeMenu.style.transition = 'none';

    function open(menu, key) {
      if (state[key]) return;
      state[key] = true;
      menu.style.display = 'flex';
      menu.classList.add('active');
    }
    function close(menu, key) {
      state[key] = false;
      menu.classList.remove('active');
      menu.style.display = 'none';
    }
    function bindClose(selectors, menu, key) {
      selectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          el.addEventListener('mouseenter', function () { close(menu, key); });
        });
      });
    }

    ecoleTrigger.addEventListener('mouseenter', function () { open(ecoleMenu, 'ecole'); });
    bindClose(['.close-mega-menu', '.nav_brand', '.programme-dd-mega-menu', '.nav_menu_link', '.flex_cta_header'], ecoleMenu, 'ecole');

    programmeTrigger.addEventListener('mouseenter', function () { open(programmeMenu, 'programme'); });
    bindClose(['.close-mega-menu', '.nav_brand', '.ecole-dd-mega-menu', '.nav_menu_link', '.flex_cta_header'], programmeMenu, 'programme');
  }

  /* ---------- Header : couleurs au hover / mega menu ouvert ---------- */
  function initHeaderStates() {
    var TRANSITION_MS = 200;
    var canHover = window.matchMedia('(hover: hover)').matches;
    var ecoleMega = document.querySelector('.mega-menu-ecole-container');
    var programmeMega = document.querySelector('.mega-menu-programme-container');
    var header = document.querySelector('.header');
    if (!ecoleMega || !programmeMega || !header) return;

    var closeTimer = null;
    var hoverTimer = null;

    function updateMenuState() {
      var isOpen = ecoleMega.classList.contains('active') || programmeMega.classList.contains('active');
      if (isOpen) {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        header.classList.add('mega-menu-open');
      } else {
        closeTimer = setTimeout(function () {
          header.classList.remove('mega-menu-open');
          closeTimer = null;
        }, TRANSITION_MS);
      }
    }

    var observer = new MutationObserver(updateMenuState);
    var config = { attributes: true, attributeFilter: ['class'] };
    observer.observe(ecoleMega, config);
    observer.observe(programmeMega, config);

    if (canHover) {
      header.addEventListener('mouseenter', function () {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
        header.classList.add('header-hovered');
      });
      header.addEventListener('mouseleave', function () {
        hoverTimer = setTimeout(function () {
          header.classList.remove('header-hovered');
          hoverTimer = null;
        }, TRANSITION_MS);
      });
    }
  }

  /* ---------- Accordéon ---------- */
  function initAccordion() {
    document.querySelectorAll('.flex-title-item-accordeon').forEach(function (title) {
      title.addEventListener('click', function () {
        var parentItem = this.closest('.item-accordeon-single');
        var textPres = parentItem ? parentItem.querySelector('.text-pres-accordeon') : null;
        var isOpen = this.classList.contains('is-open');
        var parentList = this.closest('.list-accordeon-single');
        if (parentList) {
          parentList.querySelectorAll('.flex-title-item-accordeon.is-open').forEach(function (openTitle) {
            openTitle.classList.remove('is-open');
            var openItem = openTitle.closest('.item-accordeon-single');
            var openText = openItem ? openItem.querySelector('.text-pres-accordeon') : null;
            if (openText) openText.classList.remove('is-open');
          });
        }
        if (!isOpen && textPres) {
          this.classList.add('is-open');
          textPres.classList.add('is-open');
        }
      });
    });
  }

  onReady(function () {
    initLenis();
    initParallax();
    initMegaMenu();
    initHeaderStates();
    initAccordion();
  });
})();
