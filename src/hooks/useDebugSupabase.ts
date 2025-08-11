import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDebugSupabase() {
  return useQuery({
    queryKey: ['debug-supabase'],
    queryFn: async () => {
      const results = {
        tablesChecked: [],
        errors: [],
        success: [],
      } as any

      // Test 1: Skip get_schema_tables as it doesn't exist in this database
      results.success.push(
        'get_schema_tables: Skipped (function not available)',
      )

      // Test 2: Try simple select on individual tables
      const tablesToTest = ['categories', 'products', 'companies', 'users']

      for (const table of tablesToTest) {
        try {
          const { error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .limit(1)

          results.tablesChecked.push({
            table,
            exists: !error,
            count: count || 0,
            error: error?.message || null,
          })

          if (error) {
            results.errors.push(`${table}: ${error.message}`)
          } else {
            results.success.push(`${table}: Found ${count} records`)
          }
        } catch (e) {
          results.errors.push(`${table}: ${(e as Error).message}`)
        }
      }

      // Test 3: Try to get column info for products table specifically
      try {
        const { error } = await supabase.from('products').select('id').limit(1)

        if (error) {
          results.errors.push(`products table structure: ${error.message}`)
        } else {
          results.success.push('products table: basic select works')
        }
      } catch (e) {
        results.errors.push(`products table: ${(e as Error).message}`)
      }

      return results
    },
  })
}
