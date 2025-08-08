// ✅ FILE: src/routes/admin.routes.ts
import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'

import {
  obtenerUsuariosConPagoPendiente,
  obtenerUsuariosConPagoVerificado
} from '../memory/memory.mongo.js'

import {
  listarPedidos,
  obtenerPedido,
  actualizarEstadoPedido
} from '../controllers/admin.pedidos.controller.js'

const router: RouterType = Router()

// 📦 GET /api/admin/pendientes – Usuarios con pago pendiente (memoria)
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

// ✅ GET /api/admin/verificados – Usuarios con pago verificado (memoria)
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

/**
 * 🧾 Pedidos (persistidos en Mongo con el modelo Pedido)
 * Estas rutas consumen los controladores:
 *  - listarPedidos         => GET  /api/admin/pedidos
 *  - obtenerPedido         => GET  /api/admin/pedidos/:id
 *  - actualizarEstadoPedido=> PUT  /api/admin/pedidos/:id
 */

// ✅ GET /api/admin/pedidos – Lista completa de pedidos
router.get('/pedidos', listarPedidos)

// ✅ GET /api/admin/pedidos/:id – Detalle de un pedido por ID
router.get('/pedidos/:id', obtenerPedido)

// ✅ PUT /api/admin/pedidos/:id – Actualizar estado del pedido
router.put('/pedidos/:id', actualizarEstadoPedido)

export default router
