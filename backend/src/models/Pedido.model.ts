// ✅ FILE: src/models/Pedido.model.ts
import { Schema, model, models, type Document, type Model } from 'mongoose'

export type EstadoPedido =
  | 'pendiente'
  | 'pago_verificado'
  | 'en_fabrica'
  | 'empaquetado'
  | 'enviado'
  | 'en_camino'
  | 'entregado'
  | 'recibido'
  | 'cancelado'

export interface IPedido extends Document {
  idCompra: string
  cursoTitulo: string
  precioUSD: number
  precioTexto: string
  estado: EstadoPedido
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
    precioUSD: { type: Number, required: true, min: 0 },
    precioTexto: { type: String, required: true }, // p.ej. "$9.99"
    estado: {
      type: String,
      default: 'pendiente',
      enum: [
        'pendiente',
        'pago_verificado',
        'en_fabrica',
        'empaquetado',
        'enviado',
        'en_camino',
        'entregado',
        'recibido',
        'cancelado'
      ]
    },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    canal: { type: String, default: 'web', enum: ['web', 'whatsapp', 'otro'] },
    metodoPago: { type: String },
    datosPago: {
      referencia: { type: String },
      fecha: { type: String }
    },
    telefono: { type: String }
  },
  {
    timestamps: true,
    // 🔧 para que el front reciba "id" en vez de "_id" y sin "__v"
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.()
        delete ret._id
        return ret
      }
    }
  }
)

// 📈 Índices útiles
PedidoSchema.index({ createdAt: -1 })
PedidoSchema.index({ correo: 1 })
PedidoSchema.index({ estado: 1, createdAt: -1 })

// 🛡️ Evita OverwriteModelError en hot-reloads / builds
export const PedidoModel: Model<IPedido> =
  (models.Pedido as Model<IPedido>) || model<IPedido>('Pedido', PedidoSchema)

export default PedidoModel
