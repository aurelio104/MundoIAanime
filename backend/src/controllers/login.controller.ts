// ✅ FILE: controllers/login.controller.ts

import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { compare } from 'bcryptjs'
import User from '../models/User.model.js'
import { AuthenticatedRequest } from '../middleware/verifyToken.js'

const isProduction = process.env.NODE_ENV === 'production'

/* 
  🔐 POST /api/login
  Inicia sesión, valida credenciales, crea token y lo guarda en cookie segura
*/
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Credenciales incompletas' })
  }

  try {
    const user = await User.findOne({ correo: email.toLowerCase() }).select('+password')

    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { userId: user._id, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    )

    // 🍪 Guardar token en cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // Necesario para cross-site (Vercel ↔ Koyeb)
      domain: '.mundoiaanime.com', // Para compartir cookie entre subdominios
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    })

    console.log(`✅ Login exitoso para ${user.correo}`)

    return res.status(200).json({ message: 'Login exitoso' })
  } catch (error) {
    console.error('❌ Error en loginController:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/*
  🔐 POST /api/logout
  Elimina la cookie de sesión
*/
export const logoutController = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: '.mundoiaanime.com',
    path: '/',
  })

  console.log('👋 Cookie de sesión eliminada')
  return res.status(200).json({ message: 'Sesión cerrada con éxito' })
}

/*
  🔐 GET /api/check-auth
  Verifica que el token sea válido y retorna info del usuario
*/
export const checkAuthController = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const { userId, correo, rol } = req.user

  console.log(`🔐 Usuario autenticado: ${correo}`)

  return res.status(200).json({
    authenticated: true,
    user: { userId, correo, rol }
  })
}
