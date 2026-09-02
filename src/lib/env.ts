/** Client-side env (Vite exposes only `VITE_*` keys via import.meta.env). */

export function getSupabaseUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  )
}

export function getSupabaseKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  )
}

export function getCloudinaryCloudName(): string {
  return (
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    ''
  ).toLowerCase()
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey())
}
