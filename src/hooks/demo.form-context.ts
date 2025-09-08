// Lightweight stub used by demo Form components in tests.

export function useFormContext() {
  return {
    isSubmitting: false,
  }
}

export function useFieldContext() {
  return {
    store: {} as any,
    meta: { errors: [] as Array<string> },
  }
}
