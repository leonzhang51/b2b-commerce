import { useDebugSupabase } from '@/hooks/useDebugSupabase'

export function ConnectionTest() {
  const { data, error, isLoading } = useDebugSupabase()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        <span className="text-blue-700">Testing Supabase connection...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">Connection Failed</h3>
        <p className="text-red-700 text-sm">
          {error instanceof Error
            ? error.message
            : 'Failed to connect to Supabase'}
        </p>
        <details className="mt-2">
          <summary className="text-xs text-red-600 cursor-pointer">
            Show error details
          </summary>
          <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  if (data) {
    return (
      <div className="space-y-4">
        {data.success.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Working Tables
            </h3>
            <ul className="text-green-700 text-sm space-y-1">
              {data.success.map((msg: string, i: number) => (
                <li key={i}>• {msg}</li>
              ))}
            </ul>
          </div>
        )}

        {data.errors.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Issues Found
            </h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              {data.errors.map((msg: string, i: number) => (
                <li key={i}>• {msg}</li>
              ))}
            </ul>
          </div>
        )}

        {data.tablesChecked.length > 0 && (
          <details className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <summary className="font-semibold text-blue-800 cursor-pointer">
              📊 Table Details ({data.tablesChecked.length} checked)
            </summary>
            <div className="mt-2 space-y-2">
              {data.tablesChecked.map((table: any, i: number) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{table.table}:</span>
                  <span
                    className={
                      table.exists ? 'text-green-600 ml-2' : 'text-red-600 ml-2'
                    }
                  >
                    {table.exists
                      ? `✓ ${table.count} records`
                      : `✗ ${table.error}`}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    )
  }

  return null
}
