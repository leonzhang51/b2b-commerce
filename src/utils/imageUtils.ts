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
