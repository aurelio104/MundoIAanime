// ✅ FILE: routes/auth.routes.ts
import { Router } from 'express'
import {
  loginController,
  logoutController,
  checkAuthController
} from '../controllers/login.controller.js'
import { authMiddleware } from '../middleware/verifyToken.js'

const router = Router()

// Public
router.post('/login', loginController)
router.post('/logout', logoutController)

// Protegido con middleware JWT
router.get('/check-auth', authMiddleware, checkAuthController)

export default router
