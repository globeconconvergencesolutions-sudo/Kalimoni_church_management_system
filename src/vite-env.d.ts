/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string
  /** @deprecated Use VITE_* names — kept for older .env files */
  readonly NEXT_PUBLIC_SUPABASE_URL?: string
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  readonly NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
