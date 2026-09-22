const MAX_SPINS = 4

export function pushLastSpin(history: string, winner: string, prize: string): string {
  const entry = `${sanitize(winner, 14)}~${sanitize(prize, 16)}`
  const parts = history ? history.split('|').filter((part) => part.indexOf('~') !== -1) : []
  parts.unshift(entry)
  return parts.slice(0, MAX_SPINS).join('|')
}

export function parseLastSpins(history: string): { winner: string; prize: string }[] {
  if (!history) return []
  const rows: { winner: string; prize: string }[] = []
  const parts = history.split('|')
  for (let i = 0; i < parts.length; i++) {
    const bits = parts[i].split('~')
    if (bits.length < 2) continue
    rows.push({ winner: bits[0], prize: bits[1] })
  }
  return rows
}

function sanitize(value: string, max: number): string {
  const clean = value.replace(/[|~]/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max)
}
