import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface AuditLog {
  id: string
  user_id: string
  target_user_id?: string
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'role_change'
    | 'impersonate_start'
    | 'impersonate_end'
  entity_type: 'user' | 'company' | 'product' | 'category' | 'order' | 'system'
  entity_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
}

export function useAuditLogs(filters?: {
  userId?: string
  action?: string
  entityType?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Array<AuditLog>
    },
  })
}

export function useCreateAuditLog() {
  return useMutation({
    mutationFn: async (auditLog: Omit<AuditLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([auditLog])
        .select()
        .single()

      if (error) throw error
      return data
    },
  })
}

export function useAuditLogger() {
  const { user } = useAuth()
  const createAuditLog = useCreateAuditLog()

  const logUserRoleChange = async (
    targetUserId: string,
    oldRole: string,
    newRole: string,
    metadata?: Record<string, any>,
  ) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      target_user_id: targetUserId,
      action: 'role_change',
      entity_type: 'user',
      entity_id: targetUserId,
      old_values: { role: oldRole },
      new_values: { role: newRole },
      metadata,
    })
  }

  const logUserUpdate = async (
    targetUserId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    metadata?: Record<string, any>,
  ) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      target_user_id: targetUserId,
      action: 'update',
      entity_type: 'user',
      entity_id: targetUserId,
      old_values: oldValues,
      new_values: newValues,
      metadata,
    })
  }

  const logUserCreate = async (
    targetUserId: string,
    newValues: Record<string, any>,
    metadata?: Record<string, any>,
  ) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      target_user_id: targetUserId,
      action: 'create',
      entity_type: 'user',
      entity_id: targetUserId,
      new_values: newValues,
      metadata,
    })
  }

  const logImpersonationStart = async (
    targetUserId: string,
    metadata?: Record<string, any>,
  ) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      target_user_id: targetUserId,
      action: 'impersonate_start',
      entity_type: 'user',
      entity_id: targetUserId,
      metadata,
    })
  }

  const logImpersonationEnd = async (
    targetUserId: string,
    metadata?: Record<string, any>,
  ) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      target_user_id: targetUserId,
      action: 'impersonate_end',
      entity_type: 'user',
      entity_id: targetUserId,
      metadata,
    })
  }

  const logLogin = async (metadata?: Record<string, any>) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      action: 'login',
      entity_type: 'system',
      metadata,
    })
  }

  const logLogout = async (metadata?: Record<string, any>) => {
    if (!user) return

    return createAuditLog.mutateAsync({
      user_id: user.id,
      action: 'logout',
      entity_type: 'system',
      metadata,
    })
  }

  return {
    logUserRoleChange,
    logUserUpdate,
    logUserCreate,
    logImpersonationStart,
    logImpersonationEnd,
    logLogin,
    logLogout,
    createAuditLog,
  }
}
