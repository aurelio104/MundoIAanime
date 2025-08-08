// ✅ FILE: routes/auth.routes.ts

import {
  Router,
  type Router as RouterType
} from 'express'
import {
  loginController,
  logoutController,
  checkAuthController
} from '../controllers/login.controller.js'
import { authMiddleware } from '../middleware/verifyToken.js'

const router: RouterType = Router()

// 🔓 Rutas públicas
router.post('/login', loginController)
router.post('/logout', logoutController)

// 🔐 Ruta protegida para verificar si el token es válido
router.get('/check-auth', authMiddleware, checkAuthController)

export default router
