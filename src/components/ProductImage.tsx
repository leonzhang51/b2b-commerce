import { useCallback, useState } from 'react'
import { getImageSrc } from '@/utils/imageUtils'

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  showLoader?: boolean
}

export function ProductImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-product.svg',
  loading = 'lazy',
  showLoader = true,
}: ProductImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    if (!imageError && currentSrc !== fallbackSrc) {
      setImageError(true)
      setCurrentSrc(fallbackSrc)
      setImageLoaded(false) // Reset loaded state for fallback image
    } else {
      setImageLoaded(true) // Even if fallback fails, stop showing loader
    }
  }, [imageError, currentSrc, fallbackSrc])

  // Determine the image source to use
  const imageSrc = imageError ? fallbackSrc : getImageSrc(src, fallbackSrc)

  return (
    <div className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={loading}
      />
      {!imageLoaded && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  )
}
