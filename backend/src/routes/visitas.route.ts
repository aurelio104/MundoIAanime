// src/routes/visitas.route.ts
import { Router } from 'express'
import axios from 'axios'
import Visit from '../models/Visit.model.js'
import { obtenerVisitas } from '../controllers/visitas.controller.js'

const router = Router()

// Registrar visita (igual que ya tienes)
router.post('/visitas', async (req, res) => {
  try {
    const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ''
    const ip = ipHeader.split(',')[0].trim().replace(/^::ffff:/, '')
    const userAgent = (req.headers['user-agent'] as string) || 'Desconocido'

    let location: Record<string, string | undefined> = {}
    const isLocal = ip === '127.0.0.1' || ip === '::1'
    if (!isLocal) {
      try {
        const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 })
        location = { country: data?.country_name, city: data?.city, region: data?.region }
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

// GET con paginación
router.get('/visitas', obtenerVisitas)

export default router
