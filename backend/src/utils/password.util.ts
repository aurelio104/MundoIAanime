export function generarPassword(seed: string = ''): string {
  const base = seed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5)
  const rand = Math.random().toString(36).slice(-5)
  return `${base}${rand}`.toLowerCase()
}
