/**
 * Compress an image file client-side using Canvas API
 * @param file - The image file to compress
 * @param maxWidth - Maximum width (px)
 * @param maxHeight - Maximum height (px)
 * @param quality - JPEG/WebP quality (0-1)
 * @returns Promise<File> - Compressed image file
 */
export async function compressImageFileAsync(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const { width, height } = img
      let newWidth = width
      let newHeight = height
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        newWidth = Math.round(width * ratio)
        newHeight = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'))
          const ext = file.type === 'image/png' ? 'png' : 'jpeg'
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.(jpg|jpeg|png)$/i, `.compressed.${ext}`),
            {
              type: blob.type,
              lastModified: Date.now(),
            },
          )
          resolve(compressedFile)
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality,
      )
    }
    img.onerror = (e) => reject(new Error('Image load error'))
    img.src = URL.createObjectURL(file)
  })
}
/**
 * Generate srcSet for responsive/product images (WebP + fallback)
 */
export function getProductImageSrcSet(
  src?: string,
  fallback = '/placeholder-product.svg',
): string | undefined {
  if (!src) return undefined
  // Assume images are stored as .jpg or .png, and .webp is available at same path
  const base = src.replace(/\.(jpg|jpeg|png)$/i, '')
  return [
    `${base}.webp 1x`,
    `${base}@2x.webp 2x`,
    `${src} 1x`,
    `${src.replace(/\.(jpg|jpeg|png)$/i, '@2x.$1')} 2x`,
  ].join(', ')
}
/**
 * Utility functions for handling product images
 */

/**
 * Get the appropriate image source with fallback handling
 */
export function getImageSrc(
  imageUrl?: string,
  fallback = '/placeholder-product.svg',
): string {
  if (!imageUrl) return fallback

  // If it's already a placeholder, return it
  if (imageUrl.includes('placeholder')) return imageUrl

  // If it's a relative path, ensure it starts with /
  if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    return `/${imageUrl}`
  }

  return imageUrl
}

/**
 * Preload an image to check if it exists
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

/**
 * Get a list of common image extensions
 */
export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.webp',
]

/**
 * Check if a URL is likely an image based on extension
 */
export function isImageUrl(url: string): boolean {
  if (!url) return false
  const lowercaseUrl = url.toLowerCase()
  return IMAGE_EXTENSIONS.some((ext) => lowercaseUrl.includes(ext))
}

/**
 * Generate a placeholder image URL based on product name or ID
 */
export function generatePlaceholderUrl(
  _productName?: string,
  _productId?: string,
): string {
  // For now, just return the default placeholder
  // In the future, we could generate different placeholders based on product type
  return '/placeholder-product.svg'
}
