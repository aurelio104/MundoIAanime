// ✅ FILE: src/models/Pedido.model.ts
import { Schema, model, models, type Document, type Model } from 'mongoose'

export interface IPedido extends Document {
  idCompra: string
  cursoTitulo: string
  precioUSD: number
  precioTexto: string
  estado:
    | 'pendiente'
    | 'pago_verificado'
    | 'en_fabrica'
    | 'empaquetado'
    | 'enviado'
    | 'en_camino'
    | 'entregado'
    | 'recibido'
    | 'cancelado'
  nombre: string
  apellido: string
  correo: string
  canal?: 'web' | 'whatsapp' | 'otro'
  metodoPago?: string
  datosPago?: {
    referencia?: string
    fecha?: string
  }
  telefono?: string
  createdAt?: Date
  updatedAt?: Date
}

const PedidoSchema = new Schema<IPedido>(
  {
    idCompra: { type: String, required: true, index: true, unique: true },
    cursoTitulo: { type: String, required: true },
    precioUSD: { type: Number, required: true },
    precioTexto: { type: String, required: true },
    estado: { type: String, default: 'pendiente' },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    correo: { type: String, required: true },
    canal: { type: String, default: 'web' },
    metodoPago: { type: String },
    datosPago: {
      referencia: String,
      fecha: String,
    },
    telefono: String,
  },
  { timestamps: true }
)

PedidoSchema.index({ createdAt: -1 })

// 👇 clave para evitar OverwriteModelError
export const PedidoModel: Model<IPedido> =
  (models.Pedido as Model<IPedido>) || model<IPedido>('Pedido', PedidoSchema)

export default PedidoModel
