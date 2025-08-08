// ✅ FILE: src/routes/visitas.route.ts
import { Router } from 'express'
import axios from 'axios'
import Visit from '../models/Visit.model.js'
import { obtenerVisitas } from '../controllers/visitas.controller.js'

// 👇 Anotación explícita para evitar TS2742 con pnpm/tsup
const router: import('express').Router = Router()

/** Normaliza IP: respeta proxies (X-Forwarded-For) y ::ffff: */
function getClientIp(req: import('express').Request): string {
  const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ''
  return ipHeader.split(',')[0].trim().replace(/^::ffff:/, '')
}

/** Evalúa si la IP es local para saltar geolocalización */
function isLocalIp(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
}

// ✅ POST /api/visitas — registrar visita con IP y geolocalización
router.post('/visitas', async (req: import('express').Request, res: import('express').Response) => {
  try {
    const ip = getClientIp(req)
    const userAgent = (req.headers['user-agent'] as string) || 'Desconocido'

    let location: Record<string, string | undefined> = {}

    if (!isLocalIp(ip)) {
      try {
        const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 })
        location = {
          country: data?.country_name,
          city: data?.city,
          region: data?.region
        }
      } catch (err: any) {
        console.warn('⚠️ Geo falló:', err?.message || err)
      }
    }

    await new Visit({ ip, userAgent, location }).save()
    return res.status(201).json({ success: true })
  } catch (error) {
    console.error('❌ Error registrando visita:', error)
    return res.status(500).json({ success: false, error: 'Error interno del servidor' })
  }
})

// ✅ GET /api/visitas — listado/resumen con paginación (controlador)
router.get('/visitas', obtenerVisitas)

export default router
