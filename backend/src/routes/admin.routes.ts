// ✅ FILE: src/routes/admin.routes.ts

import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'

import {
  obtenerUsuariosConPagoPendiente,
  obtenerUsuariosConPagoVerificado,
  obtenerTodosLosPedidos // ✅ asegúrate de tener esta función en tu storage
} from '../memory/memory.mongo.js'

const router: RouterType = Router()

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

// ✅ GET /api/admin/pedidos – Lista completa de pedidos
router.get('/pedidos', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const pedidos = await obtenerTodosLosPedidos()
    return res.status(200).json(pedidos)
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error)
    return res.status(500).json({
      error: 'Error interno al obtener pedidos'
    })
  }
})

export default router
