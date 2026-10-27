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

  /* =========================================================
     MODULES DE PAGES
     Chacun ne s'exécute que si ses éléments sont présents.
     ========================================================= */

  /* ---------- Loader (accueil) : compteur + barre + sortie ---------- */
  function initLoader() {
    var loader = document.querySelector('.loader');
    if (!loader) return;
    var counterTxt = document.querySelector('.counter-txt');
    var progressBar = document.querySelector('.progress-bar');
    var progressBarWrapper = document.querySelector('.progress-bar-wrapper');
    var logo = document.querySelector('.logo_loader');
    var textLeft = document.querySelector('.text-loader-left');
    var textRight = document.querySelector('.text-loader-right');
    var LOGO_DELAY = 200, TEXT_DELAY = 500, FADE_DURATION = 700, COUNTER_DURATION = 2000, HIDE_DELAY = 3000;

    [logo, textLeft, textRight].forEach(function (el) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = el === textLeft ? 'translateX(20px)' : el === textRight ? 'translateX(-20px)' : 'scale(0.92)';
      el.style.transition = 'none';
    });
    if (counterTxt) counterTxt.textContent = '0';
    if (progressBar) progressBar.style.width = '0px';

    setTimeout(function () {
      if (!logo) return;
      logo.style.transition = 'opacity ' + FADE_DURATION + 'ms ease, transform ' + FADE_DURATION + 'ms ease';
      logo.style.opacity = '1';
      logo.style.transform = 'scale(1)';
    }, LOGO_DELAY);

    setTimeout(function () {
      [textLeft, textRight].forEach(function (el) {
        if (!el) return;
        el.style.transition = 'opacity ' + FADE_DURATION + 'ms ease, transform ' + FADE_DURATION + 'ms ease';
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      });
    }, TEXT_DELAY);

    var startTime = performance.now();
    var totalWidth = progressBarWrapper ? progressBarWrapper.offsetWidth : 200;
    (function animate(now) {
      var progress = Math.min((now - startTime) / COUNTER_DURATION, 1);
      var eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      if (counterTxt) counterTxt.textContent = Math.round(eased * 100);
      if (progressBar) progressBar.style.width = (eased * totalWidth) + 'px';
      if (progress < 1) requestAnimationFrame(animate);
    })(startTime);

    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      loader.classList.add('is-hidden');
      loader.addEventListener('transitionend', function () {
        document.body.style.overflow = '';
        loader.style.display = 'none';
      }, { once: true });
    }, HIDE_DELAY);
  }

  /* ---------- Menu plein écran ---------- */
  function initFullscreenMenu() {
    var openMenuBtn = document.getElementById('open-menu');
    var menu = document.querySelector('.menu-fullscreen');
    var closeCta = document.querySelector('.close-cta');
    if (!openMenuBtn || !menu || !closeCta) return;
    var menuPreoc = document.querySelector('.sub-menu-fullscreen .sub-link-list-menu-fullscreen-preoccupations');
    var menuSol = document.querySelector('.sub-menu-fullscreen .sub-link-list-menu-fullscreen-solutions');
    var imageBase = document.querySelector('.image-base');
    var globalContainer = document.querySelector('.flex-top-menu');
    var allNavLinks = document.querySelectorAll('.item-link-menu-fullscreen');
    var isMobile = function () { return window.innerWidth <= 991; };

    function resetMenus() {
      if (menuPreoc) menuPreoc.classList.remove('is-active');
      if (menuSol) menuSol.classList.remove('is-active');
      if (imageBase) imageBase.classList.remove('is-hidden');
    }
    function showMenu(submenu) {
      if (menuPreoc) menuPreoc.classList.remove('is-active');
      if (menuSol) menuSol.classList.remove('is-active');
      if (imageBase) imageBase.classList.add('is-hidden');
      if (submenu) submenu.classList.add('is-active');
    }
    function resetLinks() { allNavLinks.forEach(function (l) { l.classList.remove('is-hovered'); }); }

    function openMenu(e) {
      e.preventDefault();
      menu.classList.add('is-visible');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      });
      document.body.classList.add('menu-open');
      if (window.lenis) window.lenis.stop();
    }
    function closeMenu() {
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      if (window.lenis) window.lenis.start();
      menu.addEventListener('transitionend', function handler() {
        menu.classList.remove('is-visible');
        menu.removeEventListener('transitionend', handler);
      });
      resetMenus();
      resetLinks();
    }
    openMenuBtn.addEventListener('click', openMenu);
    closeCta.addEventListener('click', closeMenu);

    allNavLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        if (isMobile()) return;
        resetLinks();
        link.classList.add('is-hovered');
        if (link.id === 'link-preoc') showMenu(menuPreoc);
        else if (link.id === 'link-sol') showMenu(menuSol);
        else resetMenus();
      });
    });
    if (globalContainer) {
      globalContainer.addEventListener('mouseleave', function () {
        if (isMobile()) return;
        resetMenus();
        resetLinks();
      });
    }

    /* Lien "Contact" : ferme le menu puis descend au footer */
    var contactLink = document.querySelector('#contact-menu-full');
    if (contactLink) {
      contactLink.addEventListener('click', function () {
        closeCta.click();
        setTimeout(function () {
          var target = document.querySelector('#footer-anchor');
          if (!target) return;
          if (window.lenis) window.lenis.scrollTo(target);
          else target.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      });
    }
  }

  /* ---------- Sliders Swiper avec autoplay (accueil, solutions, préoccupations) ----------
     Fusion des 3 embeds identiques. Seul le décalage initial change :
     0 sur les pages préoccupations, 16px ailleurs. */
  function initAutoplaySliders() {
    if (!window.Swiper) return;
    var containers = document.querySelectorAll('.swiper:not(.doctors-cms)');
    if (!containers.length) return;
    var offsetBefore = location.pathname.indexOf('/preoccupations-cat/') === 0 ? 0 : 16;

    containers.forEach(function (container) {
      var swiper = new window.Swiper(container, {
        loop: true,
        slidesPerView: 'auto',
        spaceBetween: 16,
        slidesOffsetBefore: offsetBefore,
        slidesOffsetAfter: 0,
        slidesPerGroup: 1,
        speed: 600,
        autoplay: { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true },
        navigation: { nextEl: '.arrow-right', prevEl: '.arrow-left' },
        on: {
          reachEnd: function () {
            var self = this;
            setTimeout(function () { self.slideTo(0, 600); }, 2000);
          }
        }
      });
      swiper.autoplay.stop();

      /* Autoplay 1s après que le slider soit visible à 90 % */
      var autoplayStarted = false;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.9 && !autoplayStarted) {
            autoplayStarted = true;
            setTimeout(function () { swiper.autoplay.start(); }, 1000);
            observer.disconnect();
          }
        });
      }, { threshold: 0.9 });
      observer.observe(container);

      /* Pause au survol de l'overlay de slide */
      container.querySelectorAll('.hover-slider-item').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          if (swiper.autoplay.running) swiper.autoplay.stop();
          this.style.opacity = '1';
        });
        el.addEventListener('mouseleave', function () {
          if (autoplayStarted && !swiper.autoplay.running) swiper.autoplay.start();
          this.style.opacity = '0';
        });
      });
    });
  }

  /* ---------- Slider en fondu (pages solution, section 5) ---------- */
  function initSingleSolutionSlider() {
    var section = document.querySelector('.section-5-single-solution');
    if (!section) return;
    var items = section.querySelectorAll('.slider-item-single-solution');
    if (!items.length) return;
    var leftArrow = section.querySelector('.arrow-left-single-solution');
    var rightArrow = section.querySelector('.arrow-right-single-solution');
    var AUTOPLAY_DELAY = 4000;
    var currentIndex = 0;
    var timer = null;

    items.forEach(function (item, i) {
      item.style.opacity = i === 0 ? '1' : '0';
      item.style.pointerEvents = i === 0 ? 'auto' : 'none';
      item.style.zIndex = i === 0 ? '1' : '0';
      item.style.transition = 'opacity 0.6s ease';
    });
    function goTo(index) {
      var prev = currentIndex;
      currentIndex = (index + items.length) % items.length;
      items[prev].style.opacity = '0';
      items[prev].style.pointerEvents = 'none';
      items[prev].style.zIndex = '0';
      items[currentIndex].style.opacity = '1';
      items[currentIndex].style.pointerEvents = 'auto';
      items[currentIndex].style.zIndex = '1';
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(currentIndex + 1); }, AUTOPLAY_DELAY);
    }
    if (leftArrow) leftArrow.addEventListener('click', function () { goTo(currentIndex - 1); restart(); });
    if (rightArrow) rightArrow.addEventListener('click', function () { goTo(currentIndex + 1); restart(); });
    restart();
  }

  /* ---------- Accueil : image qui change au survol des préoccupations ---------- */
  function initPreocHoverImages() {
    var links = document.querySelectorAll('.collection-titres .w-dyn-item');
    var imageItems = document.querySelectorAll('.collection-images .w-dyn-item');
    if (!links.length || !imageItems.length) return;
    var currentIndex = 0;
    imageItems.forEach(function (item, i) { item.style.opacity = i === 0 ? '1' : '0'; });
    links.forEach(function (item, index) {
      var link = item.querySelector('.item-list-link');
      if (!link) return;
      link.addEventListener('mouseenter', function () {
        if (index === currentIndex) return;
        imageItems.forEach(function (img, i) { img.style.opacity = i === index ? '1' : '0'; });
        currentIndex = index;
      });
    });
  }

  /* ---------- Accueil : flottement + aimantation des images (section 5) ---------- */
  function initMagneticImages() {
    var section = document.querySelector('.section_5_home');
    var imgEls = ['.img-1-sec-5', '.img-2-sec-5', '.img-3-sec-5']
      .map(function (s) { return document.querySelector(s); })
      .filter(Boolean);
    if (!section || !imgEls.length || !window.matchMedia('(hover: hover)').matches) return;
    var config = [
      { parallax: 32, magnetRadius: 200, magnetStrength: 0.55 },
      { parallax: 24, magnetRadius: 220, magnetStrength: 0.6 },
      { parallax: 38, magnetRadius: 180, magnetStrength: 0.5 }
    ];
    var state = imgEls.map(function () { return { tx: 0, ty: 0 }; });
    imgEls.forEach(function (el) { el.style.willChange = 'transform'; });
    var mouseX = 0, mouseY = 0, running = false, visible = false;
    var rect = section.getBoundingClientRect();
    var updateRect = function () { rect = section.getBoundingClientRect(); };
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    function animate() {
      if (!visible) { running = false; return; }
      var relX = (mouseX - rect.left) / (rect.width || window.innerWidth) - 0.5;
      var relY = (mouseY - rect.top) / (rect.height || window.innerHeight) - 0.5;
      imgEls.forEach(function (el, i) {
        var cfg = config[i], s = state[i];
        var r = el.getBoundingClientRect();
        var dx = mouseX - (r.left + r.width / 2);
        var dy = mouseY - (r.top + r.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var mx = 0, my = 0;
        if (dist < cfg.magnetRadius) {
          var force = (1 - dist / cfg.magnetRadius) * cfg.magnetStrength;
          mx = dx * force; my = dy * force;
        }
        var speed = dist < cfg.magnetRadius ? 0.14 : 0.08;
        s.tx = lerp(s.tx, relX * cfg.parallax + mx, speed);
        s.ty = lerp(s.ty, relY * cfg.parallax + my, speed);
        el.style.transform = 'translate(' + s.tx.toFixed(2) + 'px, ' + s.ty.toFixed(2) + 'px)';
      });
      requestAnimationFrame(animate);
    }
    /* La boucle ne tourne que lorsque la section est visible (économise le CPU) */
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; updateRect(); requestAnimationFrame(animate); }
    }).observe(section);
  }

  /* ---------- Slider "Notre approche" (accueil, à propos) ---------- */
  function initApproachSlider() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.slider-approach-item'));
    var leftArrow = document.querySelector('.arrow-left-slider-approach');
    var rightArrow = document.querySelector('.arrow-right-slider-approach');
    if (!items.length || !leftArrow || !rightArrow) return;
    var total = items.length;
    var currentIndex = total - 1;
    var isAnimating = false;
    var timer = null;
    var DURATION = 1200, DELAY_DESSUS = 250, TEXT_OFFSET = '40px', AUTOPLAY_DELAY = 5000;
    var EASING = 'cubic-bezier(0.77, 0, 0.175, 1)';
    var EASING_TEXT = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    var style = document.createElement('style');
    style.textContent =
      '.slider-approach-item{z-index:0}' +
      '.slider-approach-item.sa-visible{z-index:2}' +
      '.slider-approach-item.sa-above{z-index:3}' +
      '.img-dessus-approach{overflow:hidden!important}' +
      '.background-slider-approach img,.img-dessus-approach img,.infos-text-slider-approach{will-change:transform,opacity}';
    document.head.appendChild(style);

    function els(item) {
      return {
        bg: item.querySelector('.background-slider-approach img'),
        dessus: item.querySelector('.img-dessus-approach img'),
        text: item.querySelector('.infos-text-slider-approach')
      };
    }
    var off = function (dir) { return (dir === 'right' ? '' : '-') + window.innerWidth + 'px'; };
    var offDessus = function (dir) { return dir === 'right' ? '100%' : '-100%'; };
    function setInstant(el, tx, op) {
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = 'translateX(' + tx + ')';
      if (op != null) el.style.opacity = op;
      el.getBoundingClientRect();
    }
    function animateTo(el, tx, delay, op, duration, easing) {
      if (!el) return;
      duration = duration || DURATION; easing = easing || EASING; delay = delay || 0;
      var t = 'transform ' + duration + 'ms ' + easing + ' ' + delay + 'ms';
      if (op != null) t += ', opacity ' + duration + 'ms ' + easing + ' ' + delay + 'ms';
      el.style.transition = t;
      el.style.transform = 'translateX(' + tx + ')';
      if (op != null) el.style.opacity = op;
    }

    items.forEach(function (item, i) {
      var e = els(item);
      if (i === currentIndex) {
        item.classList.add('sa-visible');
        setInstant(e.bg, '0px'); setInstant(e.dessus, '0%'); setInstant(e.text, '0px', 1);
      } else {
        setInstant(e.bg, off('right')); setInstant(e.dessus, offDessus('right')); setInstant(e.text, '0px', 0);
      }
    });

    function goToSlide(nextIndex, direction) {
      if (isAnimating || nextIndex === currentIndex) return;
      isAnimating = true;
      var current = items[currentIndex], next = items[nextIndex];
      var cur = els(current), nxt = els(next);
      var right = direction === 'right';
      current.classList.remove('sa-above');
      current.classList.add('sa-visible');
      next.classList.add('sa-above');
      setInstant(nxt.bg, off(right ? 'right' : 'left'));
      setInstant(nxt.dessus, offDessus(right ? 'right' : 'left'));
      setInstant(nxt.text, right ? TEXT_OFFSET : '-' + TEXT_OFFSET, 0);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          animateTo(cur.bg, off(right ? 'left' : 'right'), 0);
          animateTo(nxt.bg, '0px', 0);
          animateTo(cur.dessus, offDessus(right ? 'left' : 'right'), DELAY_DESSUS);
          animateTo(nxt.dessus, '0%', DELAY_DESSUS);
          animateTo(cur.text, right ? '-' + TEXT_OFFSET : TEXT_OFFSET, DELAY_DESSUS, 0, DURATION * 0.8, EASING_TEXT);
          animateTo(nxt.text, '0px', DELAY_DESSUS, 1, DURATION * 0.9, EASING_TEXT);
        });
      });
      setTimeout(function () {
        current.classList.remove('sa-visible', 'sa-above');
        next.classList.remove('sa-above');
        next.classList.add('sa-visible');
        items.forEach(function (item, i) {
          if (i === nextIndex) return;
          var e = els(item);
          item.classList.remove('sa-visible', 'sa-above');
          setInstant(e.bg, off('right')); setInstant(e.dessus, offDessus('right')); setInstant(e.text, '0px', 0);
        });
        currentIndex = nextIndex;
        isAnimating = false;
      }, DURATION + DELAY_DESSUS + 60);
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { goToSlide((currentIndex + 1) % total, 'right'); }, AUTOPLAY_DELAY);
    }
    rightArrow.addEventListener('click', function () { goToSlide((currentIndex + 1) % total, 'right'); restart(); });
    leftArrow.addEventListener('click', function () { goToSlide((currentIndex - 1 + total) % total, 'left'); restart(); });
    restart();
  }

  /* ---------- À propos : image fixe à la place de la vidéo sur Safari ---------- */
  function initSafariIllustration() {
    var video = document.querySelector('.illustration_embed video');
    if (!video) return;
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) return;
    var img = document.createElement('img');
    img.src = 'https://cdn.prod.website-files.com/69c6997c1663b4f72ba08e1d/69cd5250c902b1d19780b9e0_poster.png';
    img.alt = 'Illustration Marsea';
    img.style.width = '100%';
    video.parentNode.replaceChild(img, video);
  }

  /* ---------- À propos : défilement automatique vers la section 2 après 3 s ---------- */
  function initAboutAutoScroll() {
    var target = document.querySelector('#sec-2-about');
    if (!target) return;
    setTimeout(function () {
      if (window.scrollY > 50) return; /* l'utilisateur a déjà scrollé : on ne force pas */
      var top = target.getBoundingClientRect().top + window.scrollY;
      if (window.lenis) {
        window.lenis.scrollTo(top, { duration: 1.5, easing: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; } });
      } else {
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }, 3000);
  }

  /* ---------- À propos : révélation du texte mot à mot ---------- */
  function initTextReveal() {
    var targets = ['.h1-about', '.text-about']
      .map(function (s) { return document.querySelector(s); })
      .filter(Boolean);
    if (!targets.length) return;
    targets.forEach(function (el) {
      var text = el.textContent;
      el.innerHTML = '';
      text.split(/(\s+)/).forEach(function (part) {
        if (/\s+/.test(part)) {
          el.appendChild(document.createTextNode(part));
        } else if (part.length) {
          var span = document.createElement('span');
          span.textContent = part;
          span.style.opacity = '0.2';
          span.style.transition = 'opacity 0.4s ease';
          el.appendChild(span);
        }
      });
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('span').forEach(function (span, i) {
          setTimeout(function () { span.style.opacity = '1'; }, i * 90);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Tarifs : navigation latérale active au scroll ---------- */
  function initTarifsNav() {
    var map = [
      ['#injections-anchor', 'injections'],
      ['#esthetique-anchor', 'esthetique'],
      ['#lasers-anchor', 'lasers'],
      ['#epilation-anchor', 'epilation'],
      ['#cheveux-anchor', 'cheveux'],
      ['#greffe-anchor', 'greffe'],
      ['#soins-anchor', 'soins']
    ];
    if (!document.querySelector(map[0][0])) return;
    var current = null;

    document.querySelectorAll('.arrow-tarif-wrapper').forEach(function (arrow) {
      arrow.style.transition = 'width 0.4s ease, margin-right 0.4s ease';
      arrow.style.overflow = 'hidden';
      arrow.style.width = '0px';
      arrow.style.marginRight = '0px';
    });
    function setState(sel, on) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.style.fontWeight = on ? '600' : '400';
      var arrow = el.querySelector('.arrow-tarif-wrapper');
      if (arrow) {
        arrow.style.width = on ? '20px' : '0px';
        arrow.style.marginRight = on ? '10px' : '0px';
      }
    }
    map.forEach(function (pair) {
      var el = document.querySelector(pair[0]);
      if (!el) return;
      el.addEventListener('mouseenter', function () { if (pair[0] !== current) setState(pair[0], true); });
      el.addEventListener('mouseleave', function () { if (pair[0] !== current) setState(pair[0], false); });
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        map.forEach(function (pair) { setState(pair[0], false); });
        var match = map.filter(function (pair) { return pair[1] === entry.target.id; })[0];
        if (match) { current = match[0]; setState(match[0], true); }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    map.forEach(function (pair) {
      var section = document.getElementById(pair[1]);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Catégorie préoccupations : révélation des cartes ligne par ligne ---------- */
  function initPreocCategoryReveal() {
    var items = document.querySelectorAll('.link-preoc-cat-item');
    if (!items.length) return;
    var rows = new Map();
    items.forEach(function (item) {
      var key = Math.round((item.getBoundingClientRect().top + window.scrollY) / 100) * 100;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push(item);
    });
    rows.forEach(function (rowItems) {
      rowItems
        .sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; })
        .forEach(function (item, idx) { item.dataset.staggerIndex = idx; });
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var item = entry.target;
        setTimeout(function () { item.classList.add('is-revealed'); }, (parseInt(item.dataset.staggerIndex, 10) || 0) * 200);
        observer.unobserve(item);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- Lancement ---------- */
  function safe(fn) {
    try { fn(); } catch (e) { if (window.console) console.warn('[Marsea] ' + (fn.name || 'module') + ' :', e); }
  }

  onReady(function () {
    [initLenis, initParallax, initMegaMenu, initHeaderStates, initAccordion,
     initLoader, initFullscreenMenu, initPreocHoverImages, initMagneticImages,
     initSafariIllustration, initAboutAutoScroll, initTextReveal, initTarifsNav]
      .forEach(safe);

    /* Modules qui attendaient le chargement complet / Webflow dans les embeds d'origine */
    var afterLoad = function () {
      setTimeout(function () {
        [initAutoplaySliders, initApproachSlider].forEach(safe);
      }, 500);
      safe(initSingleSolutionSlider);
      setTimeout(function () { safe(initPreocCategoryReveal); }, 100);
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad);
  });
})();
