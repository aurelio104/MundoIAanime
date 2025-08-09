// ✅ FILE: src/routes/pedidos.routes.ts
import { Router } from 'express'
import type { Router as ExpressRouter, Request, Response } from 'express'

import {
  registrarPedido,
  obtenerPedidosPublic,
  confirmarPedido,
} from '../controllers/pedidos.controller.js'

/**
 * Montaje en el servidor:
 *   import pedidosRoutes from './routes/pedidos.routes.js'
 *   app.use('/api/pedidos', pedidosRoutes)
 *
 * Endpoints:
 *   POST   /api/pedidos                 -> registrarPedido
 *   GET    /api/pedidos                 -> obtenerPedidosPublic  (opcional)
 *   PATCH  /api/pedidos/:id/confirmar   -> confirmarPedido
 */

const router: ExpressRouter = Router()

// Crear pedido desde el sitio público (web)
router.post('/', (req: Request, res: Response) => void registrarPedido(req, res))

// (Opcional) Listar pedidos públicamente. Si prefieres solo admin, elimina esta línea.
router.get('/', (req: Request, res: Response) => void obtenerPedidosPublic(req, res))

// Confirmar un pedido (si la mantienes pública; si no, muévela a /api/admin)
router.patch('/:id/confirmar', (req: Request, res: Response) => void confirmarPedido(req, res))

export default router
