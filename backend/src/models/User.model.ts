// ✅ FILE: src/models/User.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// 📌 Interfaz del usuario
export interface IUser extends Document {
  correo: string
  password: string
  rol: 'admin' | 'user'
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ✅ Esquema del usuario
const UserSchema = new Schema<IUser>(
  {
    correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Correo inválido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false
    },
    rol: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
)

// 🔐 Hashear contraseña antes de guardar
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// 🔐 Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

// ✅ Exportar modelo
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)
export default User
