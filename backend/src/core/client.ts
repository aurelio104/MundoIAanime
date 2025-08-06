// ✅ client.ts — adaptado para flujo de cursos con pago verificado y generación de acceso

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  WASocket,
  proto
} from '@whiskeysockets/baileys'

import qrcode from 'qrcode-terminal'
import pino from 'pino'

import { connectMongo } from '../database/mongo.js'
import { empresaConfig } from '../config/empresaConfig.js'
import { contienePedidoDesdeWeb } from '../intelligence/curso.detector.js'
import { manejarPedidoCurso } from '../handlers/pedidoCurso.handler.js'
import { procesarPagoVerificado } from '../handlers/pagoVerificado.handler.js'

import type { BotHandlerContext } from '../types/BotHandlerContext.js'

function extractRawText(msg: proto.IWebMessageInfo): string {
  const m = msg.message
  if (!m) return ''
  if ('conversation' in m) return m.conversation?.trim() || ''
  if ('extendedTextMessage' in m) return m.extendedTextMessage?.text?.trim() || ''
  if ('buttonsResponseMessage' in m) return m.buttonsResponseMessage?.selectedDisplayText?.trim() || ''
  if ('listResponseMessage' in m) return m.listResponseMessage?.title?.trim() || ''
  return ''
}

let botStarted = false
let globalSock: WASocket | null = null

export const getSock = (): WASocket => {
  if (!globalSock) throw new Error('El socket de WhatsApp aún no está inicializado')
  return globalSock
}

export async function startBot(authPath: string) {
  if (botStarted) return
  botStarted = true

  try {
    await connectMongo()
    const { state, saveCreds } = await useMultiFileAuthState(authPath)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, undefined)
      },
      markOnlineOnConnect: true,
      logger: pino({ level: 'silent' }),
      syncFullHistory: false,
      connectTimeoutMs: 45000
    })

    globalSock = sock
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        console.clear()
        console.log('📲 Escanea este código QR con WhatsApp:')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'close') {
        const reasonCode = (lastDisconnect?.error as any)?.output?.statusCode
        console.warn(`⚠️ Desconexión detectada. Código: ${reasonCode}`)
        const shouldReconnect = reasonCode !== DisconnectReason.loggedOut
        if (shouldReconnect) {
          botStarted = false
          console.log('🔁 Reintentando conexión...')
          setTimeout(() => startBot(authPath), 3000)
        } else {
          console.log('🤖 No se reintentará la conexión automáticamente.')
        }
      } else if (connection === 'open') {
        console.clear()
        console.log('✅ Bot conectado exitosamente a WhatsApp')
      }
    })

    const adminJid = empresaConfig.admin.numero.replace('+', '') + '@s.whatsapp.net'

    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const msg = messages[0]
        if (!msg.message) return

        const from = typeof msg.key.remoteJid === 'string' ? msg.key.remoteJid.trim() : ''
        const rawText = extractRawText(msg)
        const comando = rawText.toLowerCase().trim()

        const name = msg.pushName || from.split('@')[0] || 'cliente'
        const context: BotHandlerContext = { sock, msg, from, name, text: rawText, userMemory: undefined }

        // ✅ Verifica si el mensaje es un pedido de curso
        if (contienePedidoDesdeWeb(rawText)) {
          console.log('[client.ts] 📥 Pedido de curso detectado')
          await manejarPedidoCurso(context)
          return
        }

        // ✅ Si es admin y escribe /pago verificado ID...
        if (from === adminJid && comando.startsWith('/pago verificado')) {
          const idCompra = comando.split(' ')[2]
          if (!idCompra) return
          console.log(`[client.ts] 🧾 Verificando pago ID: ${idCompra}`)
          await procesarPagoVerificado(idCompra)
          return
        }

        console.log(`[client.ts] ⚠️ Mensaje sin manejar: "${rawText}"`)
      } catch (err: any) {
        if (err?.message?.includes('Bad MAC')) {
          console.warn('🔐 Bad MAC detectado.')
        } else {
          console.error('❌ Error procesando mensaje:', err instanceof Error ? err.message : JSON.stringify(err))
        }
      }
    })
  } catch (err) {
    console.error('❌ Error en startBot:', err instanceof Error ? err.message : JSON.stringify(err))
  }
}
