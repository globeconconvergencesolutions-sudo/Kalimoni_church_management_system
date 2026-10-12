export type TestimonialStatus = 'pending' | 'published' | 'rejected'

export type Testimonial = {
  id: string
  quote: string
  display_name: string
  role: string | null
  location: string | null
  status: TestimonialStatus
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export type TestimonialSubmit = {
  quote: string
  display_name: string
  role?: string
  location?: string
  /** Honeypot — must be empty */
  website?: string
}

export type TestimonialMetaUpdate = {
  quote?: string
  display_name?: string
  role?: string | null
  location?: string | null
  sort_order?: number
}
