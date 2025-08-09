// ✅ FILE: src/main.ts
import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction
} from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

// Internos
import { startBot } from './core/client.js'
import User from './models/User.model.js'
import PedidoModel from './models/Pedido.model.js'
import catalogAdminRoutes from './routes/catalog.admin.routes.js'
import adminPedidosRoute from './routes/admin.routes.js'
import registerAdminRoute from './routes/registerAdmin.route.js'
import authRoutes from './routes/auth.routes.js'
import tasaRoute from './routes/tasa.route.js'
import visitasRoute from './routes/visitas.route.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import { authMiddleware } from './middleware/verifyToken.js'

// Variables de entorno
dotenv.config({ path: path.resolve('.env') })
console.log('🚦 Iniciando servidor MundoIAanime + WhatsApp bot...')

// Validaciones críticas
const PORT = Number(process.env.PORT) || 8000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/MundoIAanime'
const SELF_URL = (process.env.SELF_URL || 'https://api.mundoiaanime.com').replace(/\/+$/, '')
const isProduction = process.env.NODE_ENV === 'production'
const AUTH_FOLDER = path.resolve(process.env.AUTH_FOLDER || './auth-bot1')
const ENABLE_KEEPALIVE = (process.env.ENABLE_KEEPALIVE ?? 'true') !== 'false'

if (!process.env.JWT_SECRET) {
  throw new Error('❌ Falta definir JWT_SECRET en el .env')
}

