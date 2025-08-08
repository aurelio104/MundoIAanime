// ✅ src/database/models/Pedido.ts

import mongoose, { Schema, type Document } from 'mongoose'

export interface PedidoDoc extends Document {
  id: string
  cliente?: string
  estado?: string
  total?: string
  totalBs?: string
  fecha?: string
  telefono?: string
  datosPago?: {
    referencia?: string
    fecha?: string
  }
}

const PedidoSchema = new Schema<PedidoDoc>(
  {
    id: { type: String, required: true },
    cliente: String,
    estado: String,
    total: String,
    totalBs: String,
    fecha: String,
    telefono: String,
    datosPago: {
      referencia: String,
      fecha: String
    }
  },
  { timestamps: true }
)

export const PedidoModel = mongoose.model<PedidoDoc>('Pedido', PedidoSchema)
