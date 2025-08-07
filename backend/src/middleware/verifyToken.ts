// ✅ FILE: middleware/verifyToken.ts
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

// ✨ Extiende Request para incluir datos del usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    correo: string
    rol: string
  }
}

const isProduction = process.env.NODE_ENV === 'production'

// 🔐 Middleware para verificar token JWT desde cookies
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response => {
  const token = req.cookies?.token

  if (!token) {
    if (!isProduction) {
      console.warn('⛔ No se encontró token en las cookies')
    }
    return res.status(401).json({ error: 'No autenticado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    if (
      typeof decoded !== 'object' ||
      !decoded.userId ||
      !decoded.correo ||
      !decoded.rol
    ) {
      if (!isProduction) {
        console.warn('⛔ Token decodificado inválido:', decoded)
      }
      return res.status(401).json({ error: 'Token inválido' })
    }

    // ✅ Inyecta datos del usuario
    req.user = {
      userId: decoded.userId,
      correo: decoded.correo,
      rol: decoded.rol
    }

    next()
  } catch (error) {
    if (!isProduction) {
      console.warn('⛔ Token inválido o expirado:', error)
    }
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
