export function getCloudinaryCloudName(): string {
  return (import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '').toLowerCase()
}

export type ParishMedia = {
  id: string
  cloudinary_id: string
  url: string
  folder: string
  title: string
  category: string
  alt: string
  published: boolean
  sort_order: number
  slot_key?: string | null
  media_type?: string
  page?: string | null
  section?: string | null
  label?: string | null
  hint?: string | null
  caption?: string | null
  subtitle?: string | null
  aspect_hint?: string | null
  is_slot?: boolean
  created_at?: string
}

/** Accepts a Cloudinary public id, full URL, or Unsplash photo-… id. */
export function parishImage(src: string | undefined | null, width = 800, height = 500): string {
  if (!src) return ''
  const value = src.trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('photo-')) {
    return `https://images.unsplash.com/${value}?w=${width}&h=${height}&fit=crop&auto=format`
  }
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  return `https://res.cloudinary.com/${cloud}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${value.replace(/^\/+/, '')}`
}

export function parishVideo(src: string | undefined | null, width = 1280): string {
  if (!src) return ''
  const value = src.trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  return `https://res.cloudinary.com/${cloud}/video/upload/c_limit,w_${width},f_auto,q_auto/${value.replace(/^\/+/, '')}`
}

export function parishVideoPoster(src: string | undefined | null, width = 1280, height = 720): string {
  if (!src) return ''
  const value = src.trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  return `https://res.cloudinary.com/${cloud}/video/upload/so_0,c_fill,w_${width},h_${height},f_jpg,q_auto/${value.replace(/^\/+/, '')}`
}

export function mediaDeliverySrc(row: ParishMedia | undefined, fallback: string, width: number, height?: number): string {
  const raw = row?.cloudinary_id || row?.url || fallback
  if (row?.media_type === 'video') return parishVideoPoster(raw, width, height ?? Math.round(width * 0.56))
  return parishImage(raw, width, height ?? Math.round(width * 0.62))
}
