import { WASocket, proto } from '@whiskeysockets/baileys'
import { getUser } from '@memory/memory.mongo'
import { UserMemoryWithId } from '@schemas/UserMemory'

/**
 * 🧠 Contexto completo que se pasa a cada handler del bot.
 * Incluye la conexión, el mensaje recibido y metadatos útiles del usuario.
 */
export interface BotHandlerContext {
  /** 📱 Conexión activa del bot con WhatsApp */
  sock: WASocket

  /** 📨 Mensaje completo recibido de WhatsApp */
  msg: proto.IWebMessageInfo

  /** 🔢 ID del remitente (por ejemplo: '584123456789@s.whatsapp.net') */
  from: string

  /** 🧑‍💬 Nombre visible del remitente */
  name: string

  /** 💬 Texto limpio extraído del mensaje (o transcripción si es nota de voz) */
  text: string

  /** 🧠 Memoria del usuario recuperada desde MongoDB */
  userMemory?: Awaited<ReturnType<typeof getUser>>

  /** 🌍 Idioma detectado ('es', 'en', etc.) */
  language?: 'es' | 'en' | 'unknown'

  /** 🎙️ Si es nota de voz, incluye MIME y buffer */
  voiceNote?: {
    mimeType: string
    buffer: Buffer
    transcription?: string
  }

  /** 🖼️ Si se envía media (imagen, video, etc.) */
  mediaUrl?: string
  mediaMime?: string
  mediaType?: 'image' | 'video' | 'audio' | 'document'

  /** 📍 Ubicación compartida */
  location?: {
    latitude: number
    longitude: number
    description?: string
  }

  /** 👤 Contacto compartido */
  contact?: {
    name: string
    phoneNumber: string
  }

  /** 📄 Archivo adjunto */
  file?: {
    name: string
    mimeType: string
    url: string
  }
}
