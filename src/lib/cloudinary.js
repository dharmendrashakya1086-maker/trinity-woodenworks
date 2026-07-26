const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddek8a4ti'

// ─── Cloudinary URL Transformations ──────────────────────────────
// Cloudinary applies transformations via URL segments between the
// upload path and the filename: /upload/{transformations}/{file}.{ext}

export function getImageUrl(publicId, transforms = []) {
  if (!publicId) return '/placeholder.svg'
  const t = transforms.length ? transforms.join('/') + '/' : ''
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t}${publicId}`
}

// Extract public_id from a full Cloudinary URL
export function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)$/)
  return match ? match[1] : null
}

// ─── Predefined Transformations ──────────────────────────────────

// Background removal using Cloudinary AI
export function bgRemovedUrl(url) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, ['e_bgremove'])
}

// White background replacement
export function bgWhiteUrl(url) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, ['e_bgremove', 'b_white'])
}

// Transparent background (PNG)
export function bgTransparentUrl(url) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, ['e_bgremove', 'f_png'])
}

// Wooden texture background
export function bgWoodUrl(url) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, ['e_bgremove', 'b_gen_fill', 'prompt_wooden%20texture%20table'])
}

// Studio environment background
export function bgStudioUrl(url) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, ['e_bgremove', 'b_gen_fill', 'prompt_modern%20studio%20interior'])
}

// HD Upscaling
export function hdUpscaledUrl(url, scale = 2) {
  const pid = extractPublicId(url)
  if (!pid) return url
  const w = scale === 4 ? '4000' : scale === 3 ? '3000' : '2000'
  return getImageUrl(pid, [`c_scale,w_${w}`, 'e_upscale', 'q_auto'])
}

// Optimized delivery (auto quality + format)
export function optimizedUrl(url, width) {
  const pid = extractPublicId(url)
  if (!pid) return url
  const transforms = ['q_auto', 'f_auto']
  if (width) transforms.push(`w_${width}`)
  return getImageUrl(pid, transforms)
}

// Thumbnail
export function thumbnailUrl(url, size = 200) {
  const pid = extractPublicId(url)
  if (!pid) return url
  return getImageUrl(pid, [`w_${size}`, `h_${size}`, 'c_fill', 'q_auto', 'f_auto'])
}

// ─── Image Versions ──────────────────────────────────────────────
// Each product image can have multiple versions stored as:
// { original, bgRemoved, bgWhite, bgTransparent, hdUpscaled }

export function buildImageVersions(url) {
  return {
    original: url,
    bgRemoved: bgRemovedUrl(url),
    bgWhite: bgWhiteUrl(url),
    bgTransparent: bgTransparentUrl(url),
    hdUpscaled: hdUpscaledUrl(url),
  }
}

// ─── Background Replacement Options ──────────────────────────────
export const BG_OPTIONS = [
  { id: 'original', label: 'Original', fn: u => u },
  { id: 'bgRemoved', label: 'Remove BG', fn: bgRemovedUrl },
  { id: 'bgWhite', label: 'White BG', fn: bgWhiteUrl },
  { id: 'bgTransparent', label: 'Transparent', fn: bgTransparentUrl },
  { id: 'bgWood', label: 'Wood Texture', fn: bgWoodUrl },
  { id: 'bgStudio', label: 'Studio', fn: bgStudioUrl },
  { id: 'hdUpscaled', label: 'HD Upscale (2x)', fn: u => hdUpscaledUrl(u, 2) },
  { id: 'hdUpscaled4x', label: 'HD Upscale (4x)', fn: u => hdUpscaledUrl(u, 4) },
]
