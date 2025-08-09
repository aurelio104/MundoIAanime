// ✅ FILE: src/routes/pedidos.routes.ts
import { Router, type Request, type Response } from 'express'
import PedidoModel from '../models/Pedido.model.js'

const router = Router()

// Mapa de precios por título (ajústalo a tus cursos)
const PRICE_MAP_USD: Record<string, number> = {
  'Crea Caminatas Apocalípticas con personajes usando IA': 9.99,
  'Crea Videos de Anime en Live Action Estilo Selfie con IA': 9.99,
  'Crea Videos de Anime en Live Action Cinematográficos con IA': 9.99,
  'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA': 9.99,
}

// Utilidades
const sanitize = (s: unknown) => (typeof s === 'string' ? s.trim() : '')
const genId = () => Math.random().toString(36).substring(2, 10).toUpperCase()
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

// 👉 POST /api/pedidos — crea pedido público
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1) Tomar datos mínimos
    const cursoTitulo = sanitize(req.body?.cursoTitulo)
    const nombre = sanitize(req.body?.nombre)
    const apellido = sanitize(req.body?.apellido)
    const correo = sanitize(req.body?.correo).toLowerCase()
    const canal = (sanitize(req.body?.canal) || 'web') as 'web' | 'whatsapp' | 'otro'

    // 2) Validar
    if (!cursoTitulo || !nombre || !apellido || !correo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }
    if (!isEmail(correo)) {
      return res.status(400).json({ error: 'Correo inválido' })
    }

    // 3) Resolver precio en backend
    const precioUSD = PRICE_MAP_USD[cursoTitulo] ?? 9.99
    const precioTexto = `$${precioUSD.toFixed(2)}`

    // 4) Asegurar idCompra único (máx 3 intentos)
    let idCompra = sanitize(req.body?.idCompra)
    if (!/^[A-Z0-9]{6,12}$/.test(idCompra)) {
      idCompra = genId()
    }

    let intentos = 0
    let saved: any = null
    // datosPago vacío por defecto; se llenará al verificar pago
    const baseDoc = {
      idCompra,
      cursoTitulo,
      precioUSD,
      precioTexto,
      estado: 'pendiente' as const,
      nombre,
      apellido,
      correo,
      canal,
      metodoPago: sanitize(req.body?.metodoPago) || undefined,
      datosPago: {
        referencia: sanitize(req.body?.datosPago?.referencia) || undefined,
        fecha: sanitize(req.body?.datosPago?.fecha) || undefined,
      },
      telefono: sanitize(req.body?.telefono) || undefined,
    }

    // 5) Reintentar si el idCompra choca con unique
    //    (código de error Mongo 11000)
    //    Hacemos como máximo 3 reintentos con id nuevo.
    //    En caso de otras fallas -> 500 con detalle.
    //    Si todo bien -> 201.
    while (intentos < 3) {
      try {
        // Si no es el primer intento, regen id
        if (intentos > 0) {
          baseDoc.idCompra = genId()
        }
        saved = await PedidoModel.create(baseDoc)
        break
      } catch (e: any) {
        if (e?.code === 11000 && e?.keyPattern?.idCompra) {
          intentos++
          continue
        }
        // Otro error de validación
        if (e?.name === 'ValidationError') {
          const msg = Object.values(e.errors || {})
            .map((x: any) => x?.message)
            .filter(Boolean)
            .join(', ')
          return res.status(400).json({ error: msg || 'Datos inválidos' })
        }
        console.error('❌ Error al crear pedido:', e)
        return res.status(500).json({ error: 'Error al guardar el pedido' })
      }
    }

    if (!saved) {
      return res.status(409).json({ error: 'No fue posible generar un idCompra único' })
    }

    // 6) Responder limpio (usa tu toJSON del schema)
    return res.status(201).json({
      ok: true,
      pedido: saved.toJSON?.() ?? saved
    })
  } catch (e) {
    console.error('❌ /api/pedidos POST fallo inesperado:', e)
    return res.status(500).json({ error: 'Error al guardar el pedido' })
  }
})

export default router
