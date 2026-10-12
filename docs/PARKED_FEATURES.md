# Parked public features

Official giving channels and parish phone / WhatsApp numbers are not yet approved for the public site. Code stays in the repo; surfaces are gated by [`src/lib/siteFeatures.ts`](../src/lib/siteFeatures.ts). Flip flags and update this file when restoring.

Do **not** show “coming soon”, “TBD”, or “contact the administrator” placeholders for parked items — omit them silently.

---

## Current flags

| Flag | Default | Meaning |
|------|---------|---------|
| `publicDonate` | `false` | Public `/donate`, nav Donate CTAs, home/blog giving pitches |
| `contactPhoneWhatsApp` | `false` | Tel links, WhatsApp FAB, ministry WhatsApp CTA |
| `testimonials` | `true` | Home Voices + moderated submit (not parked) |

Admin **Giving** (`/admin/giving`) stays live for internal gift records.

---

## Public donate (`publicDonate`)

### Parked surfaces

- [ ] Route `/donate` → silent redirect to `/` while flag is off ([`src/routes.ts`](../src/routes.ts)); page component kept ([`src/pages/Donation.tsx`](../src/pages/Donation.tsx))
- [ ] Header Donate chip + mobile “Donate Now” ([`src/components/Layout.tsx`](../src/components/Layout.tsx))
- [ ] Footer top “Support the Mission” band + Connect “Donate” link + bottom Donate link
- [ ] Home hero Donate button, quick-link Support Us tile, NewsletterCTA left column donate pitch ([`src/pages/Home.tsx`](../src/pages/Home.tsx))
- [ ] Blog post end CTA + sidebar Give Today ([`src/pages/BlogPost.tsx`](../src/pages/BlogPost.tsx))
- [ ] Contact subject “Donations & Giving” ([`src/pages/Contact.tsx`](../src/pages/Contact.tsx))

### Still live

- Email, address, maps, Facebook
- Admin Giving + dashboard gifts card (internal)

### Restore checklist

1. Set official M-Pesa / bank / Western Union details in `Donation.tsx` (and related copy).
2. Set `publicDonate: true` in `siteFeatures.ts`.
3. Smoke-test: nav, footer, home, blog, `/donate`, Contact subject if re-added.
4. Update this section: mark items restored and note the date / source of the official channels.

---

## Phone & WhatsApp (`contactPhoneWhatsApp`)

Canonical numbers live in [`src/data/parishLocation.ts`](../src/data/parishLocation.ts) (`phone` / `phoneTel`). Public UI must use:

- `parishPhoneDisplay()`
- `parishTelHref()`
- `parishWhatsAppUrl(prefill?)`

These return `null` while the flag is off.

### Parked surfaces

- [ ] Footer tel row ([`Layout.tsx`](../src/components/Layout.tsx))
- [ ] WhatsApp floating action button
- [ ] Contact page tel link ([`Contact.tsx`](../src/pages/Contact.tsx))
- [ ] Events sidebar tel ([`Events.tsx`](../src/pages/Events.tsx))
- [ ] Ministries “WhatsApp Us” (replaced by Contact while off) ([`Ministries.tsx`](../src/pages/Ministries.tsx))
- [ ] Donation page phone lines (also behind `publicDonate`)

### Still live

- `mailto:` parish email
- Physical address and map links

### Restore checklist

1. Replace `phone` / `phoneTel` in `parishLocation.ts` with the **approved** numbers (voice + WhatsApp may differ — adjust helpers if needed).
2. Set `contactPhoneWhatsApp: true`.
3. Smoke-test: footer, Contact, Events, Ministries, WhatsApp FAB.
4. Update this section with the approved numbers and restore date.

---

## Testimonials (not parked)

Moderated Voices of the Parish: public submit → `pending` → admin approve → `published` on Home.

- Public: [`src/pages/Home.tsx`](../src/pages/Home.tsx)
- Admin: `/admin/testimonials`
- Table: `public.testimonials` (see migrations)

---

## Change log

| Date | Change |
|------|--------|
| 2026-10-12 | Initial park: `publicDonate` + `contactPhoneWhatsApp` off; testimonials module live |
