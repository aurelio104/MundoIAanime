// ✅ FILE: routes/registerAdmin.route.ts
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js' // asegúrate de usar extensión .js si estás usando módulos ES
import { authMiddleware } from '../middleware/verifyToken.js'

const router = Router()

// 📌 Ruta protegida para crear nuevos administradores (uso inicial o dashboard)
router.post('/api/register-admin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validación básica
    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Datos inválidos: email o contraseña incorrecta' })
    }

    // Evitar duplicados
    const existing = await User.findOne({ correo: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un administrador con ese correo' })
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear nuevo usuario
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
