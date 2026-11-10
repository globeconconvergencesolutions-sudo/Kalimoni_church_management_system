# Parked / restored public features

Official giving channels and parish phone / WhatsApp numbers are gated by [`src/lib/siteFeatures.ts`](../src/lib/siteFeatures.ts). Flip flags and update this file when parking or restoring.

Do **not** show “coming soon”, “TBD”, or “contact the administrator” placeholders for parked items — omit them silently.

---

## Current flags

| Flag | Default | Meaning |
|------|---------|---------|
| `publicDonate` | `true` | Public `/donate`, nav Donate CTAs, home/blog giving pitches |
| `contactPhoneWhatsApp` | `true` | Tel links, WhatsApp FAB, ministry WhatsApp CTA |
| `testimonials` | `true` | Home Voices + moderated submit |

Admin **Giving** (`/admin/giving`) stays live for internal gift records.

---

## Public donate (`publicDonate`) — RESTORED 2026-11-10

### Live channels (official parish sheet)

| Purpose | Method | Details |
|---------|--------|---------|
| Tithe / donation / offertory | M-Pesa Paybill | **8622862** · Account: Tithe / Donation / Offertory + name |
| Tithes / donations / offerings | Family Bank (Thika) | **005000026146** · St. Theresa's Kalimoni Parish |
| Centenary church project | KCB Juja | **1202431526** · St. Theresa Kalimoni Catholic Parish |
| Centenary church project | M-Pesa Paybill | **522533** · Account: **8055823#Jumuiya** |

### Hidden for now (not in official sheet)

PayPal, Stripe / card, Western Union — code removed from the public Donate method list; do not re-add until approved.

### Surfaces

- [x] Route `/donate` live ([`Donation.tsx`](../src/pages/Donation.tsx))
- [x] Header / mobile / footer Donate CTAs ([`Layout.tsx`](../src/components/Layout.tsx))
- [x] Home hero Donate, Support Us tile, NewsletterCTA donate column ([`Home.tsx`](../src/pages/Home.tsx))
- [x] Blog donate CTAs ([`BlogPost.tsx`](../src/pages/BlogPost.tsx))
- [x] Contact subject “Donations & Giving” ([`Contact.tsx`](../src/pages/Contact.tsx))

### To park again

1. Set `publicDonate: false`.
2. Smoke-test redirect of `/donate` and absence of Donate CTAs.

---

## Phone & WhatsApp (`contactPhoneWhatsApp`) — RESTORED 2026-11-10

Canonical number in [`parishLocation.ts`](../src/data/parishLocation.ts): **+254 704 358594** (0704358594).

Helpers: `parishPhoneDisplay()`, `parishTelHref()`, `parishWhatsAppUrl(prefill?)`.

### Surfaces

- [x] Footer tel + WhatsApp FAB
- [x] Contact / Events tel
- [x] Ministries WhatsApp CTA

Email remains **sttheresakalimoniparish@gmail.com** (doc typo `bmail` ignored).

### To park again

1. Set `contactPhoneWhatsApp: false`.
2. Confirm tel / FAB omit cleanly.

---

## Jumuiyas (content, not a flag) — UPDATED 2026-11-10

Official count: **40** Small Christian Communities (19 Kalimoni + 11 HAA + 10 St. Dominic). Source of truth: [`src/data/jumuiyas.ts`](../src/data/jumuiyas.ts). Named list on Community page.

---

## Testimonials (not parked)

Moderated Voices of the Parish: public submit → pending → admin approve → published on Home.

---

## Change log

| Date | Change |
|------|--------|
| 2026-10-12 | Initial park: `publicDonate` + `contactPhoneWhatsApp` off; testimonials module live |
| 2026-11-10 | Restore phone/WhatsApp + Donate with official Paybill/banks; hide PayPal/Stripe/WU; Jumuiyas → 40 |
