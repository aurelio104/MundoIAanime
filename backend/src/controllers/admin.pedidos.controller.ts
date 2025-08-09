// ✅ FILE: src/controllers/admin.pedidos.controller.ts
import type { Request, Response } from 'express'
import PedidoModel from '../models/Pedido.model.js'

const ESTADOS_VALIDOS = new Set([
  'pendiente',
  'pago_verificado',
  'en_fabrica',
  'empaquetado',
  'enviado',
  'en_camino',
  'entregado',
  'recibido',
  'cancelado'
])

const isObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id)
const normalize = (s?: string) => (typeof s === 'string' ? s.trim() : '')

/**
 * GET /api/admin/pedidos
 * Devuelve lista mapeada para el dashboard:
 * [{ id, cliente, estado, total, totalBs, fecha, datosPago, telefono }]
 */
export const listarPedidos = async (_req: Request, res: Response) => {
  try {
    const pedidos = await PedidoModel.find({})
      .sort({ createdAt: -1 })
      .select({
        _id: 1,
        nombre: 1,
        apellido: 1,
        estado: 1,
        precioUSD: 1,
        createdAt: 1,
        datosPago: 1,
        telefono: 1
      })
      .lean()
      .exec()

    const mapped = pedidos.map(p => ({
      id: String(p._id),
      cliente: `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim() || 'Cliente',
      estado: p.estado,
      total: typeof p.precioUSD === 'number' ? p.precioUSD.toFixed(2) : '0.00',
      totalBs: undefined as unknown as string | undefined, // si luego quieres calcularlo con tasa, aquí
      fecha: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
      datosPago: p.datosPago,
      telefono: p.telefono
    }))

    return res.status(200).json(mapped)
  } catch (err) {
    console.error('❌ Error listando pedidos:', err)
    return res.status(500).json({ error: 'Error interno al listar pedidos' })
  }
}

/**
 * GET /api/admin/pedidos/:id
 * Obtiene un pedido por _id (Mongo).
 */
export const obtenerPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!isObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const pedido = await PedidoModel.findById(id).lean().exec()
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    return res.status(200).json(pedido)
  } catch (err) {
    console.error('❌ Error obteniendo pedido:', err)
    return res.status(500).json({ error: 'Error interno al obtener pedido' })
  }
}

/**
 * PUT /api/admin/pedidos/:id
 * Actualiza el estado del pedido. Si se establece "pago_verificado",
 * valida referencia y fecha mínimas en datosPago.
 */
export const actualizarEstadoPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { estado } = (req.body || {}) as { estado?: string }

    if (!isObjectId(id)) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    const nuevoEstado = normalize(estado).toLowerCase()
    if (!nuevoEstado || !ESTADOS_VALIDOS.has(nuevoEstado)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }

    // Si quieren marcar pago verificado, exige referencia y fecha mínimas
    if (nuevoEstado === 'pago_verificado') {
      const doc = await PedidoModel.findById(id).select({ datosPago: 1 }).lean().exec()
      const ref = normalize(doc?.datosPago?.referencia)
      const fechaPago = normalize(doc?.datosPago?.fecha)
      const refInvalida = !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')

      if (!fechaPago || refInvalida) {
        return res.status(400).json({
          error: 'Referencia/fecha de pago inválidas para marcar como "pago_verificado"'
        })
      }
    }

    const updated = await PedidoModel.findByIdAndUpdate(
      id,
      { $set: { estado: nuevoEstado } },
      { new: true }
    )
      .lean()
      .exec()

    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' })

    return res.status(200).json({ success: true, pedido: updated })
  } catch (err) {
    console.error('❌ Error actualizando estado:', err)
    return res.status(500).json({ error: 'Error interno al actualizar estado' })
  }
}
