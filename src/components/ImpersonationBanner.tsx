import { AlertTriangle, User, X } from 'lucide-react'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { Button } from '@/components/ui/button'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, originalUser, endImpersonation } =
    useImpersonation()

  if (!isImpersonating || !impersonatedUser || !originalUser) {
    return null
  }

  return (
    <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium">Impersonating:</span>
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span className="font-semibold">{impersonatedUser.full_name}</span>
            <span className="text-orange-100">({impersonatedUser.email})</span>
          </div>
          <span className="text-orange-200">•</span>
          <span className="text-orange-100">
            Original: {originalUser.full_name}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={endImpersonation}
        className="text-white hover:bg-orange-600 hover:text-white flex items-center space-x-1"
      >
        <X className="h-4 w-4" />
        <span>End Impersonation</span>
      </Button>
    </div>
  )
}
