// ✅ FILE: src/models/Pedido.model.ts
import mongoose, {
  Schema,
  model,
  type Document,
  type Model
} from 'mongoose'

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

  // virtuals
  cliente?: string
}

// ------- Utilidades -------
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const toMoneyText = (n: unknown) => {
  const v = Number(n)
  return `$${Number.isFinite(v) ? v.toFixed(2) : '0.00'}`
}

const upper = (s?: unknown) =>
  typeof s === 'string' ? s.trim().toUpperCase() : s

const lower = (s?: unknown) =>
  typeof s === 'string' ? s.trim().toLowerCase() : s

const trimStr = (s?: unknown) =>
  typeof s === 'string' ? s.trim() : s

// ------- Subschema: datosPago -------
const DatosPagoSchema = new Schema(
  {
    referencia: {
      type: String,
      set: (v: unknown) => (typeof v === 'string' ? v.trim().toUpperCase() : v)
    },
    fecha: {
      type: String,
      set: (v: unknown) => (typeof v === 'string' ? v.trim() : v)
    }
  },
  { _id: false, id: false }
)

// ------- Schema principal -------
const PedidoSchema = new Schema<IPedido>(
  {
    idCompra: {
      type: String,
      required: true,
      index: true,
      unique: true,
      set: (v: unknown) =>
        typeof v === 'string' ? v.trim().toUpperCase() : v,
      // patrón típico: 6–12 chars alfanum mayúscula
      match: [/^[A-Z0-9]{6,12}$/, 'idCompra inválido']
    },
    cursoTitulo: {
      type: String,
      required: true,
      trim: true
    },
    precioUSD: {
      type: Number,
      required: true,
      min: [0, 'precioUSD debe ser ≥ 0']
    },
    // Se autogenera desde precioUSD si no viene
    precioTexto: {
      type: String,
      required: true,
      set: (v: unknown) =>
        typeof v === 'string' ? v.trim() : toMoneyText(v),
      default: function (this: IPedido) {
        return toMoneyText(this.precioUSD)
      }
    },
    estado: {
      type: String,
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
      ],
      default: 'pendiente'
    },
    nombre: { type: String, required: true, set: trimStr },
    apellido: { type: String, required: true, set: trimStr },
    correo: {
      type: String,
      required: true,
      lowercase: true,
      set: lower,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: 'Correo inválido'
      },
      index: true
    },
    canal: {
      type: String,
      enum: ['web', 'whatsapp', 'otro'],
      default: 'web'
    },
    metodoPago: { type: String, set: trimStr },
    datosPago: { type: DatosPagoSchema, default: undefined },
    telefono: { type: String, set: trimStr }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString?.()
        delete ret._id
        return ret
      }
    },
    toObject: { virtuals: true }
  }
)

// ------- Virtuals -------
PedidoSchema.virtual('cliente').get(function (this: IPedido) {
  const n = (this.nombre || '').trim()
  const a = (this.apellido || '').trim()
  return `${n} ${a}`.trim()
})

// ------- Validaciones de negocio dentro del schema -------
// Si estado = pago_verificado, exigir referencia y fecha válidas.
PedidoSchema.path('estado').validate(function (this: IPedido, v: string) {
  if (v === 'pago_verificado') {
    const ref = this.datosPago?.referencia?.trim()
    const fecha = this.datosPago?.fecha?.trim()
    const refInvalida =
      !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')
    if (!fecha || refInvalida) {
      return false
    }
  }
  return true
}, 'Para "pago_verificado" se requiere referencia y fecha válidas')

// Asegurar precioTexto coherente si cambian precioUSD en updates con save()
PedidoSchema.pre('validate', function (next) {
  // Normalizar precioTexto si viene vacío o mal formateado
  if (!this.precioTexto) {
    this.precioTexto = toMoneyText(this.precioUSD)
  }
  next()
})

// ------- Índices útiles -------
PedidoSchema.index({ createdAt: -1 })
PedidoSchema.index({ estado: 1, createdAt: -1 })

// ------- Export seguro (evita OverwriteModelError) -------
export const PedidoModel: Model<IPedido> =
  (mongoose.models.Pedido as Model<IPedido>) ||
  model<IPedido>('Pedido', PedidoSchema)

export default PedidoModel
