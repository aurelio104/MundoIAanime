// ✅ FILE: routes/registerAdmin.route.ts

import { Router, type Router as RouterType, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import { authMiddleware } from '../middleware/verifyToken.js'

// ✅ Tipado explícito para evitar TS2742
const router: RouterType = Router()

// 📌 Ruta protegida para crear nuevos administradores
router.post('/api/register-admin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Datos inválidos: email o contraseña incorrecta' })
    }

    const existing = await User.findOne({ correo: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un administrador con ese correo' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = new User({
      correo: email.toLowerCase(),
      password: hashedPassword,
      rol: 'admin',
    })

    await admin.save()

    return res.status(201).json({ message: '✅ Administrador creado correctamente' })
  } catch (err) {
    console.error('❌ Error al registrar administrador:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
