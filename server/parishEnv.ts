/** Read parish environment variables (Vite-first, Next-style names kept as fallback). */

export function envFrom(source: NodeJS.ProcessEnv | Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') out[key] = value
  }
  return out
}

export function supabaseUrl(env: Record<string, string>): string {
  return env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ''
}

export function supabaseAnonKey(env: Record<string, string>): string {
  return (
    env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  )
}

export function cloudinaryCloudName(env: Record<string, string>): string {
  return (
    env.CLOUDINARY_CLOUD_NAME ||
    env.VITE_CLOUDINARY_CLOUD_NAME ||
    env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    ''
  ).toLowerCase()
}
