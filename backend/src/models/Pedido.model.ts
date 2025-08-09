// ✅ FILE: src/models/Pedido.model.ts
import { Schema, model, type Document, type Model } from 'mongoose'

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
  precioTexto: string // Ej: "$9.99"
  estado: EstadoPedido
  nombre: string
  apellido: string
  correo: string
  canal?: 'web' | 'whatsapp' | 'otro'
  metodoPago?: string
  datosPago?: {
    referencia?: string
    fecha?: string // ISO o legible; si luego necesitas Date, cambia el tipo
  }
  telefono?: string
  createdAt?: Date
  updatedAt?: Date
}

// Lista de estados válidos para Mongoose enum
const ESTADOS: EstadoPedido[] = [
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

const PedidoSchema = new Schema<IPedido>(
  {
    idCompra: {
      type: String,
      required: true,
      index: true,
      unique: true,
      trim: true
    },
    cursoTitulo: {
      type: String,
      required: true,
      trim: true
    },
    precioUSD: {
      type: Number,
      required: true,
      min: 0
    },
    precioTexto: {
      type: String,
      required: true,
      trim: true
    },
    estado: {
      type: String,
      enum: ESTADOS,
      default: 'pendiente'
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      required: true,
      trim: true
    },
    correo: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v: string) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Correo inválido'
      }
    },
    canal: {
      type: String,
      enum: ['web', 'whatsapp', 'otro'],
      default: 'web'
    },
    metodoPago: {
      type: String,
      trim: true
    },
    datosPago: {
      referencia: { type: String, trim: true },
      fecha: { type: String, trim: true }
    },
    telefono: { type: String, trim: true }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      }
    },
    toObject: { virtuals: true }
  }
)

// Índices recomendados
PedidoSchema.index({ createdAt: -1 })
PedidoSchema.index({ correo: 1, createdAt: -1 })

// Normaliza correo a minúsculas siempre (por si llega sin lowercase)
PedidoSchema.pre('save', function (next) {
  if (this.isModified('correo') && typeof this.correo === 'string') {
    this.correo = this.correo.toLowerCase()
  }
  next()
})

// 🔧 Helper opcional para crear desde payload del front (no obligatorio)
export interface WebPedidoPayload {
  idCompra: string
  cursoTitulo: string
  nombre: string
  apellido: string
  correo: string
  canal?: 'web' | 'whatsapp' | 'otro'
}

interface PedidoModelType extends Model<IPedido> {
  fromWebPayload: (payload: WebPedidoPayload, precioUSD: number, precioTexto: string) => Partial<IPedido>
}

PedidoSchema.statics.fromWebPayload = function (
  payload: WebPedidoPayload,
  precioUSD: number,
  precioTexto: string
) {
  const { idCompra, cursoTitulo, nombre, apellido, correo, canal = 'web' } = payload
  return {
    idCompra,
    cursoTitulo,
    precioUSD,
    precioTexto,
    estado: 'pendiente',
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    correo: correo.trim().toLowerCase(),
    canal
  }
}

export const PedidoModel = model<IPedido, PedidoModelType>('Pedido', PedidoSchema)
export default PedidoModel
