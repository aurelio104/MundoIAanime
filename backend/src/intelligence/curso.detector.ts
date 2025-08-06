// ✅ src/intelligence/curso.detector.ts

/**
 * Extrae los datos de un mensaje estructurado de compra enviado desde la web
 * @param texto Mensaje completo recibido por WhatsApp
 */
export function extraerDatosCursoDesdeTexto(texto: string) {
  const limpiar = (str: string) => str.trim().replace(/\n/g, '')

  try {
    const correo = extraerCampo(texto, 'Correo:')
    const nombre = extraerCampo(texto, 'Nombre:')
    const metodo = extraerCampo(texto, 'Método de Pago:')
    const comprobante = extraerCampo(texto, 'Comprobante:')
    const curso = extraerCampo(texto, 'Curso:')
    const apellido = nombre.split(' ').slice(-1)[0]?.toLowerCase() || ''

    return {
      correo: limpiar(correo),
      nombreCompleto: limpiar(nombre),
      apellido,
      metodo: limpiar(metodo),
      comprobante: limpiar(comprobante),
      curso: limpiar(curso)
    }
  } catch (err) {
    console.warn('❌ No se pudieron extraer los campos del texto:', err)
    return null
  }
}

function extraerCampo(texto: string, etiqueta: string): string {
  const regex = new RegExp(`${etiqueta}\\s*(.*)`)
  const match = texto.match(regex)
  return match?.[1]?.trim() || ''
}

export function contienePedidoDesdeWeb(texto: string): boolean {
  return texto.includes('🧾 Pedido confirmado desde el sitio')
}
