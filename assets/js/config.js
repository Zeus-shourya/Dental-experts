/* ==========================================================================
   DENTAL EXPERTS — site constants.

   Single source of truth for anything that changes when the clinic's details
   change. Loaded before site.js on every page.

   IMPORTANT: the name/address/phone block is ALSO hard-coded into the footer
   of every .html file. That duplication is deliberate — Google reads the
   footer NAP out of the HTML, and anything injected by JS after load is a
   weaker signal. If the number or address changes, change it here AND in the
   five footers (grep for "9034555897" and "Rishika Galleria").
   ========================================================================== */
(function () {
  'use strict';

  window.DX = {

    /* ---- Verified from the clinic's Google Business listing --------------- */
    name:         'Dental Experts',
    tagline:      'Precision Care. Confident Smiles.',
    phoneDisplay: '+91 90345 55897',
    phoneHref:    '+919034555897',   // E.164 — never format tel: hrefs with spaces
    whatsapp:     '919034555897',    // country code + number, no +, no spaces
    instagram:    'https://www.instagram.com/dentalexperts.sonipat/',
    // Search URL built from the NAP — works without an API key or a short link.
    // Swap for the clinic's own maps.app.goo.gl link once you have it; the
    // footer of every page hard-codes this same URL.
    mapsUrl:      'https://www.google.com/maps/search/?api=1&query=Dental+Experts%2C+Rishika+Galleria%2C+Sector+8%2C+Sonipat%2C+Haryana+131001',

    address: {
      line1:   '2nd Floor, Rishika Galleria, Parsvnath City',
      line2:   'SCO-55, near Main Gate, Sector 8',
      city:    'Sonipat',
      region:  'Haryana',
      pin:     '131001',
      country: 'IN'
    },

    /* ---- TODO: CONFIRM BEFORE LAUNCH ------------------------------------
       Google only exposed "Open · Closes 7 pm" — the full weekly schedule was
       not published, so the times below are a reasonable default, NOT a fact.
       Confirm with the clinic, then update:
         1. this object
         2. the hours block in contact.html
         3. the footer of all five pages
         4. the openingHoursSpecification in index.html + contact.html
         5. the time-slot <option> list in the booking form (both pages)
       --------------------------------------------------------------------- */
    hours: {
      weekdays: 'Monday – Saturday · 10:00 am – 7:00 pm',
      sunday:   'Sunday · Closed'
    },

    /* No email address is published for this clinic, so the site deliberately
       routes every enquiry through WhatsApp and phone instead of a form
       backend. That also keeps patient messages off a third-party form
       processor — worth preserving even after an email address exists. */
    email: null,

    /* Prefilled WhatsApp text. Kept short: long prefills get truncated on iOS. */
    waText: 'Hello Dental Experts, I would like to book an appointment.'
  };

  /* Builds a wa.me link with the message URL-encoded. */
  window.DX.waLink = function (text) {
    return 'https://wa.me/' + window.DX.whatsapp +
           '?text=' + encodeURIComponent(text || window.DX.waText);
  };
})();
