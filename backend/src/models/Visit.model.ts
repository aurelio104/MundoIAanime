// ✅ FILE: src/models/Visit.model.ts

import { Schema, model, type Document } from 'mongoose'

// 🧠 Tipado de documento
export interface IVisit extends Document {
  ip?: string
  userAgent?: string
  timestamp: Date
}

// 🧬 Esquema de Mongoose
const visitSchema = new Schema<IVisit>({
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
})

// 📦 Exportar modelo
const Visit = model<IVisit>('Visit', visitSchema)
export default Visit
