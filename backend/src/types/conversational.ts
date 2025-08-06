import { BotIntent, Emotion, UserMemoryWithId } from '@schemas/UserMemory'

/**
 * 🎯 Resumen útil del usuario para lógica conversacional y decisiones del bot.
 */
export interface ContextoUsuario {
  telefono: string
  nombre?: string
  ultimaIntencion?: BotIntent
  emocion?: Emotion
  frecuencia?: 'ocasional' | 'frecuente' | 'recurrente'
  perfil?: 'explorador' | 'comprador directo' | 'indeciso'
  zona?: string
  canalEntrada?: 'whatsapp' | 'instagram' | 'web' | 'tiktok' | 'email'
  pedidosPrevios?: number
  ultimoProductoVisto?: string
  idioma?: 'es' | 'en' | 'unknown'
  datos?: UserMemoryWithId
}

/**
 * 🤖 Resultado de detectar intenciones y emociones en un mensaje.
 */
export interface ResultadoIntento {
  /** 🧾 Texto original recibido del usuario */
  textoOriginal: string

  /** 🧹 Texto limpio, normalizado y en minúsculas */
  textoNormalizado: string

  /** 🧠 Intenciones detectadas (puede haber varias si es ambiguo) */
  intenciones: BotIntent[]

  /** 🎯 Intención principal elegida por el sistema */
  intencionPrincipal: BotIntent

  /** ❤️ Emoción detectada en el mensaje */
  emocionDetectada: Emotion

  /** 🌐 Idioma del mensaje */
  idiomaDetectado: 'es' | 'en' | 'unknown'
}

/**
 * 🧠 Resultado extendido del análisis conversacional.
 */
export interface ResultadoAnalisisMensaje {
  /** 🧠 Resultado base del intento (intención/emoción/idioma) */
  intento: ResultadoIntento

  /** 🆘 Si el mensaje requiere atención humana inmediata */
  requiereAtencionHumana: boolean

  /** 🔁 Si debe redirigir a un flujo conversacional específico */
  activarFlujo?: string

  /** 🏷️ Tags útiles detectados (ej: interesado_en_precios) */
  tagsDetectados?: string[]

  /** 🤖 Respuesta generada automáticamente por IA */
  respuestaIA?: string
}

/**
 * 💬 Respuesta generada por el bot o asistente.
 */
export interface RespuestaConversacional {
  /** 🗣️ Mensaje textual principal que se mostrará */
  texto: string

  /** ⚡ Opciones de sugerencia rápida (simula botones) */
  sugerenciaRapida?: string[]

  /** 📲 Indica si se deben mostrar botones */
  mostrarBotones?: boolean

  /** 🧠 Intención asociada a esta respuesta */
  intencionAsociada?: BotIntent

  /** 😃 Emoción asociada al mensaje del usuario */
  emocionDetectada?: Emotion

  /** 🌐 Idioma de la respuesta */
  idioma?: 'es' | 'en' | 'unknown'

  /** 🖼️ Imagen opcional para mostrar junto al mensaje */
  imagenDestacada?: string

  /** 🔘 Botones personalizables (con texto + id) */
  botonesOpcionales?: { texto: string; id: string }[]

  /** 🌐 Link externo opcional (ej: catálogo, landing) */
  linkExterno?: string
}
