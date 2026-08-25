# Dental Experts — Sonipat (v3)

Five-page static site for **Dental Experts (Precision Care. Confident Smiles.)**,
a dental clinic in Sector 8, Sonipat, Haryana, led by Dr. Amit Malik, MDS.

This is a **third design direction**, taking its cues from
[gelosdentistry.com](https://gelosdentistry.com/contact/). The clinic content is
the same verified content used across every design direction — same phone,
same address, same real Google-review snippets. Nothing factual was invented
for the redesign.

`../dental-experts-v4` is untouched. Both run side by side on different ports.

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:5176/>. (5173 baba-realty, 5177 v4.)

No build step, no dependencies, no framework. Plain HTML, one stylesheet, two
small scripts.

---

## What was taken from Gelos — and what was not

The reference was inspected live rather than eyeballed from a screenshot, so
these are its actual values:

| Gelos | What this site does |
|---|---|
| **Cinzel** classical serif for every major heading, weight 400 | **Cormorant Garamond** — same classical-serif register, but with a true lowercase that survives long headings |
| **Arimo** sans for sub-headings and body | **Jost** — geometric sans, keeps card titles and UI distinct from the serif |
| Warm cream ground `#FDF8F3` | Warm ivory `#FBF7F0` + `#F2EBDE` stone |
| Deep brown `#7C4424` + brass `#AB8032` | **Deep navy `#12293F` + brass `#7F5C1C`/`#C1974F`** |
| 10–16px card radii, white cards on cream | Same — `--r-md: 12px`, `--r-lg: 16px` |
| Contact page: Get in Touch → 3 cards → booking form → WhatsApp → Office Hours → Emergency → Find Us → Still Have Questions | Same section order, same form field set |
| Stat figures, service grid, team block, patient stories, closing CTA | Same page rhythm on the home page |

### The palette choice

You asked me to pick. Gelos's brown-and-gold is genuinely elegant, but brown
reads *spa* — it is the palette of a salon or a jewellery brand. For a clinic
whose whole pitch is precision and second opinions, the thing the palette has to
carry is **trust**, and deep navy is the most reliable ground in healthcare.

Keeping the **brass** preserves what actually makes the Gelos look premium: a
metallic accent against a warm, non-clinical off-white. Navy + brass + ivory
gets the same richness without the site feeling like a day spa. The brass is
also the one thing that stops navy-and-white from looking like a bank.

### Where it departs from the reference on substance

**The stats are real.** Gelos shows `10+` and `99%`. This clinic's verifiable
figures are **4.7 rating, 12 Google reviews, MDS endodontist, 6 days a week** —
that is what the strip says. On a healthcare site an unverifiable claim is the
kind that gets a Google Business Profile suspended.

**There is no email card.** Gelos's contact page leads with phone / email /
address. This clinic publishes no email address, so the third card is the
address and a line says so plainly, rather than inventing an inbox.

**The form has no server.** See below.

---

## Pages

| File | Page | Sections |
|---|---|---|
| `index.html` | Home | Hero · stats · six services · why-us · meet the dentist · patient stories · CTA |
| `about.html` | About | Why the practice exists · how an appointment goes · what we will not do · at a glance |
| `services.html` | Services | Four specialist treatments (anchored) · six general · emergency panel · start-here |
| `founder.html` | Our Dentist | Dr. Amit Malik — philosophy · how he works · credentials · consult |
| `contact.html` | Contact | Get in Touch · 3 cards · booking form · office hours · emergency · find us · CTA |

```
assets/
  css/site.css        design tokens + all styling (13 numbered sections)
  js/config.js        phone, WhatsApp, address, hours — change details here first
  js/site.js          header, drawer, reveals, form -> WhatsApp, map loader
  img/logo-mark.svg   ring + tooth mark
  img/favicon.svg     heavier variant that survives 16px
  img/og-card.png     1200x630 social card (carried over from the first design)
  img/dr-amit-malik.jpg
  img/clinic-microscope.jpg
robots.txt · sitemap.xml · serve.ps1
```

### How the pages are assembled

The header, drawer, footer and booking form are **single source** partials. All
five pages were generated from them, so the nav and footer cannot drift apart —
which is exactly the class of bug that produced the inherited-colour problem in
an earlier design direction. The partials and a `build.sh` live in this session's scratchpad; if you edit
the site from here on, edit the HTML directly — the pages are plain, complete
files with no build step.

---

## Verified in-browser, not assumed

Measured against the running site.

**Contrast (WCAG 2.2 AA)** — every text/background pair on all five pages,
alpha-flattened against the real backdrop. Two token-level failures were found
and fixed:

- `--gold-ink` was `#8A6520` — **4.47:1** on the `--stone` band, just under 4.5.
  It carries eyebrows, `.link-a` links and the small uppercase headings.
  Deepened to `#7F5C1C`: 5.14:1 on stone, 5.70 on ivory, 6.09 white-on-fill.
- The WhatsApp button green was `#128C4A` — **4.31:1** under its white label.
  Now `#0F7F42` at 5.08:1. The true brand green `#25D366` (3.09:1) is kept only
  for the icon-only floating button, where the 3:1 graphics threshold applies.

**Layout** — contact.html overflowed **406px on a 375px screen**. The booking
section's two-column split was an inline `grid-template-columns`, which no media
query can override, so it never collapsed and the aside's
"Call +91 90345 55897" button pushed the page sideways. Moved to a `.book-grid`
class with a 980px breakpoint. All five pages now sit at 360px inside a 375px
viewport, with nothing overflowing at 768px or 1280px either.

**Heading order** — four of the five pages skipped a level. The footer used
`<h4>` directly after a section `<h2>`, and the contact cards sat at `<h3>`
directly under the banner `<h1>`. Footer headings are now `<h3>`; the contact
section got a visually-hidden `<h2>`, so the outline is correct without changing
the design. Zero skipped levels on any page.

**Target size (2.5.8)** — every interactive element measured at both 375px and
1280px. Nothing under 24px.

**Also checked** — one `<h1>` per page; every `<img>` has an `alt`; all JSON-LD
parses; every internal link and in-page anchor resolves; all seven local assets
return 200; the drawer locks body scroll, tracks `aria-expanded`/`aria-hidden`
and closes on Escape restoring focus; the booking form composes the correct
`wa.me` URL from all seven fields; the map loader injects a titled, lazy iframe
only on click.

**Not verifiable here** — the header's scroll shadow uses a
`requestAnimationFrame` throttle, and rAF is paused while the preview pane is
hidden, so no scroll handler could be exercised. Worth one manual scroll.

---

## Before this goes live

### 1. Set the real domain — required

Every page uses the placeholder `https://www.dentalexperts-sonipat.com/` in its
`canonical`, `og:url`, `og:image`, `twitter:image` and JSON-LD. Find and replace
across all five HTML files, `robots.txt` and `sitemap.xml`. Until then the OG
images will not resolve and the canonical tags point at a domain that does not
exist.

### 2. Opening hours — confirmed

~~Google published only "Open · Closes 7 pm", so the schedule was a guess.~~
The clinic has since confirmed: **open seven days a week, 10:00 am – 7:00 pm.**

That is now consistent across the top bar and footer of all five pages, the
Office Hours block in `contact.html`, `hours` in `assets/js/config.js`, and the
`openingHoursSpecification` in the JSON-LD on `index.html` and `contact.html`.
The booking form time slots already ran 10 AM to 7 PM and still match.

If the hours ever change, change all six together — a clinic site with two
different opening times on it is worse than one with none

### 3. The founder portrait is AI-generated

`assets/img/dr-amit-malik.jpg` came from an image generator, not a camera. It is
a plausible likeness, but on a healthcare site a patient reasonably reads the
founder photo as a photograph of the person who will treat them. A real headshot
is the safer choice, and the clinic has usable real photos — the microscope shot
is one. Swap by overwriting the file; no markup change needed.

Used on the home page's "Meet your dentist" block and the `founder.html` hero.

### 4. Patient consent on the clinic photo

`clinic-microscope.jpg` is the home hero and the about-page image. Its monitor
shows an intra-oral view of a patient's tooth under a rubber dam. Nothing
identifying is visible, but publish it only if the clinic is comfortable it has
that patient's consent.

### 5. Still deliberately blank

- **Dental college and DCI registration number.** The `MDS, Endodontist`
  credential is confirmed; college and registration are not. There is a
  commented-out pair of rows in the Qualifications card in `founder.html` ready
  to fill in, plus `alumniOf` to add to the schema.
- **Email address.** None is published, so everything routes through WhatsApp
  and phone.
- **`geo` coordinates in the JSON-LD.** Guessing a lat/long is worse than
  omitting it.
- **A short Maps link.** `config.js` now carries a working `mapsUrl` built from
  the address, which needs no API key. Swap it for the clinic's own
  `maps.app.goo.gl` link when you have one — and update the footer of all five
  pages, which hard-code the same URL twice each (address + map card).

### 6. Reviews

The three testimonials are genuine snippets from the clinic's Google reviews,
but reviewer names were not visible. Replace the `Google review` captions with
real first names once you can see them on the listing.

The `aggregateRating` says **4.7 from 12 reviews** — accurate when the site was first built.
Keep it current or drop the block: stale rating markup is worse than none.

The five stars on each card are decorative — they carry an `aria-label` but are
not per-review ratings pulled from Google. If you replace the snippets, check
the star count still matches what each reviewer actually left.

### 7. Which services are confirmed

Reviews and the clinic's own Google description confirm **root canal treatment,
crowns, extractions including wisdom teeth**, and "comprehensive dental care."

The rest of `services.html` — implants, gum treatment, whitening, dentures,
children's dentistry — is the standard offering for a restorative-and-endodontics
clinic, included so the page is complete. **Ask the clinic and delete anything
they do not do.** Each service has its own `id`; deleting a block is safe, but
remove the matching card on the home page and the option in the booking form's
Service dropdown.

### 8. The OG card is from the first design

`assets/img/og-card.png` was carried over unchanged and was made for the first
design's branding. Regenerate it to match the navy/brass palette if sharing
matters — the source script is at `../dental-experts-v4/tools/make-og.ps1`.

---

## The booking form

`contact.html` has no server behind it. Submitting composes a WhatsApp message
from the seven fields and hands off to `wa.me` — the patient sends it from their
own phone.

That is a deliberate choice, not a shortcut:

- WhatsApp is how patients in Sonipat actually contact a clinic.
- Nothing needs hosting, and there is no form backend to pay for or maintain.
- Nothing a patient types passes through a third-party form processor. On a
  medical site with a free-text box, that matters — a form service not covered
  by an agreement with the clinic ends up holding health information.

The note under the button says all of this, and asks patients to keep it brief
and leave medical history for the appointment. **If you later add a proper
backend, keep that note.**

---

## Performance

- Two webfont families (Cormorant Garamond, Jost) with `preconnect` and
  `display=swap`. The classical serif *is* the design here, so it is a
  deliberate cost. Self-host to remove the third-party request.
- No jQuery, no framework, no cookie banner, no analytics. Total JS ~5 KB.
- The five-star row is one SVG `<symbol>` referenced by `<use>`, not fifteen
  copied paths.
- The Google Maps iframe loads **only when clicked** — the heaviest thing on the
  contact page, and it sets third-party cookies.
- Hero images are marked `fetchpriority="high"`; below-fold images are lazy.
  A WebP export is the next lever.

## SEO

- Unique title (37–45 chars) and description (112–126 chars) per page.
- `Dentist` + `LocalBusiness` JSON-LD on home and contact with address, hours,
  phone, `sameAs`, `aggregateRating`, `areaServed` and an offer catalogue;
  `Person` schema on the founder page; `BreadcrumbList` on inner pages.
- Name, address, phone and hours are hard-coded in the top bar and footer HTML
  of every page, not injected by JS, so Google can match them to the Business
  Profile.

## After launch

The clinic's Google listing currently shows **"Add website"** — add the domain
there first. For a local clinic that single field will do more than everything
else on this list combined.

---

## The footer location card

The footer's third column shows the address as a **link to Google Maps**, and
below it a **live map that opens Google Maps when clicked**. Both point at the
same search URL, built from the clinic's own name and address — no API key, no
short link to wait on.

It is on all five pages, so a few things are deliberate:

- **The embed is inert.** `pointer-events: none` in the CSS plus `aria-hidden`
  and `tabindex="-1"` in the markup. Without that, a click would pan a 320px
  iframe instead of opening Maps, and keyboard users would get a second, useless
  tab stop inside the card.
- **`loading="lazy"`.** The Google request does not go out until the footer is
  actually reached. It is still a third-party request with cookies on every
  page — if that matters more than the map being visible, swap the card for the
  click-to-load pattern already used in the Find Us section of `contact.html`.
- **The address stays plain text in the HTML.** Wrapping it in a link does not
  hide it from Google — the name, address and phone are still literal text in
  every page's footer, which is what lets the Business Profile match them.

Two accessibility fixes came out of building it, both verified by measurement:

- The label band over the map was a gradient that faded across the text itself,
  measuring **4.27:1** at the top edge of the glyphs over a white map tile. It is
  now a flat `rgba(11,27,43,.94)` band at **13.9:1**, with the feather moved to a
  `::before` above the text where it costs nothing.
- The global focus ring is `--gold-ink`, which is 5.7:1 on ivory but only
  **2.86:1** on the navy footer — under the 3:1 that 1.4.11 asks of a focus
  indicator, and now reachable by a large new footer link. No single colour
  clears 3:1 on both grounds (`--gold` is 6.5:1 on navy but 2.5:1 on ivory), so
  dark contexts now use the lighter brass: **6.47:1** on the footer, **5.52:1**
  on the navy bands, with light contexts unchanged.

---

## The Google reviews section

Rebuilt on the home page after the pattern on [mestroweb.in](https://mestroweb.in/):

- **An aggregate bar** — the score, a star row, "Based on 12 Google reviews",
  and the Google logo with "Verified patient ratings".
- **Bordered white cards**, each carrying the Google "G" as a verified-review
  badge, the quote, and an author row.
- **A "Read All Reviews on Google" button** that opens the listing.

The Google logo appears in its nominative sense — it tells the reader where the
reviews came from. That is the same use every review widget makes of it.

### Two deliberate differences from the reference

**The stars show 4.7, not 5.0.** The brass star row is clipped to 94% over a
muted row underneath, so the rating is drawn as what it is. Five solid stars
would overstate a 4.7. The accessible name on the row says "Rated 4.7 out of 5",
so the value never depends on reading the fill.

**There are no reviewer names.** Mestro's cards carry real people — name,
initials avatar, review count, "2 days ago". For this clinic the three quotes
are verbatim from the listing, but **names, review counts and dates were never
visible**, and inventing them on a healthcare site would be fabricating
attribution for medical testimonials. So the author row shows a neutral avatar,
"Google review", and "Verified by Google" — all of which is true.

The markup is ready for the real thing. `.gr-avatar` is styled for either a
two-letter initial pair or the fallback glyph, so when you can see a name on the
listing it is a two-line swap — there is a worked example in the comment above
the card grid in `index.html`.

Until then the JSON-LD carries **`aggregateRating` only, and no `Review`
items**. Google's Review markup requires an `author`; publishing review schema
with a placeholder author is exactly the kind of thing that earns a manual
action. Add `Review` objects at the same time you add the names.

### Verified

Zero contrast and target-size failures at 375px, 768px and 1280px. The filled
star measures 6.09:1 against the card, well past the 3:1 a meaningful graphic
needs. The summary bar flips to a column at 560px and its divider rotates with
it; the card grid goes 3 → 2 → 1. Heading order is still clean and the page
still has exactly one `<h1>`.
