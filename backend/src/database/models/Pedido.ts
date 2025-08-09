// ⚠️ Solo si no usas el re-export de arriba
import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface PedidoDoc extends Document {
  id: string
  cliente?: string
  estado?: string
  total?: number
  totalBs?: string
  fecha?: string
  telefono?: string
  metodoPago?: string
  datosPago?: {
    referencia?: string
    fecha?: string
  }
  productos?: string[]
  tallas?: string[]
  colores?: string[]
  preciosUnitarios?: number[]
}

const PedidoSchema = new Schema<PedidoDoc>(
  {
    id: { type: String, required: true, index: true, unique: true },
    cliente: String,
    estado: { type: String, default: 'pendiente', index: true },
    total: Number,
    totalBs: String,
    fecha: String,
    telefono: String,
    metodoPago: String,
    datosPago: {
      referencia: String,
      fecha: String,
    },
    productos: [String],
    tallas: [String],
    colores: [String],
    preciosUnitarios: [Number],
  },
  { timestamps: true }
)

// 👇 clave para no re-registrar el modelo
export const PedidoModel: Model<PedidoDoc> =
  (mongoose.models.Pedido as Model<PedidoDoc>) ||
  mongoose.model<PedidoDoc>('Pedido', PedidoSchema)

export default PedidoModel