process.on('unhandledRejection', (reason) => {
  console.error('❌ PROMESA NO MANEJADA:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('❌ EXCEPCIÓN NO CAPTURADA:', err)
  process.exit(1)
})

/** 🧰 Arreglo de índices para la colección de pedidos
 *  - Elimina un índice único incorrecto en `id`
 *  - Asegura el índice único correcto en `idCompra`
 */
async function fixPedidoIndexes() {
  try {
    // Quita el índice malo si existe: id_1
    await PedidoModel.collection.dropIndex('id_1').catch(() => {})
    // Asegura el índice único correcto
    await PedidoModel.collection.createIndex({ idCompra: 1 }, { unique: true })
    console.log('✅ Índices de Pedido verificados/corregidos')
  } catch (e) {
    console.error('⚠️ No se pudieron ajustar índices de Pedido:', e)
  }
}

async function startServer() {
  // para clearInterval/close tip-safe
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null
  let server: ReturnType<Application['listen']> | null = null

  try {
    // Conexión MongoDB
    await mongoose.connect(MONGO_URI, {
      ssl: isProduction,
      serverSelectionTimeoutMS: 10_000
    })
    console.log('✅ Conectado a MongoDB')

    // Fix índices de pedidos (evita E11000 dup key { id: null })
    await fixPedidoIndexes()

    const app: Application = express()
    app.set('trust proxy', true) // confía en proxies (Vercel/Koyeb)

    // Orígenes permitidos
    const envAllowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const defaultAllowedProd = [
      'https://mundoiaanime.com',
      'https://admin.mundoiaanime.com'
    ]
    const defaultAllowedDev = ['http://localhost:5173', 'http://localhost:4173']

    const allowedOrigins = isProduction
      ? envAllowed.length
        ? envAllowed
        : defaultAllowedProd
      : defaultAllowedDev

    const isAllowedOrigin = (origin?: string) => {
      if (!origin) return true
      try {
        if (allowedOrigins.includes(origin)) return true
        const { hostname, protocol } = new URL(origin)
        if (!/^https?:$/.test(protocol)) return false
        if (hostname === 'mundoiaanime.com' || hostname.endsWith('.mundoiaanime.com')) return true
        return false
      } catch {
        return false
      }
    }

    // Seguridad HTTP + CORS
    app.use(helmet({ contentSecurityPolicy: false }))
    app.use(
      cors({
        origin: (origin, callback) => {
          if (isAllowedOrigin(origin || undefined)) return callback(null, true)
          console.error('❌ Origen bloqueado por CORS:', origin)
          return callback(new Error('Origen no permitido por CORS'))
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      })
    )
    app.options('*', cors())

    // Rate limit con excepciones + IP real
    const EXEMPT = new Set<string>([
      '/',
      '/healthz',
      '/api/check-auth',
      '/api/login',
      '/api/logout',
      '/api/tasa-bcv'
    ])

    const limiter = rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request): string => {
        const xrHeader = req.headers['x-real-ip']
        const xr = typeof xrHeader === 'string' ? xrHeader : undefined

        const xffHeader = req.headers['x-forwarded-for']
        const xffRaw = Array.isArray(xffHeader) ? xffHeader[0] : xffHeader
        const xff =
          typeof xffRaw === 'string' ? xffRaw.split(',')[0]?.trim() : undefined

        const ip: string = xr ?? xff ?? req.ip ?? 'unknown'
        return ip
      },
      skip: (req: Request): boolean => {
        const url = (req.originalUrl || req.url || '').split('?')[0]
        return req.method === 'OPTIONS' || EXEMPT.has(url)
      },
      handler: (req, res, _next, opts) => {
        const xrHeader = req.headers['x-real-ip']
        const xr = typeof xrHeader === 'string' ? xrHeader : undefined
        const xffHeader = req.headers['x-forwarded-for']
        const xffRaw = Array.isArray(xffHeader) ? xffHeader[0] : xffHeader
        const xff =
          typeof xffRaw === 'string' ? xffRaw.split(',')[0]?.trim() : undefined
        const ip: string = xr ?? xff ?? req.ip ?? 'unknown'
        console.warn('429 rate-limited:', ip, req.method, req.originalUrl)
        res
          .status(opts.statusCode || 429)
          .json({ error: '⚠️ Demasiadas solicitudes, intenta en unos segundos.' })
      }
    })
    app.use(limiter)

    // Parsers
    app.use(express.json({ limit: '100kb' }))
    app.use(cookieParser())

    // Carpeta de autenticación del bot
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true })
      console.log(`📁 Carpeta auth creada en: ${AUTH_FOLDER}`)
    }

    // Healthcheck y raíz
    app.get('/healthz', (_req, res) => {
      res.status(200).json({
        ok: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      })
    })

    app.get('/', (_req, res) => {
      res.status(200).send('✅ Servidor y bot funcionando correctamente')
    })

    // Rutas públicas
    app.use(registerAdminRoute)
    app.use('/api', authRoutes) // /api/login, /api/logout, /api/check-auth
    app.use('/api', tasaRoute) // /api/tasa-bcv
    app.use('/api', visitasRoute) // /api/visitas
    app.use('/api/pedidos', pedidosRoutes) // /api/pedidos (POST, GET, PATCH)

    // Rutas privadas protegidas
    app.use('/api/catalog', authMiddleware, catalogAdminRoutes)
    app.use('/api/admin', authMiddleware, adminPedidosRoute)

    // Admin: eliminar usuario
    app.post('/api/deleteUser', authMiddleware, async (req: Request, res: Response) => {
      const { email } = req.body
      if (!email) return res.status(400).json({ error: 'Falta correo del usuario' })
      try {
        const result = await User.deleteOne({ correo: String(email).toLowerCase() })
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
        return res.status(200).json({ message: 'Usuario eliminado exitosamente' })
      } catch (error) {
        console.error('❌ Error al eliminar usuario:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
      }
    })

    // 404 handler
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'Ruta no encontrada' })
    })

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('💥 Error middleware:', err)
      if (res.headersSent) return
      res
        .status(err?.status || 500)
        .json({ error: err?.message || 'Error interno del servidor' })
    })

    // Keep-alive (solo prod)
    if (isProduction && ENABLE_KEEPALIVE && SELF_URL.startsWith('http')) {
      keepAliveTimer = setInterval(() => {
        axios
          .get(`${SELF_URL}/healthz`, { timeout: 5000 })
          .then(() => console.log('📡 Ping keep-alive OK'))
          .catch((err) => console.error('⚠️ Ping fallido:', err?.message || err))
      }, 12 * 60 * 1000)
    }

    // Iniciar servidor
    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`)
    })

    // Iniciar bot (no tumbar server si falla)
    startBot(AUTH_FOLDER)
      .then(() => console.log('✅ Bot iniciado correctamente'))
      .catch((e) => console.error('❌ Error iniciando bot (continuo sin bot):', e))

    // Apagado limpio
    const shutdown = async (signal: string) => {
      console.log(`🛑 Recibido ${signal}, cerrando...`)
      try {
        if (keepAliveTimer) clearInterval(keepAliveTimer)
        if (server) {
          await new Promise<void>((resolve) => server!.close(() => resolve()))
          console.log('🔌 HTTP server cerrado')
        }
        await mongoose.disconnect()
        console.log('🔌 MongoDB desconectado')
      } catch (e) {
        console.error('⚠️ Error en shutdown:', e)
      } finally {
        process.exit(0)
      }
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (err) {
    console.error('❌ Error fatal en startServer():', err)
    process.exit(1)
  }
}

startServer()
