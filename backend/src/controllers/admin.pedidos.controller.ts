// ✅ src/controllers/admin.pedidos.controller.ts
import type { Request, Response } from 'express'
import { PedidoModel } from '../database/models/Pedido.js'

export async function listarPedidos(req: Request, res: Response) {
  try {
    const pedidos = await PedidoModel.find({}).sort({ createdAt: -1 }).lean().exec()
    return res.status(200).json(pedidos)
  } catch (err) {
    console.error('❌ Error listando pedidos:', err)
    return res.status(500).json({ error: 'Error interno al listar pedidos' })
  }
}

export async function obtenerPedido(req: Request, res: Response) {
  try {
    const { id } = req.params
    const pedido = await PedidoModel.findOne({ id }).lean().exec()
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    return res.status(200).json(pedido)
  } catch (err) {
    console.error('❌ Error obteniendo pedido:', err)
    return res.status(500).json({ error: 'Error interno al obtener pedido' })
  }
}

export async function actualizarEstadoPedido(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { estado } = req.body as { estado?: string }
    if (!estado) return res.status(400).json({ error: 'Falta estado' })

    const updated = await PedidoModel.findOneAndUpdate(
      { id },
      { $set: { estado } },
      { new: true }
    ).lean().exec()

    if (!updated) return res.status(404).json({ error: 'Pedido no encontrado' })
    return res.status(200).json({ success: true, pedido: updated })
  } catch (err) {
    console.error('❌ Error actualizando estado:', err)
    return res.status(500).json({ error: 'Error interno al actualizar estado' })
  }
}
