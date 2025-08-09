// ✅ FILE: src/controllers/pedidos.controller.ts
import { Request, Response } from 'express'
import PedidoModel from '../models/Pedido.model.js'

// 💵 Precios definidos en el servidor (nunca confíes en el front)
const PRECIOS: Record<string, number> = {
  'Crea Caminatas Apocalípticas con personajes usando IA': 9.99,
  'Crea Videos de Anime en Live Action Estilo Selfie con IA': 9.99,
  'Crea Videos de Anime en Live Action Cinematográficos con IA': 9.99,
  'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA': 9.99,
}

// ─────────── Utils ───────────
const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id)
const normalize = (s?: unknown) => (typeof s === 'string' ? s.trim() : '')
const normalizeEmail = (s?: unknown) =>
  (typeof s === 'string' ? s.trim().toLowerCase() : '')
const isValidEmail = (s?: unknown) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(s))

const genIdCompra = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase()

const safePedidoResponse = (p: any) => ({
  id: p._id?.toString?.() ?? p.id,
  idCompra: p.idCompra,
  estado: p.estado,
  total: p.precioUSD,
  totalTexto: p.precioTexto,
  createdAt: p.createdAt,
})

// ─────────── Controllers ───────────

/**
 * POST /api/pedidos
 * Registra un pedido desde la web. Idempotente por idCompra (si el cliente lo envía).
 */
export const registrarPedido = async (req: Request, res: Response) => {
  try {
    const {
      cursoTitulo,
      nombre,
      apellido,
      correo,
      idCompra,
      canal,
      metodoPago,
      datosPago,
      telefono,
      // fechaISO ignorada; usamos createdAt del modelo
    } = req.body || {}

    const _curso = String(normalize(cursoTitulo))
    const _nombre = String(normalize(nombre))
    const _apellido = String(normalize(apellido))
    const _correo = String(normalizeEmail(correo))
    let _idCompra = String(normalize(idCompra) || '')
    const _canal = (String(normalize(canal)) as 'web' | 'whatsapp' | 'otro') || 'web'
    const _metodoPago = String(normalize(metodoPago) || '')
    const _telefono = String(normalize(telefono) || '')

    // Validaciones básicas
    if (!_curso || !_nombre || !_apellido || !_correo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    if (!isValidEmail(_correo)) {
      return res.status(400).json({ error: 'Correo inválido' })
    }

    const precioUSD = PRECIOS[_curso]
    if (!precioUSD) {
      return res.status(400).json({ error: 'Curso no válido' })
    }

    // Idempotencia si el cliente trae un idCompra válido
    if (_idCompra) {
      const existing = await PedidoModel.findOne({ idCompra: _idCompra }).lean().exec()
      if (existing) {
        return res.status(200).json(safePedidoResponse(existing))
      }
    }

    // Si no trae idCompra, se genera
    if (!_idCompra) _idCompra = genIdCompra()

    // Doc base
    const baseDoc: any = {
      idCompra: _idCompra,           // el schema lo normaliza a MAYÚSCULAS
      cursoTitulo: _curso,
      precioUSD,
      // precioTexto se autogenera si falta (schema default)
      precioTexto: `$${precioUSD.toFixed(2)}`,
      estado: 'pendiente',
      nombre: _nombre,
      apellido: _apellido,
      correo: _correo,
      canal: _canal,
    }

    if (_metodoPago) baseDoc.metodoPago = _metodoPago
    if (_telefono) baseDoc.telefono = _telefono
    if (datosPago && typeof datosPago === 'object') {
      baseDoc.datosPago = {
        referencia: normalize((datosPago as any).referencia),
        fecha: normalize((datosPago as any).fecha),
      }
    }

    // Crear con reintentos si colisiona idCompra (índice unique)
    let intentos = 0
    let saved: any = null
    while (intentos < 3) {
      try {
        if (intentos > 0) {
          baseDoc.idCompra = genIdCompra()
        }
        saved = await PedidoModel.create(baseDoc)
        break
      } catch (e: any) {
        if (e?.code === 11000 && e?.keyPattern?.idCompra) {
          intentos++
          continue
        }
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

    return res.status(201).json(safePedidoResponse(saved))
  } catch (err) {
    console.error('❌ /api/pedidos POST fallo inesperado:', err)
    return res.status(500).json({ error: 'Error al guardar el pedido' })
  }
}

/**
 * GET /api/pedidos
 * Público: lista pedidos (si lo usas para admin, protégelo en la ruta).
 * Tip: añade paginación con ?page=1&pageSize=50 si lo necesitas.
 */
export const obtenerPedidosPublic = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 50))

    const [items, total] = await Promise.all([
      PedidoModel.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select({
          _id: 1,
          idCompra: 1,
          cursoTitulo: 1,
          precioUSD: 1,
          precioTexto: 1,
          estado: 1,
          nombre: 1,
          apellido: 1,
          correo: 1,
          canal: 1,
          createdAt: 1
        })
        .lean()
        .exec(),
      PedidoModel.countDocuments().exec()
    ])

    res.json({
      total,
      page,
      pageSize,
      items: items.map(safePedidoResponse)
    })
  } catch (err) {
    console.error('❌ Error al obtener pedidos:', err)
    res.status(500).json({ error: 'Error interno al listar pedidos' })
  }
}

/**
 * PATCH /api/pedidos/:id/confirmar
 * Marca como pago_verificado. :id puede ser ObjectId o idCompra.
 * Acepta en body opcionalmente: { datosPago: { referencia, fecha }, metodoPago }
 * Valida con runValidators (el schema exige referencia/fecha cuando estado=pago_verificado).
 */
export const confirmarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const identificador = String(normalize(id))
    const { datosPago, metodoPago } = (req.body || {}) as {
      datosPago?: { referencia?: string; fecha?: string }
      metodoPago?: string
    }

    const update: any = { estado: 'pago_verificado' }
    if (datosPago && typeof datosPago === 'object') {
      update.datosPago = {
        referencia: normalize(datosPago.referencia),
        fecha: normalize(datosPago.fecha),
      }
    }
    if (metodoPago) update.metodoPago = normalize(metodoPago)

    const opts = { new: true, runValidators: true }

    const query = isObjectId(identificador)
      ? { _id: identificador }
      : { idCompra: identificador.toUpperCase() }

    const pedido = await PedidoModel.findOneAndUpdate(query, update, opts).exec()

    if (!pedido) return res.sendStatus(404)
    return res.status(200).json(safePedidoResponse(pedido))
  } catch (err: any) {
    // Si falla la validación del schema (p.ej. falta referencia/fecha)
    if (err?.name === 'ValidationError') {
      const msg = Object.values(err.errors || {})
        .map((x: any) => x?.message)
        .filter(Boolean)
        .join(', ')
      return res.status(422).json({ error: msg || 'Validación fallida' })
    }
    console.error('❌ Error al confirmar pedido:', err)
    return res.status(500).json({ error: 'Error al confirmar el pedido' })
  }
}
