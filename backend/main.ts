import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Internos
import { startBot } from './src/core/client.js';
import User from './src/models/User.model.js';
import catalogAdminRoutes from './src/routes/catalog.admin.routes.js';
import adminPedidosRoute from './src/routes/admin.routes.js';
import registerAdminRoute from './src/routes/registerAdmin.route.js';
import authRoutes from './src/routes/auth.routes.js';
import tasaRoute from './src/routes/tasa.route.js';
import visitasRoute from './src/routes/visitas.route.js';
import { authMiddleware } from './src/middleware/verifyToken.js';

// Variables de entorno
dotenv.config({ path: path.resolve('.env') });
console.log('🚦 Iniciando servidor MundoIAanime + WhatsApp bot...');

// Validación crítica
if (!process.env.JWT_SECRET) throw new Error('❌ Falta definir JWT_SECRET en el .env');

const PORT = Number(process.env.PORT) || 8000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/MundoIAanime';
const SELF_URL = process.env.SELF_URL || 'https://api.mundoiaanime.com';
const isProduction = process.env.NODE_ENV === 'production';
const AUTH_FOLDER = path.resolve(process.env.AUTH_FOLDER || './auth-bot1');

// Manejo global de errores
process.on('unhandledRejection', (reason) => {
  console.error('❌ PROMESA NO MANEJADA:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ EXCEPCIÓN NO CAPTURADA:', err);
  process.exit(1);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { ssl: isProduction });
    console.log('✅ Conectado a MongoDB');

    const app: Application = express();
    app.set('trust proxy', 1); // Requerido para cookies en Koyeb

    // Orígenes permitidos
    const allowedOrigins = isProduction
      ? ['https://mundoiaanime.com', 'https://admin.mundoiaanime.com']
      : ['http://localhost:5173', 'http://localhost:4173'];

    // Seguridad HTTP + CORS
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.error('❌ Origen bloqueado por CORS:', origin);
          callback(new Error('❌ Origen no permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // Middlewares base
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: '⚠️ Demasiadas solicitudes, intenta más tarde.' }
    }));
    app.use(express.json({ limit: '10kb' }));
    app.use(cookieParser());

    // Crear carpeta auth si no existe
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
      console.log(`📁 Carpeta auth creada en: ${AUTH_FOLDER}`);
    }

    // Endpoint raíz
    app.get('/', (_req, res) => {
      res.send('✅ Servidor y bot funcionando correctamente');
    });

    // Rutas públicas
    app.use(registerAdminRoute);
    app.use('/api', authRoutes);
    app.use('/api', tasaRoute);
    app.use(visitasRoute);

    // Rutas protegidas
    app.use('/api/catalog', authMiddleware, catalogAdminRoutes);
    app.use('/api/admin', authMiddleware, adminPedidosRoute);

    // Ruta para eliminar usuario (admin)
    app.post('/api/deleteUser', authMiddleware, async (req: Request, res: Response) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Falta correo del usuario' });

      try {
        const result = await User.deleteOne({ correo: email.toLowerCase() });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
      } catch (error) {
        console.error('❌ Error al eliminar usuario:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
    });

    // Keep-alive para evitar que Koyeb duerma
    setInterval(() => {
      axios.get(`${SELF_URL}/`)
        .then(() => console.log('📡 Ping keep-alive'))
        .catch((err) => console.error('⚠️ Ping fallido:', err.message));
    }, 12 * 60 * 1000);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });

    // Iniciar bot
    await startBot(AUTH_FOLDER);
    console.log('✅ Bot iniciado correctamente');

  } catch (err) {
    console.error('❌ Error fatal en startServer():', err);
    process.exit(1);
  }
}

startServer();
