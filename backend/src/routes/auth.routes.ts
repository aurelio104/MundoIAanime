// ✅ FILE: routes/auth.routes.ts
import { Router } from 'express'
import {
  loginController,
  logoutController,
  checkAuthController
} from '../controllers/login.controller.js'
import { authMiddleware } from '../middleware/verifyToken.js'

const router = Router()

router.post('/login', loginController)
router.post('/logout', logoutController)
router.get('/check-auth', authMiddleware, checkAuthController)

export default router
