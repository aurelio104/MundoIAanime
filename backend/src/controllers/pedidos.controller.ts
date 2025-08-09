// ✅ FILE: src/controllers/pedidos.controller.ts
import { Request, Response } from 'express'
import PedidoModel from '../models/Pedido.model.js'

// 💵 Precios definidos en el servidor (nunca confíes en el front)
const PRECIOS: Record<string, number> = {
  'Crea Caminatas Apocalípticas con personajes usando IA': 9.99,
  'Crea Videos de Anime en Live Action Estilo Selfie con IA': 9.99,
  'Crea Videos de Anime en Live Action Cinematográficos con IA': 9.99,
  'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA': 9.99
}

const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id)
const normalize = (s?: string) => (typeof s === 'string' ? s.trim() : '')
const normalizeEmail = (s?: string) => normalize(s).toLowerCase()
const isValidEmail = (s?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(s))

/**
 * POST /api/pedidos
 * Registra un pedido desde la web. Idempotente por idCompra.
 */
export const registrarPedido = async (req: Request, res: Response) => {
  try {
    const {
      cursoTitulo,
      nombre,
      apellido,
      correo,
      idCompra,
      // fechaISO no se persiste (usamos createdAt), pero se acepta sin romper
      canal
    } = req.body || {}

    const _curso = normalize(cursoTitulo)
    const _nombre = normalize(nombre)
    const _apellido = normalize(apellido)
    const _correo = normalizeEmail(correo)
    const _idCompra = normalize(idCompra)
    const _canal = (normalize(canal) as 'web' | 'whatsapp' | 'otro') || 'web'

    // Validaciones básicas
    if (!_curso || !_nombre || !_apellido || !_correo || !_idCompra) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    if (!isValidEmail(_correo)) {
      return res.status(400).json({ error: 'Correo inválido' })
    }

    const precioUSD = PRECIOS[_curso]
    if (!precioUSD) {
      return res.status(400).json({ error: 'Curso no válido' })
    }

    // Idempotencia por idCompra: si existe, devolverlo
    const existing = await PedidoModel.findOne({ idCompra: _idCompra }).lean().exec()
    if (existing) {
      return res.status(200).json({
        id: existing._id?.toString?.(),
        idCompra: existing.idCompra,
        estado: existing.estado,
        total: existing.precioUSD,
        totalTexto: existing.precioTexto,
        createdAt: existing.createdAt
      })
    }

    const pedido = await PedidoModel.create({
      idCompra: _idCompra,
      cursoTitulo: _curso,
      precioUSD,
      precioTexto: `$${precioUSD.toFixed(2)}`,
      estado: 'pendiente',
      nombre: _nombre,
      apellido: _apellido,
      correo: _correo,
      canal: _canal
    })

    return res.status(201).json({
      id: pedido.id, // viene del virtual transform
      idCompra: pedido.idCompra,
      estado: pedido.estado,
      total: pedido.precioUSD,
      totalTexto: pedido.precioTexto,
      createdAt: pedido.createdAt
    })
  } catch (err) {
    console.error('❌ Error al guardar el pedido:', err)
    return res.status(500).json({ error: 'Error al guardar el pedido' })
  }
}

/**
 * GET /api/pedidos
 * Público (o semi-público): lista pedidos (si lo usas en admin, protégelo con middleware en rutas).
 */
export const obtenerPedidosPublic = async (_req: Request, res: Response) => {
  try {
    const pedidos = await PedidoModel.find({})
      .sort({ createdAt: -1 })
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
      .exec()

    // Normaliza id en la respuesta
    const safe = pedidos.map((p: any) => ({
      id: p._id?.toString?.(),
      idCompra: p.idCompra,
      cursoTitulo: p.cursoTitulo,
      precioUSD: p.precioUSD,
      precioTexto: p.precioTexto,
      estado: p.estado,
      nombre: p.nombre,
      apellido: p.apellido,
      correo: p.correo,
      canal: p.canal,
      createdAt: p.createdAt
    }))

    res.json(safe)
  } catch (err) {
    console.error('❌ Error al obtener pedidos:', err)
    res.status(500).json({ error: 'Error interno al listar pedidos' })
  }
}

/**
 * PATCH /api/pedidos/:id/confirmar
 * Marca pedido como pago_verificado. Acepta :id como _id de Mongo o como idCompra.
 */
export const confirmarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const identificador = normalize(id)

    let pedido = null
    if (isObjectId(identificador)) {
      pedido = await PedidoModel.findByIdAndUpdate(
        identificador,
        { estado: 'pago_verificado' },
        { new: true }
      ).exec()
    } else {
      pedido = await PedidoModel.findOneAndUpdate(
        { idCompra: identificador },
        { estado: 'pago_verificado' },
        { new: true }
      ).exec()
    }

    if (!pedido) return res.sendStatus(404)
    return res.sendStatus(200)
  } catch (err) {
    console.error('❌ Error al confirmar pedido:', err)
    return res.status(500).send('Error al confirmar el pedido')
  }
}
