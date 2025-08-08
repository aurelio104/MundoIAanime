// ✅ FILE: src/models/Visit.model.ts

import { Schema, model, type Document, type Model } from 'mongoose'

export interface IVisit extends Document {
  ip?: string
  userAgent?: string
  createdAt?: Date
  updatedAt?: Date
  location?: {
    country?: string
    city?: string
    region?: string
  }
}

const visitSchema = new Schema<IVisit>(
  {
    ip: { type: String },
    userAgent: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String }
    }
  },
  {
    timestamps: true // ✅ Esto agrega createdAt y updatedAt
  }
)

visitSchema.index({ createdAt: -1 }) // ✅ Ordenar por fecha descendente

const Visit: Model<IVisit> = model<IVisit>('Visit', visitSchema)
export default Visit
