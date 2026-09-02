/** Shared client + server guidance for parish media uploads. */

export const MEDIA_IMAGE_ACCEPT = 'image/*,.heic,.heif'
export const MEDIA_GALLERY_ACCEPT = 'image/*,video/*,.heic,.heif'
export const MEDIA_VIDEO_ACCEPT = 'video/*'

/** Generous limits — Cloudinary handles optimisation; staff should not be blocked by phone photos. */
export const MEDIA_MAX_IMAGE_BYTES = 25 * 1024 * 1024
export const MEDIA_MAX_VIDEO_BYTES = 100 * 1024 * 1024

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tif{1,2})$/i
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv)$/i

export function isLikelyImage(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  if (file.type === '' && IMAGE_EXT.test(file.name)) return true
  return /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
}

export function isLikelyVideo(file: File): boolean {
  if (file.type.startsWith('video/')) return true
  if (file.type === '' && VIDEO_EXT.test(file.name)) return true
  return false
}

export function validateParishMediaFile(
  file: File,
  opts: { allowVideo?: boolean } = {},
): { ok: true } | { ok: false; error: string } {
  const allowVideo = opts.allowVideo ?? true
  const image = isLikelyImage(file)
  const video = isLikelyVideo(file)

  if (!image && !video) {
    return {
      ok: false,
      error: 'This file type is not supported. Use a photo (JPG, PNG, WebP, HEIC) or video (MP4, MOV, WebM).',
    }
  }
  if (video && !allowVideo) {
    return { ok: false, error: 'This placement accepts photos only.' }
  }

  const max = video ? MEDIA_MAX_VIDEO_BYTES : MEDIA_MAX_IMAGE_BYTES
  if (file.size > max) {
    const mb = Math.round(max / (1024 * 1024))
    return {
      ok: false,
      error: video
        ? `Video is too large. Please use a file under about ${mb} MB.`
        : `Photo is too large. Please use a file under about ${mb} MB.`,
    }
  }

  return { ok: true }
}

export function mediaUploadHint(allowVideo: boolean): string {
  return allowVideo
    ? 'Photos or videos from your phone or computer — most common formats accepted'
    : 'Photos from your phone or computer — JPG, PNG, WebP, HEIC, and similar formats'
}
