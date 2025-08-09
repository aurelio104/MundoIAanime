// ✅ FILE: src/routes/tasa.route.ts
import { Router } from 'express'
import axios from 'axios'

const router = Router()

type CacheTasa = {
  tasa: number
  fecha: string
  fuente: string
  ts: number
}
let cache: CacheTasa | null = null
const TTL_MS = 5 * 60 * 1000 // 5 min

router.get('/tasa-bcv', async (_req, res) => {
  try {
    // Sirve cache fresca
    if (cache && Date.now() - cache.ts < TTL_MS) {
      return res.set('Cache-Control', 'public, max-age=60').json(cache)
    }

    // 1) Intenta endpoint directo "oficial"
    // Docs: https://ve.dolarapi.com/v1/dolares/oficial
    // (schema incluye "promedio", "fechaActualizacion", "fuente")
    const r1 = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial', { timeout: 9000 })
    let data: any = r1.data

    // 2) Fallback: lista completa si el host cambia algo
    if (!data?.promedio) {
      const r2 = await axios.get('https://ve.dolarapi.com/v1/dolares', { timeout: 9000 })
      const arr = Array.isArray(r2.data) ? r2.data : []
      data = arr.find((x: any) =>
        x?.fuente?.toLowerCase?.() === 'oficial' ||
        x?.nombre?.toLowerCase?.().includes('oficial')
      )
    }

    const tasa = Number(data?.promedio)
    if (!Number.isFinite(tasa) || tasa <= 0) throw new Error('Tasa inválida')

    cache = {
      tasa,
      fecha: data?.fechaActualizacion ?? new Date().toISOString(),
      fuente: data?.fuente ?? data?.nombre ?? 'BCV',
      ts: Date.now()
    }

    return res.set('Cache-Control', 'public, max-age=60').json(cache)
  } catch (e) {
    console.error('❌ /tasa-bcv error:', (e as Error)?.message || e)
    // Sirve cache vieja si hay (mejor UX)
    if (cache) {
      return res.set('Cache-Control', 'no-store').json({ ...cache, stale: true })
    }
    return res.status(502).json({ error: 'No se pudo obtener la tasa del BCV' })
  }
})

export default router
