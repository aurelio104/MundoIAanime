import { Schema, model, Document } from 'mongoose'

export interface AdminDoc extends Document {
  email: string
  password: string // Hasheada
  nombre: string
}

const AdminSchema = new Schema<AdminDoc>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nombre: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
})

export const AdminModel = model<AdminDoc>('Admin', AdminSchema)
