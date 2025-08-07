// ✅ FILE: routes/auth.routes.ts

import { Router, type Router as RouterType } from 'express'
import {
  loginController,
  logoutController,
  checkAuthController
} from '../controllers/login.controller.js'
import { authMiddleware } from '../middleware/verifyToken.js'

// ✅ Tipado explícito para evitar TS2742
const router: RouterType = Router()

// Public
router.post('/login', loginController)
router.post('/logout', logoutController)

// Protegido con middleware JWT
router.get('/check-auth', authMiddleware, checkAuthController)

export default router
