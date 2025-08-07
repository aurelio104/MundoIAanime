import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'
import Visit from '../models/Visit.model.js'

const router: RouterType = Router()

router.post('/api/visitas', async (req: Request, res: Response): Promise<Response> => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

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
