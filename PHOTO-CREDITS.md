# Photo credits

## Supplied by the clinic

| File | Used for | What it is |
|---|---|---|
| `assets/img/clinic-microscope.jpg` | Home hero, About | Dr. Amit Malik at the operating microscope |
| `treatments/root-canal.jpg` | Root canal | Dr. Amit Malik treating a patient |
| `treatments/crowns.jpg` | Crowns & bridges | 3D render of a bridge seating over prepared teeth |
| `treatments/implants.jpg` | Implants | 3D render of an implant in bone |
| `treatments/full-mouth-rehabilitation.jpg` | Full mouth rehab | **Patient case**, before and after |
| `treatments/extractions.jpg` | Extractions | Diagram: signs a wisdom tooth needs removing |
| `treatments/cleaning.jpg` | Cleaning | 3D render of scaling at the gumline |
| `treatments/gums.jpg` | Gum treatment | **Patient case**, six-stage surgical sequence |
| `treatments/whitening.jpg` | Whitening | Patient under a whitening light |
| `treatments/smile-design.jpg` | Smile design | **Patient case**, before and after |
| `assets/img/dr-amit-malik.jpg` | Founder portrait | **AI-generated** — see README |

### Two things to settle on these

**Patient consent.** Three of the above are clinical photographs of identifiable
patients' mouths — a surgical sequence and two before-and-afters. Publishing
those needs each patient's consent on record. Before-and-after imagery in dental
advertising also carries its own rules about implying a typical result. Both are
the clinic's call, but they are decisions rather than defaults.

**Licence.** Several others are stock 3D renders and a diagram rather than
photographs taken at the clinic. If the clinic does not hold a licence for one,
overwrite the file at the same path — no markup change needed.

## Stock photography — Unsplash

Published under the [Unsplash License](https://unsplash.com/license): free for
commercial use, no permission or attribution required. Free-licence images only,
none from the paid Unsplash+ collection. Credited here anyway.

These are **illustrative** — they show the treatment, not this clinic's rooms,
staff or patients, and none is presented as a result of treatment here.

| File | Used for | Photographer | Source |
|---|---|---|---|
| `treatments/braces.jpg` | Braces | Katarzyna Zygnerska | [P8ernb_Ht-M](https://unsplash.com/photos/P8ernb_Ht-M) |
| `treatments/invisalign.jpg` | Invisalign | Harold Hisona | [uTUsnv_UCSQ](https://unsplash.com/photos/uTUsnv_UCSQ) |
| `treatments/dentures.jpg` | Dentures | Peter Kasprzyk | [U1gvhqVQ2kQ](https://unsplash.com/photos/U1gvhqVQ2kQ) |
| `treatments/children.jpg` | Children's dentistry | Navy Medicine | [Y_D9bmeX1V0](https://unsplash.com/photos/Y_D9bmeX1V0) |
| `treatments/dental-trauma.jpg` | Dental trauma | Umanoide | [KeVKEs1_RDU](https://unsplash.com/photos/KeVKEs1_RDU) |
| `treatments/emergency.jpg` | Dental emergencies | Jonathan Borba | [v_2FRXEba94](https://unsplash.com/photos/v_2FRXEba94) |
| `membership-family.jpg` | Membership | Vitaly Gariev | [2xb1csEK8As](https://unsplash.com/photos/2xb1csEK8As) |

## How the images are fitted

Most fill their frame (`object-fit: cover`), cropped from the centre. Three do
not: the gum surgery sequence, and the two before-and-after cases. They carry
`class="fit"`, which sits them inside the frame instead, because cropping would
cut half the comparison away. The diagram for extractions is padded to the card
shape in the file itself for the same reason.
