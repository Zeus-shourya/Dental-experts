/* ==========================================================================
   DENTAL EXPERTS — behaviour.

   Six small, independent pieces. Each is wrapped so a failure in one cannot
   take down the others, and every one degrades to a usable page:
     1. Header shadow on scroll
     2. Drawer menu
     3. Scroll reveals
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

  /* -- 3. Scroll reveals -------------------------------------------------- */
  (function reveals() {
    var items = $$('.rev');
    if (!items.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .06 });

    items.forEach(function (el) { io.observe(el); });
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
