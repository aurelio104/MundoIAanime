// ✅ FILE: src/routes/admin.routes.ts

import { Router, type Request, type Response } from 'express'
import {
  obtenerUsuariosConPagoPendiente,
  obtenerUsuariosConPagoVerificado
} from '../memory/memory.mongo.js'

const router = Router()

// 📦 GET /api/admin/pendientes – Usuarios con pago pendiente
router.get('/pendientes', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const usuarios = await obtenerUsuariosConPagoPendiente()
    return res.status(200).json(usuarios)
  } catch (error) {
    console.error('❌ Error al obtener usuarios pendientes:', error)
    return res.status(500).json({
      error: 'Error interno al obtener usuarios con pago pendiente'
    })
  }
})

// ✅ GET /api/admin/verificados – Usuarios con pago verificado
router.get('/verificados', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const usuarios = await obtenerUsuariosConPagoVerificado()
    return res.status(200).json(usuarios)
  } catch (error) {
    console.error('❌ Error al obtener usuarios verificados:', error)
    return res.status(500).json({
      error: 'Error interno al obtener usuarios con pago verificado'
    })
  }
})

export default router
