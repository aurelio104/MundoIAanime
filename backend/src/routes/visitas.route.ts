// ✅ FILE: src/routes/visitas.route.ts

import { Router, type Request, type Response } from 'express'
import Visit from '../models/Visit.model.js'

const router = Router()

// ✅ POST /api/visitas – Registrar nueva visita
router.post('/visitas', async (req: Request, res: Response): Promise<Response> => {
  try {
    // 🛡️ Obtener IP desde encabezados (soporte para proxies)
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp

    // 🧠 Obtener user-agent del navegador
    const userAgent = req.headers['user-agent'] || 'Desconocido'

    // 💾 Crear y guardar la visita
    const visita = new Visit({ ip, userAgent })
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
