// src/types/bot-whatsapp.d.ts

declare module '@bot-whatsapp/bot' {
  /**
   * 📩 Estructura del mensaje entrante del usuario
   */
  export type Ctx = {
    body: string
    from: string
    pushName?: string
    name?: string

    media?: {
      mimeType: string
      buffer: Buffer
      fileName?: string
      size?: number
    }

    options?: Record<string, unknown>

    voiceNote?: {
      mimeType: string
      buffer: Buffer
      transcription?: string
    }

    mediaUrl?: string
    mediaMime?: string
    mediaType?: 'image' | 'video' | 'audio' | 'document'

    language?: 'es' | 'en' | 'unknown'

    location?: {
      latitude: number
      longitude: number
      description?: string
    }

    contact?: {
      name: string
      phoneNumber: string
    }

    file?: {
      name: string
      mimeType: string
      url: string
    }
  }

  /**
   * 🔄 Manejador de estado de conversación
   */
  export type StateHandler = {
    getMyState: () => Promise<Record<string, any>>
    update: (data: Record<string, any>) => Promise<void>
    clear: () => Promise<void>
  }

  /**
   * 💬 Formato de mensaje dinámico de respuesta
   */
  export type FlowMessage =
    | string
    | { body: string; media?: string }

  /**
   * 🛠️ Propiedades disponibles dentro de cada flujo conversacional
   */
  export type FlowFnProps = {
    ctx: Ctx
    flowDynamic: (messages: FlowMessage | FlowMessage[]) => Promise<void>
    gotoFlow: (flow: any) => Promise<void>
    fallBack: () => Promise<void>
    state: StateHandler
  }

  /**
   * ✨ Utilidad para simplificar tipos en flujos
   */
  export type FlowTools = Omit<FlowFnProps, 'ctx'>

  export type FlowAction = (ctx: Ctx, tools: FlowTools) => Promise<void> | void

  /**
   * 🧠 Crear un flujo conversacional por palabra clave
   */
  export function addKeyword(
    keyword: string | string[]
  ): {
    addAction(fn: FlowAction): ReturnType<typeof addKeyword>
    addAnswer(
      message: string | string[],
      options?: {
        delay?: number
        media?: string
        capture?: boolean
        buttons?: { body: string; id: string }[]
      },
      action?: FlowAction
    ): ReturnType<typeof addKeyword>
  }

  /**
   * 🧭 Eventos especiales del sistema
   */
  export const EVENTS: {
    WELCOME: 'WELCOME'
    MESSAGE: 'MESSAGE'
    VOICE_NOTE: 'VOICE_NOTE'
    MEDIA: 'MEDIA'
    FILE: 'FILE'
    CONTACT: 'CONTACT'
    LOCATION: 'LOCATION'
    BUTTON: 'BUTTON'
  }

  /**
   * 🚀 Inicializar el bot y sus flujos
   */
  export function createBot(options: any): any
  export function createFlow(flows: any[]): any

  /**
   * 📦 Exportación por defecto del módulo
   */
  const _default: {
    addKeyword: typeof addKeyword
    createBot: typeof createBot
    createFlow: typeof createFlow
    EVENTS: typeof EVENTS
  }

  export default _default
}
