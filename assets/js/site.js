/* ==========================================================================
   DENTAL EXPERTS — behaviour.

   Six small, independent pieces. Each is wrapped so a failure in one cannot
   take down the others, and every one degrades to a usable page:
     1. Header shadow on scroll
     2. Drawer menu
     3. Scroll-in motion
     4. Booking form -> WhatsApp
     4b. Preselect treatment from ?service=
     5. Click-to-load map
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -- 1. Header gains a shadow once the page moves ----------------------- */
  (function header() {
    var hdr = $('.hdr');
    if (!hdr) return;

    var ticking = false;
    var apply = function () {
      hdr.classList.toggle('stuck', window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });

    apply();   // runs directly, so a reload at depth is correct immediately
  })();

  /* -- 2. Drawer ---------------------------------------------------------- */
  (function drawer() {
    var panel = $('#drawer');
    var open  = $('#drawer-open');
    var close = $('#drawer-close');
    if (!panel || !open) return;

    var lastFocus = null;

    var setOpen = function (state) {
      panel.setAttribute('data-open', state ? 'true' : 'false');
      panel.setAttribute('aria-hidden', state ? 'false' : 'true');
      open.setAttribute('aria-expanded', state ? 'true' : 'false');
      document.body.style.overflow = state ? 'hidden' : '';

      if (state) {
        lastFocus = document.activeElement;
        var first = $('a, button', panel);
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    };

    open.addEventListener('click', function () { setOpen(true); });
    if (close) close.addEventListener('click', function () { setOpen(false); });

    // Navigating away should not leave the drawer open behind the new page,
    // and same-page anchors need it shut to see where they landed.
    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') setOpen(false);
    });
  })();

  /* -- 3. Scroll-in motion ------------------------------------------------ */
  /* Pairs with section 12 of site.css. Each "unit" makes its own entrance:
     anything with .rev / .rev-l / .rev-r, and every direct child of .rev-kids
     or .rev-split. */
  (function motion() {
    var DUR = 850, STEP = 90, MAX_STAGGER = 450;

    var units = [];
    $$('.rev, .rev-l, .rev-r').forEach(function (el) { units.push(el); });
    $$('.rev-kids, .rev-split').forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c) { units.push(c); });
    });

    var done = function (el) {
      el.__m = true;
      el.classList.add('m-done');
      el.classList.remove('m-in');
      el.style.removeProperty('--rd');
    };

    // Tells the failsafe in <head> that motion is running, so it does not
    // unhide everything at once.
    window.__motion = true;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!units.length) return;
    if (reduced || !('IntersectionObserver' in window)) { units.forEach(done); return; }

    var isUnit = new Set(units);
    var pending = units.filter(function (el) {
      // A unit inside another unit would animate twice — once with its
      // parent and again on its own. Let the outer one carry it.
      for (var n = el.parentElement; n; n = n.parentElement) {
        if (isUnit.has(n)) { done(el); return false; }
      }
      return true;
    });

    // Starts one element's entrance. `i` is its place among siblings arriving
    // together. The __m flag means the observer and the sweep below can never
    // both start the same element.
    var reveal = function (el, i) {
      if (el.__m) return;
      el.__m = true;
      var delay = Math.min(i * STEP, MAX_STAGGER) + (parseInt(el.getAttribute('data-rd'), 10) || 0);
      el.style.setProperty('--rd', delay + 'ms');
      // Two frames: the hidden state must be painted before the change, or the
      // browser can skip straight to the end and nothing moves.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          // In a tab that paints rarely, the timer below can finish first.
          if (!el.classList.contains('m-done')) el.classList.add('m-in');
        });
      });
      // A timer rather than transitionend: it still fires if the transition
      // is interrupted or never paints (a background tab).
      setTimeout(function () { done(el); }, DUR + delay + 120);
    };

    // Stagger siblings that arrive together — a row of cards enters one after
    // another — but cap it, so a fast scroll never leaves content queuing.
    var queue = function (els) {
      var seen = new Map();
      els.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      }).forEach(function (el) {
        var i = seen.get(el.parentNode) || 0;
        seen.set(el.parentNode, i + 1);
        reveal(el, i);
      });
    };

    // The page opening plays on load wherever it sits. Left to the observer, a
    // headline that landed just under the fold stayed blank until the visitor
    // scrolled, which on a phone looked like half the hero was missing.
    var onLoad = pending.filter(function (el) { return el.closest('.hero, .banner'); });
    var onScroll = pending.filter(function (el) { return onLoad.indexOf(el) === -1; });
    queue(onLoad);

    var io = new IntersectionObserver(function (entries) {
      var hits = [];
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        if (!e.target.__m) hits.push(e.target);
      });
      if (hits.length) queue(hits);
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    onScroll.forEach(function (el) { io.observe(el); });

    // Safety net. The observer only sees positions the browser actually
    // paints, so a hard flick, Page Down held, or a jump to #membership can
    // carry an element through the viewport between two frames — it would
    // then never be seen, and never appear. The sweep handles both cases:
    // scrolled past unseen -> simply show it; in view but missed -> give it
    // its entrance now.
    var sweep = function () {
      var vh = window.innerHeight, late = [];
      onScroll.forEach(function (el) {
        if (el.__m) return;
        var r = el.getBoundingClientRect();
        if (r.bottom <= 0) { io.unobserve(el); done(el); }
        else if (r.top < vh * 0.92) { io.unobserve(el); late.push(el); }
      });
      if (late.length) queue(late);
    };
    var sweepTimer = null;
    window.addEventListener('scroll', function () {
      if (sweepTimer) return;
      // setTimeout, not requestAnimationFrame: this has to keep running
      // precisely when frames are scarce.
      sweepTimer = setTimeout(function () { sweepTimer = null; sweep(); }, 160);
    }, { passive: true });
    window.addEventListener('load', sweep);
    window.addEventListener('hashchange', sweep);
  })();

  /* -- 4. Booking form -> WhatsApp ---------------------------------------- */
  /* There is no server behind this site. Submitting composes a WhatsApp
     message from the fields and hands off to wa.me, so the patient sends it
     from their own phone. Nothing they type passes through a third-party form
     processor — which matters on a medical site with a free-text box. */
  (function form() {
    var forms = $$('form[data-wa-form]');
    if (!forms.length || !window.DX) return;

    forms.forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();

        var val = function (n) {
          var el = f.elements[n];
          return el && el.value ? el.value.trim() : '';
        };

        var lines = ['Hello Dental Experts, I would like to book an appointment.', ''];
        var add = function (label, v) { if (v) lines.push(label + ': ' + v); };

        add('Name',      val('name'));
        add('Phone',     val('phone'));
        add('Email',     val('email'));
        add('Treatment', val('treatment'));
        add('Preferred date', val('date'));
        add('Preferred time', val('time'));
        add('Message',   val('message'));

        var status = $('.form-status', f);
        if (status) status.textContent = 'Opening WhatsApp with your details…';

        window.open(window.DX.waLink(lines.join('\n')), '_blank', 'noopener');
      });
    });
  })();

  /* -- 4b. Preselect the treatment from ?service= ------------------------- */
  /* Every treatment has its own Book Now, arriving here as
     contact.html?service=<slug>#book. Matching that slug against the
     options' data-slug lands the patient on the form with their treatment
     already chosen, instead of making them find it a second time. */
  (function preselect() {
    var sel = $('#f-treatment');
    if (!sel) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('service');
    if (!slug) return;

    // only ever a slug we wrote ourselves — never inject it into the DOM
    slug = slug.replace(/[^a-z-]/gi, '');
    var opt = sel.querySelector('option[data-slug="' + slug + '"]');
    if (!opt) return;

    sel.value = opt.value || opt.textContent;

    /* Briefly flag the field so the change is visible rather than silent. */
    sel.setAttribute('data-prefilled', 'true');
    window.setTimeout(function () { sel.removeAttribute('data-prefilled'); }, 2600);
  })();

  /* -- 5. Click-to-load map ----------------------------------------------- */
  /* The Maps iframe is by far the heaviest thing on the contact page, and it
     sets third-party cookies. It loads only when the patient asks for it. */
  (function map() {
    var btn = $('#map-load');
    var box = $('#map-box');
    if (!btn || !box) return;

    btn.addEventListener('click', function () {
      var q = encodeURIComponent(
        'Dental Experts, Rishika Galleria, Sector 8, Sonipat, Haryana 131001'
      );
      var frame = document.createElement('iframe');
      frame.src = 'https://www.google.com/maps?q=' + q + '&output=embed';
      frame.title = 'Map showing Dental Experts, Sector 8, Sonipat';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';

      box.innerHTML = '';
      box.appendChild(frame);
    });
  })();

})();
