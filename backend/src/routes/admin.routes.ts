// ✅ FILE: src/routes/admin.routes.ts
import { Router } from 'express'

import {
  obtenerUsuariosConPagoPendiente,
  obtenerUsuariosConPagoVerificado
} from '../memory/memory.mongo.js'

import {
  listarPedidos,
  obtenerPedido,
  actualizarEstadoPedido
} from '../controllers/admin.pedidos.controller.js'

/**
 * Recuerda montarlo con auth middleware:
 *   import adminRoutes from './routes/admin.routes.js'
 *   app.use('/api/admin', authMiddleware, adminRoutes)
 *
 * Endpoints resultantes:
 *   GET    /api/admin/pendientes
 *   GET    /api/admin/verificados
 *   GET    /api/admin/pedidos
 *   GET    /api/admin/pedidos/:id
 *   PUT    /api/admin/pedidos/:id
 */

const router = Router()

// 📦 Usuarios con pago pendiente (memoria)
router.get('/pendientes', async (_req, res) => {
  try {
    const usuarios = await obtenerUsuariosConPagoPendiente()
    res.status(200).json(usuarios)
  } catch (error) {
    console.error('❌ Error al obtener usuarios pendientes:', error)
    res.status(500).json({ error: 'Error interno al obtener usuarios con pago pendiente' })
  }
})

// ✅ Usuarios con pago verificado (memoria)
router.get('/verificados', async (_req, res) => {
  try {
    const usuarios = await obtenerUsuariosConPagoVerificado()
    res.status(200).json(usuarios)
  } catch (error) {
    console.error('❌ Error al obtener usuarios verificados:', error)
    res.status(500).json({ error: 'Error interno al obtener usuarios con pago verificado' })
  }
})

/* 🧾 Pedidos (persistidos en Mongo con PedidoModel) */
router.get('/pedidos', listarPedidos)
router.get('/pedidos/:id', obtenerPedido)
router.put('/pedidos/:id', actualizarEstadoPedido)

export default router
