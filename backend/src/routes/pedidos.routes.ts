// ✅ FILE: src/routes/pedidos.routes.ts
import { Router } from 'express'
import type { Router as ExpressRouter, Request, Response } from 'express'
import type { HydratedDocument } from 'mongoose'
import PedidoModel from '../models/Pedido.model.js'
import type { IPedido } from '../models/Pedido.model.js'

// Anotar el tipo del router evita TS2742 en builds (Heroku/Koyeb/tsup)
const router: ExpressRouter = Router()

// 💵 Mapa de precios por título (ajústalo a tus cursos)
const PRICE_MAP_USD: Record<string, number> = {
  'Crea Caminatas Apocalípticas con personajes usando IA': 9.99,
  'Crea Videos de Anime en Live Action Estilo Selfie con IA': 9.99,
  'Crea Videos de Anime en Live Action Cinematográficos con IA': 9.99,
  'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA': 9.99
}

// 🧰 Utilidades
const sanitize = (s: unknown): string => (typeof s === 'string' ? s.trim() : '')
const genId = (): string => Math.random().toString(36).substring(2, 10).toUpperCase()
const isEmail = (e: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

// 👉 POST /api/pedidos — crea pedido público
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1) Tomar datos mínimos del body
    const cursoTitulo = sanitize(req.body?.cursoTitulo)
    const nombre = sanitize(req.body?.nombre)
    const apellido = sanitize(req.body?.apellido)
    const correo = sanitize(req.body?.correo).toLowerCase()
    const canal = (sanitize(req.body?.canal) || 'web') as 'web' | 'whatsapp' | 'otro'

    // 2) Validar requeridos
    if (!cursoTitulo || !nombre || !apellido || !correo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }
    if (!isEmail(correo)) {
      return res.status(400).json({ error: 'Correo inválido' })
    }

    // 3) Resolver precio en backend siempre (no confiar en el front)
    const precioUSD = PRICE_MAP_USD[cursoTitulo] ?? 9.99
    const precioTexto = `$${precioUSD.toFixed(2)}`

    // 4) Asegurar idCompra válido y único (máx 3 intentos)
    let idCompra = sanitize(req.body?.idCompra).toUpperCase()
    if (!/^[A-Z0-9]{6,12}$/.test(idCompra)) idCompra = genId()

    let intentos = 0
    let saved: HydratedDocument<IPedido> | null = null

    // Construir documento base (el schema normaliza/valida)
    const baseDoc: Partial<IPedido> & Record<string, any> = {
      idCompra,
      cursoTitulo,
      precioUSD,
      precioTexto, // el schema también tiene default por si faltara
      estado: 'pendiente',
      nombre,
      apellido,
      correo,
      canal,
      metodoPago: sanitize(req.body?.metodoPago) || undefined,
      telefono: sanitize(req.body?.telefono) || undefined
    }

    // Incluir datosPago solo si llega algo útil
    const refPago = sanitize(req.body?.datosPago?.referencia)
    const fechaPago = sanitize(req.body?.datosPago?.fecha)
    if (refPago || fechaPago) {
      baseDoc.datosPago = {
        referencia: refPago || undefined,
        fecha: fechaPago || undefined
      }
    }

    // 5) Reintentar si el idCompra choca con índice unique (Mongo 11000)
    while (intentos < 3) {
      try {
        if (intentos > 0) {
          baseDoc.idCompra = genId()
        }
        saved = await PedidoModel.create(baseDoc)
        break
      } catch (e: any) {
        // Colisión por idCompra duplicado → reintentar con nuevo id
        if (e?.code === 11000 && e?.keyPattern?.idCompra) {
          intentos++
          continue
        }
        // Errores de validación del modelo → 400 con detalle
        if (e?.name === 'ValidationError') {
          const msg = Object.values(e.errors || {})
            .map((x: any) => x?.message)
            .filter(Boolean)
            .join(', ')
          return res.status(400).json({ error: msg || 'Datos inválidos' })
        }
        // Otro error inesperado
        console.error('❌ Error al crear pedido:', e)
        return res.status(500).json({ error: 'Error al guardar el pedido' })
      }
    }

    if (!saved) {
      return res.status(409).json({ error: 'No fue posible generar un idCompra único' })
    }

    // 6) Responder limpio (aprovecha transform de toJSON: id en vez de _id)
    const json = saved.toJSON?.() ?? saved
    return res.status(201).json({ ok: true, pedido: json })
  } catch (e) {
    console.error('❌ /api/pedidos POST fallo inesperado:', e)
    return res.status(500).json({ error: 'Error al guardar el pedido' })
  }
})

export default router
