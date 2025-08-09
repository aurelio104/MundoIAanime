// ✅ FILE: src/routes/pedidos.routes.ts
import { Router } from 'express'
import {
  registrarPedido,
  obtenerPedidosPublic,
  confirmarPedido
} from '../controllers/pedidos.controller.js'

/**
 * Nota de montaje:
 * En tu main/server:
 *   import pedidosRoutes from './routes/pedidos.routes.js'
 *   app.use('/api/pedidos', pedidosRoutes)
 *
 * Así, estas rutas quedan:
 *   POST   /api/pedidos              -> registrarPedido
 *   GET    /api/pedidos              -> obtenerPedidosPublic  (opcional para admin)
 *   PATCH  /api/pedidos/:id/confirmar -> confirmarPedido
 */

const router = Router()

// Crear pedido desde el sitio público (web)
router.post('/', registrarPedido)

// (Opcional) Listar pedidos públicamente. Si prefieres solo admin, elimina esta línea.
router.get('/', obtenerPedidosPublic)

// Confirmar un pedido (si mantienes esta ruta pública; de lo contrario muévelo a admin)
router.patch('/:id/confirmar', confirmarPedido)

export default router
