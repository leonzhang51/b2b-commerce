export function recordMetric(
  name: string,
  value: number | Record<string, any> = 1,
) {
  // Minimal no-op implementation. Replace with real metrics provider (Prometheus / Datadog) integration.
  if (process.env.NODE_ENV === 'test') return
  console.info('[metric]', name, value)
}
