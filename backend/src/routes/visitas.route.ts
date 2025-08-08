// ✅ FILE: src/routes/visitas.route.ts

import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'
import axios from 'axios'
import Visit from '../models/Visit.model.js'

const router: RouterType = Router()

router.post('/visitas', async (req: Request, res: Response): Promise<Response> => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp

    const userAgent = req.headers['user-agent'] || 'Desconocido'

    // 🌍 Obtener ubicación por IP
    let location = {}

    if (ip && typeof ip === 'string' && !ip.startsWith('::1') && ip !== '127.0.0.1') {
      try {
        const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
          timeout: 3000
        })

        location = {
          country: data.country_name,
          city: data.city,
          region: data.region
        }
} catch (geoErr) {
  const err = geoErr as Error
  console.warn('⚠️ Error obteniendo ubicación por IP:', err.message)
}

    }

    const visita = new Visit({ ip, userAgent, location })
    await visita.save()

    return res.status(201).json({ success: true })
  } catch (error) {
    console.error('❌ Error registrando visita:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

export default router
