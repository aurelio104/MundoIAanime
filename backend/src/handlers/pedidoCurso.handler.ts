// ✅ src/handlers/pedidoCurso.handler.ts — Manejo de pedidos de cursos desde WhatsApp

import { saveUser } from '../memory/memory.mongo.js'
import type { BotHandlerContext } from '../types/BotHandlerContext.js'

/**
 * 🧾 Maneja el mensaje estructurado de un pedido de curso desde WhatsApp
 * Este mensaje proviene de la web o de un formulario con estructura tipo:
 * 
 * 🧾 Pedido confirmado desde el sitio MundoIAnime:
 * Nombre: Juan Pérez
 * Correo: juan@example.com
 * Curso: Prompting Anime IA
 * Método de Pago: Pago Móvil
 * Comprobante: IMG-20250804-WA0012.jpg
 * ID Compra: MIA-84123
 */
export async function manejarPedidoCurso(ctx: BotHandlerContext) {
  const { from, text, name, sock } = ctx

  // Extraer los datos desde el texto recibido
  const correo = extraerDato(text, /Correo:\s*(.+)/i)
  const nombre = extraerDato(text, /Nombre:\s*(.+)/i)
  const metodo = extraerDato(text, /Método de Pago:\s*(.+)/i)
  const curso = extraerDato(text, /Curso:\s*(.+)/i)
  const idCompra = extraerDato(text, /ID Compra:\s*(.+)/i)
  const comprobante = extraerDato(text, /Comprobante:\s*(.+)/i)

  // Guardar o actualizar la memoria del usuario
  await saveUser({
    telefono: from,
    name: nombre || name,
    apellido: nombre?.split(' ')[1] || '',
    correo,
    metodoPago: metodo,
    cursoComprado: curso,
    comprobante,
    estadoPago: 'pendiente',
    ultimaIntencion: 'order'
  })

  // Respuesta automática de confirmación
  await sock.sendMessage(from, {
    text: `🧾 ¡Gracias por tu compra!\n\nHemos registrado tu pedido del curso *${curso}* con el método *${metodo}*.\n\nNuestro equipo verificará el comprobante y te daremos acceso en breve.`
  })
}

/**
 * 🔍 Utilidad para extraer un dato del mensaje usando expresión regular
 */
function extraerDato(texto: string, regex: RegExp): string | undefined {
  const match = texto.match(regex)
  return match?.[1]?.trim()
}
