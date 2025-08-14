import { useState } from 'react'
import { AlertTriangle, Eye, User } from 'lucide-react'
import type { User as UserType } from '@/lib/supabase'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'

interface ImpersonationControlsProps {
  user: UserType
  disabled?: boolean
}

export function ImpersonationControls({
  user,
  disabled = false,
}: ImpersonationControlsProps) {
  const { canImpersonate, startImpersonation, isImpersonating } =
    useImpersonation()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleImpersonate = () => {
    try {
      startImpersonation(user)
      setShowConfirmModal(false)
    } catch (impersonateError) {
      console.error('Failed to start impersonation:', impersonateError)
      alert(
        impersonateError instanceof Error
          ? impersonateError.message
          : 'Failed to start impersonation',
      )
    }
  }

  if (!canImpersonate || disabled || isImpersonating) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirmModal(true)}
        className="flex items-center space-x-1 text-orange-600 border-orange-300 hover:bg-orange-50"
      >
        <Eye className="h-4 w-4" />
        <span>Impersonate</span>
      </Button>

      <Modal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Confirm User Impersonation"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 mb-1">
                Security Warning
              </p>
              <p className="text-orange-700">
                You are about to impersonate another user. This action will be
                logged and you will have access to their account and data. Only
                proceed if this is necessary for support or testing purposes.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              User to Impersonate:
            </h4>
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">
                  Role: {user.role} • Company: {user.company_id}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">
              What happens when you impersonate:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You will see the application as this user sees it</li>
              <li>• Your actions will be performed as this user</li>
              <li>• A banner will show that you are impersonating</li>
              <li>• All actions will be logged for security</li>
              <li>• You can end impersonation at any time</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImpersonate}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Start Impersonation
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
