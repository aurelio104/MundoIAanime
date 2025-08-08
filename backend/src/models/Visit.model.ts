// ✅ FILE: src/models/Visit.model.ts

import { Schema, model, type Document, type Model } from 'mongoose'

export interface IVisit extends Document {
  ip?: string
  userAgent?: string
  timestamp?: Date
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
    timestamp: { type: Date, default: Date.now },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String }
    }
  },
  {
    timestamps: true
  }
)

visitSchema.index({ timestamp: -1 })

const Visit: Model<IVisit> = model<IVisit>('Visit', visitSchema)
export default Visit
