/**
 * Central on/off switches for public parish surfaces that may be parked
 * until official data (bank / M-Pesa / phone) is approved.
 *
 * Restore steps: flip the relevant flag, fill real data, update docs/PARKED_FEATURES.md.
 */
export const siteFeatures = {
  /** Public /donate page, nav Donate CTAs, home/blog giving pitches */
  publicDonate: false,
  /** Footer/Contact/Events tel links + WhatsApp FAB / ministry WhatsApp CTA */
  contactPhoneWhatsApp: false,
  /** Home Voices of the Parish + moderated submit form */
  testimonials: true,
} as const

export type SiteFeatureKey = keyof typeof siteFeatures
