// ✅ FILE: src/routes/catalog.admin.routes.ts

import express, { Router } from 'express'
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

const router: Router = express.Router()

// 🔐 Middleware global para proteger todas las rutas del módulo
router.use(authMiddleware)

// 📦 Rutas de Colecciones
router.get('/admin/colecciones', obtenerColecciones)
router.get('/admin/colecciones/:id', obtenerColeccion)
router.post('/admin/colecciones', crearColeccion)
router.put('/admin/colecciones/:id', editarColeccion)
router.delete('/admin/colecciones/:id', eliminarColeccion)

// 🛍️ Rutas de Productos dentro de colecciones
router.post('/admin/colecciones/:id/productos', agregarProducto)
router.put('/admin/colecciones/:id/productos/:pid', editarProducto)
router.delete('/admin/colecciones/:id/productos/:pid', eliminarProducto)

export default router
