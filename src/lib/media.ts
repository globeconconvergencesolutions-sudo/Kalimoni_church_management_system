import { getCloudinaryCloudName } from './env'

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
  slot_active?: boolean
  album_id?: string | null
  created_at?: string
  updated_at?: string
}

/** Pull Cloudinary version from a secure_url so overwrites bust CDN cache. */
export function cloudinaryVersionFromUrl(url?: string | null): string | null {
  if (!url) return null
  const match = url.match(/\/upload\/(?:.*\/)?v(\d+)\//) || url.match(/\/v(\d+)\//)
  return match?.[1] ?? null
}

function cloudinaryPublicId(src: string): string {
  const value = src.trim()
  if (!value.includes('res.cloudinary.com')) return value.replace(/^\/+/, '')
  const afterUpload = value.split('/upload/')[1]
  if (!afterUpload) return value.replace(/^\/+/, '')
  // Drop transform segments and optional version prefix
  const parts = afterUpload.split('/').filter(Boolean)
  let start = 0
  while (start < parts.length) {
    const part = parts[start]
    if (/^v\d+$/.test(part)) {
      start += 1
      break
    }
    // Cloudinary transforms look like c_fill,w_800 or f_auto
    if (part.includes(',') || /^[a-z]+_/.test(part)) {
      start += 1
      continue
    }
    break
  }
  return parts.slice(start).join('/')
}

/** Accepts a Cloudinary public id, full URL, or Unsplash photo-… id. */
export function parishImage(
  src: string | undefined | null,
  width = 800,
  height = 500,
  version?: string | null,
): string {
  if (!src) return ''
  const value = src.trim()
  if (value.startsWith('photo-')) {
    return `https://images.unsplash.com/${value}?w=${width}&h=${height}&fit=crop&auto=format`
  }
  if ((value.startsWith('http://') || value.startsWith('https://')) && !value.includes('res.cloudinary.com')) {
    return value
  }
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  const id = cloudinaryPublicId(value)
  const vSeg = version ? `v${version}/` : ''
  return `https://res.cloudinary.com/${cloud}/image/upload/c_fill,w_${width},h_${height},f_auto,q_auto/${vSeg}${id}`
}

export function parishVideo(src: string | undefined | null, width = 1280, version?: string | null): string {
  if (!src) return ''
  const value = src.trim()
  if ((value.startsWith('http://') || value.startsWith('https://')) && !value.includes('res.cloudinary.com')) {
    return value
  }
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  const id = cloudinaryPublicId(value)
  const vSeg = version ? `v${version}/` : ''
  return `https://res.cloudinary.com/${cloud}/video/upload/c_limit,w_${width},f_auto,q_auto/${vSeg}${id}`
}

export function parishVideoPoster(
  src: string | undefined | null,
  width = 1280,
  height = 720,
  version?: string | null,
): string {
  if (!src) return ''
  const value = src.trim()
  if ((value.startsWith('http://') || value.startsWith('https://')) && !value.includes('res.cloudinary.com')) {
    return value
  }
  const cloud = getCloudinaryCloudName()
  if (!cloud) return value
  const id = cloudinaryPublicId(value)
  const vSeg = version ? `v${version}/` : ''
  return `https://res.cloudinary.com/${cloud}/video/upload/so_0,c_fill,w_${width},h_${height},f_jpg,q_auto/${vSeg}${id}`
}

export function mediaDeliverySrc(row: ParishMedia | undefined, fallback: string, width: number, height?: number): string {
  const version = cloudinaryVersionFromUrl(row?.url)
  const raw = row?.cloudinary_id || row?.url || fallback
  if (row?.media_type === 'video') {
    return parishVideoPoster(raw, width, height ?? Math.round(width * 0.56), version)
  }
  return parishImage(raw, width, height ?? Math.round(width * 0.62), version)
}
