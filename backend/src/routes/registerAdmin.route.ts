// ✅ FILE: src/routes/registerAdmin.route.ts

import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import { authMiddleware } from '../middleware/verifyToken.js'

// ✅ Corrección: anotación explícita del tipo Router
const router: RouterType = Router()

// 🔐 POST /api/register-admin – Registrar nuevo administrador (requiere token)
router.post('/api/register-admin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // 📌 Validación básica
    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: '❌ Datos inválidos: el correo debe ser texto y la contraseña mínimo 8 caracteres'
      })
    }

    // 🔍 Verificar si ya existe
    const existente = await User.findOne({ correo: email.toLowerCase() })
    if (existente) {
      return res.status(400).json({ error: '⚠️ Ya existe un administrador con ese correo' })
    }

    // 🔐 Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // ✅ Crear nuevo admin
    const admin = new User({
      correo: email.toLowerCase(),
      password: hashedPassword,
      rol: 'admin'
    })

    await admin.save()

    return res.status(201).json({ message: '✅ Administrador creado correctamente' })
  } catch (err) {
    console.error('❌ Error al registrar administrador:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
