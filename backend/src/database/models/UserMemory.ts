// ✅ src/database/models/UserMemory.ts — modelo actualizado

import { Schema, model, Document } from 'mongoose'
import { UserMemory } from '../../schemas/UserMemory'

// ✅ Extendemos el esquema base con Document de Mongoose
export interface UserMemoryDoc extends UserMemory, Document {}

const UserMemorySchema = new Schema<UserMemoryDoc>({
  telefono: { type: String, required: true },
  name: { type: String, default: 'cliente' },
  firstSeen: Number,
  lastSeen: Number,
  lastMessage: { type: String, default: '' },

  history: {
    type: [
      {
        timestamp: Number,
        message: String,
        emotion: String,
        intent: String,
        context: String
      }
    ],
    default: []
  },

  emotionSummary: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'sad', 'frustrated'],
    default: 'neutral'
  },

  ultimaIntencion: { type: String, default: null },
  cursoInteresado: String,
  cursoComprado: String,
  comprobante: String,
  metodoPago: String,
  estadoPago: {
    type: String,
    enum: ['pendiente', 'verificado'],
    default: 'pendiente'
  },
  correo: String,
  apellido: String,
  passwordGenerado: { type: String, default: null },

  esperandoComprobante: Boolean,
  esperandoMetodoDePago: Boolean,
  idioma: String
}, {
  timestamps: true,
  versionKey: false
})

export const UserMemoryModel = model<UserMemoryDoc>('UserMemory', UserMemorySchema)
