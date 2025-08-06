import mongoose from 'mongoose';

const CourseUserSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  correo: { type: String, required: true, unique: true },
  curso: String,
  comprobante: String,
  metodo: String,
  acceso: { type: Boolean, default: false },
  password: String,
  creadoEn: { type: Date, default: Date.now }
});

export default mongoose.model('UserCurso', CourseUserSchema);
