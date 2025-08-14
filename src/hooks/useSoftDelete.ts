import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface SoftDeleteParams {
  entityType: 'user' | 'company' | 'product' | 'category'
  entityId: string
}

export function useSoftDelete() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ entityId }: SoftDeleteParams) => {
      if (!user) throw new Error('User not authenticated')

      // Call the soft delete function in the database
      const { data, error } = await supabase.rpc('soft_delete_user', {
        p_user_id: entityId,
        p_deleted_by: user.id,
      })

      if (error) throw error
      return data
    },
  })
}

export function useRestore() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ entityId }: SoftDeleteParams) => {
      if (!user) throw new Error('User not authenticated')

      // Call the restore function in the database
      const { data, error } = await supabase.rpc('restore_user', {
        p_user_id: entityId,
        p_restored_by: user.id,
      })

      if (error) throw error
      return data
    },
  })
}

export function useHardDelete() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ entityId }: SoftDeleteParams) => {
      if (!user) throw new Error('User not authenticated')

      // Call the hard delete function in the database
      const { data, error } = await supabase.rpc('hard_delete_user', {
        p_user_id: entityId,
        p_deleted_by: user.id,
      })

      if (error) throw error
      return data
    },
  })
}

export function useDeletedEntities(
  entityType: 'user' | 'company' | 'product' | 'category' = 'user',
) {
  return useQuery({
    queryKey: ['deleted-entities', entityType],
    queryFn: async () => {
      const tableName =
        entityType === 'user' ? 'deleted_users' : `deleted_${entityType}s`

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('deleted_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}
