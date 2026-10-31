/* =========================================================
   MARSEA — Page L'équipe
   Slider médecins (Swiper, boucle infinie), modal médecin,
   apparitions en fondu (GSAP + ScrollTrigger fournis par Webflow).
   Utilise window.lenis s'il existe (défini dans global.js).
   ========================================================= */
(function () {
  'use strict';

  var SLIDE_SPEED = 750;

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function isDesktop() { return window.matchMedia('(min-width: 992px)').matches; }

  /* Hauteur du menu visible : la modal responsive démarre juste en dessous */
  function setNavH() {
    var n = document.querySelector('.nav_fixed');
    var h = n ? Math.max(0, Math.round(n.getBoundingClientRect().bottom)) : 0;
    document.documentElement.style.setProperty('--team-nav-h', h + 'px');
  }

  onReady(function () {
    var section = document.querySelector('.team-section');
    if (!section) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    var hasGsap = !!gsap;
    if (!hasGsap) document.documentElement.classList.remove('team-js');
    var canHover = window.matchMedia('(hover: hover)').matches;
    var mouse = { x: -1, y: -1 };
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    setNavH();
    window.addEventListener('resize', setNavH);

    /* ---------- 1. Slider médecins (Swiper, boucle infinie) ---------- */
    var swiper = null;
    var wrap = section.querySelector('.doctors-cms');
    var list = wrap ? wrap.querySelector('.doctors-list') : null;
    var slides = list ? list.querySelectorAll('.doctor-slide') : [];
    var realCount = slides.length;
    /* La boucle infinie a besoin d'assez de slides (3 visibles + marge de chaque côté).
       Avec peu de médecins, on duplique la liste complète (même ordre) jusqu'à en avoir assez. */
    var MIN_LOOP_SLIDES = 8;
    if (list && realCount > 1 && realCount < MIN_LOOP_SLIDES) {
      var originals = Array.prototype.slice.call(slides);
      while (list.querySelectorAll('.doctor-slide').length < MIN_LOOP_SLIDES) {
        originals.forEach(function (s) {
          var c = s.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.querySelectorAll('[tabindex], a, button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
          list.appendChild(c);
        });
      }
      slides = list.querySelectorAll('.doctor-slide');
    }
    if (wrap && list && slides.length && window.Swiper) {
      wrap.classList.add('swiper');
      list.classList.add('swiper-wrapper');
      slides.forEach(function (s) { s.classList.add('swiper-slide'); });
      swiper = new window.Swiper(wrap, {
        loop: slides.length > 1,
        centeredSlides: true,
        slidesPerView: 1.35,
        speed: SLIDE_SPEED,
        grabCursor: true,
        keyboard: { enabled: true },
        navigation: {
          prevEl: section.querySelector('.team-nav-prev'),
          nextEl: section.querySelector('.team-nav-next')
        },
        breakpoints: { 768: { slidesPerView: 3 } }
      });
    }
    if (realCount < 2) {
      var nav = section.querySelector('.team-nav');
      if (nav) nav.style.display = 'none';
    }

    /* ---------- 2. Apparitions en fondu ---------- */
    if (hasGsap) {
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

      /* Slider : les photos visibles apparaissent l'une après l'autre, de gauche à droite */
      var photos = Array.prototype.slice.call(section.querySelectorAll('.doctor-photo'));
      var visible = photos
        .filter(function (p) { var r = p.getBoundingClientRect(); return r.right > 0 && r.left < window.innerWidth; })
        .sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
      var hidden = photos.filter(function (p) { return visible.indexOf(p) === -1; });
      /* Chaque photo apparaît avec le nom placé dessous */
      var withName = function (p) {
        var n = p.parentNode.querySelector('.doctor-name');
        return n ? [p, n] : [p];
      };
      gsap.set([].concat.apply([], hidden.map(withName)), { opacity: 1 });
      var doctorsTl = gsap.timeline({ paused: !!(ScrollTrigger && wrap) });
      visible.forEach(function (p, i) {
        doctorsTl.to(withName(p), { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.2 + i * 0.22);
      });
      if (ScrollTrigger && wrap) {
        ScrollTrigger.create({ trigger: wrap, start: 'top 90%', once: true, onEnter: function () { doctorsTl.play(); } });
      }

      /* Employés + fondatrice : léger fondu au scroll */
      section.querySelectorAll('[data-fade-in]').forEach(function (el) {
        var conf = { opacity: 1, duration: 1.2, ease: 'power2.out' };
        if (ScrollTrigger) conf.scrollTrigger = { trigger: el, start: 'top 88%', once: true };
        gsap.to(el, conf);
      });
      if (ScrollTrigger) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }

    /* ---------- 3. Modal médecin ---------- */
    var modal = document.querySelector('[data-doctor-modal]');
    if (!modal) return;
    document.body.appendChild(modal);
    modal.setAttribute('data-lenis-prevent', '');
    var q = function (k) { return modal.querySelector('[data-modal="' + k + '"]'); };
    var mName = q('name'), mSpec = q('spec'), mBio = q('bio'), mFav = q('fav'), mPhoto = q('photo');
    var left = modal.querySelector('.doctor-modal-left');
    var right = modal.querySelector('.doctor-modal-right');
    var closeBtn = modal.querySelector('.doctor-modal-close');
    var isOpen = false, busy = false, tl = null, sourceCard = null, lastFocus = null;

    function field(card, k) { return card.querySelector('[data-field="' + k + '"]'); }
    function scaleOf(img) { var s = getComputedStyle(img).scale; return (!s || s === 'none') ? '1' : s; }

    /* Bloque le scroll de la page pendant le centrage et quand la modal est ouverte */
    function blockScroll(e) {
      if (!isOpen && !busy) return;
      if (!e.target.closest('.doctor-modal')) e.preventDefault();
      e.stopImmediatePropagation();
    }
    window.addEventListener('wheel', blockScroll, { capture: true, passive: false });
    window.addEventListener('touchmove', blockScroll, { capture: true, passive: false });

    /* Scroll piloté vers une position (Lenis si présent, sinon GSAP) */
    function scrollToY(target) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target));
      var start = window.scrollY;
      if (Math.abs(target - start) < 2) return Promise.resolve();
      var dur = Math.min(1, 0.45 + Math.abs(target - start) / 2500);
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      return new Promise(function (resolve) {
        var done = false;
        var finish = function () { if (done) return; done = true; window.scrollTo(0, target); setTimeout(resolve, 40); };
        if (window.lenis && typeof window.lenis.scrollTo === 'function') {
          window.lenis.scrollTo(target, { duration: dur, easing: ease, force: true, lock: true, onComplete: finish });
          setTimeout(finish, dur * 1000 + 300);
        } else if (hasGsap) {
          var proxy = { y: start };
          gsap.to(proxy, { y: target, duration: dur, ease: 'power3.inOut',
            onUpdate: function () { window.scrollTo(0, proxy.y); },
            onComplete: finish });
        } else {
          finish();
        }
      });
    }

    /* Centre le médecin dans le slider, puis sa photo au centre exact de la fenêtre */
    function centerOn(card) {
      var slide = card.closest('.swiper-slide');
      var needSlide = swiper && slide && !slide.classList.contains('swiper-slide-active');
      if (needSlide) swiper.slideToLoop(parseInt(slide.getAttribute('data-swiper-slide-index'), 10) || 0);
      return (needSlide ? wait(SLIDE_SPEED + 50) : Promise.resolve()).then(function () {
        var active = swiper ? list.querySelector('.swiper-slide-active [data-doctor-card]') : null;
        var photo = (active || card).querySelector('.doctor-photo');
        var r = photo.getBoundingClientRect();
        return scrollToY(window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
      });
    }

    function fill(card) {
      var nameEl = field(card, 'name'), specEl = field(card, 'spec'), favEl = field(card, 'fav'), bioEl = field(card, 'bio');
      var img = card.querySelector('.doctor-img');
      mName.textContent = nameEl ? nameEl.textContent.trim() : '';
      mSpec.textContent = specEl ? specEl.textContent.trim() : '';
      mBio.innerHTML = bioEl ? bioEl.innerHTML : '';
      var fav = favEl ? favEl.textContent.trim() : '';
      mFav.textContent = fav;
      modal.classList.toggle('no-fav', !fav);
      mPhoto.innerHTML = '';
      if (img && isDesktop()) {
        var clone = document.createElement('img');
        clone.src = img.currentSrc || img.src;
        clone.alt = img.alt || mName.textContent;
        clone.style.scale = scaleOf(img); /* même zoom que la photo source : aucun saut */
        mPhoto.appendChild(clone);
      }
    }

    function show(card) {
      fill(card);
      var desktop = isDesktop();
      if (desktop) {
        /* La photo de la modal se pose exactement sur celle du slider : même place, même taille */
        var r = card.querySelector('.doctor-photo').getBoundingClientRect();
        mPhoto.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;max-height:none;aspect-ratio:auto;transform:none;';
        card.classList.add('is-hidden-source');
      }
      document.documentElement.classList.add('team-modal-open');
      if (window.lenis) window.lenis.stop();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      modal.scrollTop = 0;
      isOpen = true;

      if (hasGsap) {
        var texts = [mName, mSpec, mBio, modal.querySelector('.doctor-modal-line'), mFav];
        tl = gsap.timeline();
        if (desktop) {
          tl.fromTo(left, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0)
            .fromTo(right, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, 0)
            .fromTo(texts, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, 0.5);
        } else {
          tl.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' })
            .fromTo(texts, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.1);
        }
      }
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function openModal(card) {
      if (isOpen || busy) return;
      busy = true; sourceCard = card; lastFocus = document.activeElement;
      setNavH();
      /* Les noms et les flèches s'effacent pendant le centrage, avant la modal */
      section.classList.add('names-ready');
      void section.offsetWidth;
      section.classList.add('is-focusing');
      var go = isDesktop() ? centerOn(card) : Promise.resolve();
      go.then(function () {
        /* après le slideToLoop, la carte au centre peut être un autre nœud : on la reprend */
        var active = swiper && list.querySelector('.swiper-slide-active [data-doctor-card]');
        if (active && isDesktop()) sourceCard = active;
        show(sourceCard);
        busy = false;
      });
    }

    function finishClose() {
      modal.classList.remove('is-open', 'no-fav');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('team-modal-open');
      if (window.lenis) window.lenis.start();
      if (sourceCard) sourceCard.classList.remove('is-hidden-source');
      mPhoto.style.cssText = '';
      if (hasGsap) gsap.set([modal, left, right], { clearProps: 'all' });
      isOpen = false; tl = null;
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    function closeModal() {
      if (!isOpen) return;
      section.classList.remove('is-focusing');
      /* La photo revient en douceur au zoom qu'aura la photo source une fois la modal fermée */
      var clone = mPhoto.querySelector('img');
      if (clone && sourceCard) {
        var r = sourceCard.querySelector('.doctor-photo').getBoundingClientRect();
        var hovered = canHover && mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
        clone.style.scale = hovered ? '1.06' : '1';
      }
      if (tl) { tl.eventCallback('onReverseComplete', function () { setTimeout(finishClose, 150); }); tl.timeScale(1.4).reverse(); }
      else setTimeout(finishClose, 300);
    }

    section.addEventListener('click', function (e) {
      var card = e.target.closest('[data-doctor-card]');
      if (card) openModal(card);
    });
    section.addEventListener('keydown', function (e) {
      var card = e.target.closest('[data-doctor-card]');
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openModal(card); }
    });
    modal.addEventListener('click', function (e) {
      var target = e.target.closest('[data-modal-close]');
      if (!target) return;
      if (!isDesktop() && target !== closeBtn) return; /* en responsive, seule la croix ferme */
      closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') closeModal();
      if ((e.key === 'Enter' || e.key === ' ') && e.target === closeBtn) { e.preventDefault(); closeModal(); }
    });
    var wasDesktop = isDesktop();
    window.addEventListener('resize', function () {
      var d = isDesktop();
      if (isOpen && d !== wasDesktop) closeModal();
      wasDesktop = d;
    });
  });
})();
