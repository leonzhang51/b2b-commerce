import { useEffect, useState } from 'react'

/**
 * Hook to handle hydration state and prevent hydration mismatches
 * Returns true only after the component has mounted on the client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Set hydrated state after the component mounts
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook to safely check if we're running on the client side
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
