// ✅ src/memory/memory.mongo.ts — memoria del usuario para flujo de cursos y pagos

import { UserMemoryModel, type UserMemoryDoc } from '../database/models/UserMemory.js'
import { PedidoModel, type PedidoDoc } from '../database/models/Pedido.js' // ✅ Asegúrate de tener este modelo
import type { UserMemory } from '../schemas/UserMemory.js'

/** ✅ Obtener la memoria del usuario por número de teléfono */
export async function getUser(telefono: string): Promise<UserMemoryDoc | null> {
  return await UserMemoryModel.findOne({ telefono }).exec()
}

/** ✅ Guardar/actualizar memoria parcial del usuario */
export async function saveUserMemory(telefono: string, data: Partial<UserMemoryDoc>): Promise<void> {
  await UserMemoryModel.updateOne({ telefono }, { $set: data }, { upsert: true })
}

/** ✅ Crear nueva memoria para usuario si no existe (completo) */
export async function saveUser(user: Partial<UserMemory> & { telefono: string }): Promise<UserMemoryDoc> {
  const found = await UserMemoryModel.findOne({ telefono: user.telefono })
  if (found) return found

  const nuevo = new UserMemoryModel({
    ...user,
    name: user.name || 'cliente',
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    lastMessage: '',
    history: [],
    emotionSummary: 'neutral'
  })

  return await nuevo.save()
}

/** ✅ Crear nueva memoria para usuario desde cero (uso explícito) */
export async function crearNuevoUsuario({
  telefono,
  nombre,
  apellido,
  correo
}: {
  telefono: string
  nombre: string
  apellido: string
  correo: string
}): Promise<void> {
  const existe = await UserMemoryModel.findOne({ telefono })
  if (existe) return

  await UserMemoryModel.create({
    telefono,
    name: nombre,
    apellido,
    correo,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    estadoPago: 'pendiente',
    emotionSummary: 'neutral',
    history: [],
    lastMessage: ''
  })
}

/** ✅ Marcar curso como comprado y pago verificado */
export async function marcarCursoComoVerificado(telefono: string, cursoComprado: string): Promise<void> {
  await UserMemoryModel.updateOne(
    { telefono },
    {
      $set: {
        cursoComprado,
        estadoPago: 'verificado',
        ultimaIntencion: 'order',
        lastSeen: Date.now()
      }
    }
  )
}

/** ✅ Obtener todos los usuarios con pagos pendientes (para el dashboard admin) */
export async function obtenerUsuariosConPagoPendiente(): Promise<UserMemoryDoc[]> {
  return await UserMemoryModel.find({ estadoPago: 'pendiente' }).sort({ updatedAt: -1 }).lean()
}

/** ✅ Obtener todos los usuarios con pago verificado */
export async function obtenerUsuariosConPagoVerificado(): Promise<UserMemoryDoc[]> {
  return await UserMemoryModel.find({ estadoPago: 'verificado' }).sort({ updatedAt: -1 }).lean()
}

/** ✅ Obtener todos los pedidos registrados (para AdminPedidos.tsx) */
export async function obtenerTodosLosPedidos(): Promise<PedidoDoc[]> {
  return await PedidoModel.find({}).sort({ createdAt: -1 }).lean().exec()
}
