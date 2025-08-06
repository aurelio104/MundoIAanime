import { getSock } from '../core/client'
import { UserMemoryModel } from '../database/models/UserMemory'
import { generarPassword } from '../utils/password.util'

/**
 * ✅ Procesa la verificación de un pago desde el admin
 * Genera usuario y contraseña, y envía acceso al cliente
 */
export async function procesarPagoVerificado(idCompra: string) {
  const sock = getSock()

  // Buscar usuario con ese ID de compra
  const usuario = await UserMemoryModel.findOne({ cursoComprado: idCompra }).exec()
  if (!usuario) {
    console.warn(`[pagoVerificado] ❌ No se encontró compra con ID: ${idCompra}`)
    return
  }

  const telefono = usuario.telefono
  const nombre = usuario.name || 'cliente'
  const correo = usuario.correo || 'sin-correo'
  const apellido = correo.split('@')[0]?.split('.')[1] || 'user'

  // Generar contraseña segura basada en el apellido
  const password = generarPassword(apellido)

  // Actualizar en base de datos
  usuario.estadoPago = 'verificado'
  usuario.passwordGenerado = password
  await usuario.save()

  // Enviar acceso por WhatsApp
  const mensaje = `
✅ *¡Pago verificado!*

Gracias por tu compra, ${nombre}. Tu acceso al curso está listo.

🌐 Accede con estos datos:
• Usuario: *${correo}*
• Contraseña: *${password}*
• Dashboard: https://mundoianime.com/dashboard

Recuerda guardar este mensaje y no compartir tu acceso.

¡Disfruta el curso! 🚀
  `.trim()

  const jid = `${telefono}@s.whatsapp.net`
  await sock.sendMessage(jid, { text: mensaje })

  console.log(`[pagoVerificado] ✅ Acceso enviado a ${telefono} con ID ${idCompra}`)
}
