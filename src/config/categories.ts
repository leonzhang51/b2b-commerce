export const curatedCategories: ReadonlyArray<string> = [
  'Tools',
  'Electrical',
  'Plumbing',
  'Safety',
  'Lighting',
  'Lumber',
  'HVAC',
  'Paint',
]

const accentMap: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-600',
  orange: 'bg-orange-100 text-orange-600',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  rose: 'bg-rose-100 text-rose-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600',
}

// Returns Tailwind classes for background and text colors
// If accentHint is provided (e.g., from DB), it takes precedence when recognized
export function categoryAccent(
  name: string,
  accentHint?: string | null,
): string {
  const hint = String(accentHint || '')
    .toLowerCase()
    .trim()
  if (hint && accentMap[hint]) return accentMap[hint]

  const n = String(name).toLowerCase()
  if (n.includes('tool')) return accentMap.orange
  if (n.includes('electric')) return accentMap.amber
  if (n.includes('plumb') || n.includes('pipe')) return accentMap.sky
  if (n.includes('safety')) return accentMap.rose
  if (n.includes('light')) return accentMap.yellow
  if (n.includes('lumber') || n.includes('wood')) return accentMap.emerald
  if (n.includes('hvac') || n.includes('vent') || n.includes('air'))
    return accentMap.cyan
  if (n.includes('paint')) return accentMap.fuchsia
  if (n.includes('fasten') || n.includes('screw') || n.includes('bolt'))
    return accentMap.amber
  if (n.includes('adhes') || n.includes('glue')) return accentMap.fuchsia
  if (n.includes('concrete') || n.includes('cement')) return accentMap.gray
  return accentMap.gray
}
