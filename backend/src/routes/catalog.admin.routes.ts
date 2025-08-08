// ✅ FILE: src/routes/catalog.admin.routes.ts

import { Router, type Request, type Response } from 'express'
import {
  obtenerColecciones,
  obtenerColeccion,
  crearColeccion,
  editarColeccion,
  eliminarColeccion,
  agregarProducto,
  editarProducto,
  eliminarProducto
} from '../controllers/catalog.controller.js'

import { authMiddleware } from '../middleware/verifyToken.js'

const router: Router = Router()

// 🔐 Middleware global: protege todas las rutas del catálogo
router.use(authMiddleware)

// 📦 RUTAS DE COLECCIONES (CRUD)
router.get('/admin/colecciones', obtenerColecciones)                  // GET todas
router.get('/admin/colecciones/:id', obtenerColeccion)               // GET una
router.post('/admin/colecciones', crearColeccion)                    // CREATE
router.put('/admin/colecciones/:id', editarColeccion)                // UPDATE
router.delete('/admin/colecciones/:id', eliminarColeccion)           // DELETE

// 🛍️ RUTAS DE PRODUCTOS DENTRO DE COLECCIONES (CRUD anidado)
router.post('/admin/colecciones/:id/productos', agregarProducto)                       // CREATE producto
router.put('/admin/colecciones/:id/productos/:pid', editarProducto)                    // UPDATE producto
router.delete('/admin/colecciones/:id/productos/:pid', eliminarProducto)               // DELETE producto

export default router
