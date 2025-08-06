// ✅ FILE: src/config/empresaConfig.ts

export const empresaConfig = {
  nombre: 'MundoIAanime',

  admin: {
    numero: '+584128966414'
  },

  contacto: {
    telefono: '+584128861220',
    correo: 'contacto@mundoiaanime.com'
  },

  enlaces: {
    web: 'https://mundoiaanime.com',
    instagram: 'https://www.instagram.com/mundoiaanime',
    tiktok: 'https://www.tiktok.com/@mundoiaanime',
    facebook: 'https://www.facebook.com/mundoiaanime'
  },

  metodosPago: {
    pagoMovil: {
      telefono: '04145873062',
      cedula: '25698580',
      banco: 'Banesco'
    },
    zelle: {
      correo: 'mundoiaanime@gmail.com',
      titular: 'MUNDO IANIME INC'
    },
    binance: {
      correo: 'pagos@mundoiaanime.com'
    }
  },

  mensajes: {
    agradecimiento: '¡Gracias por tu compra en *{nombre}*! Pronto recibirás tu acceso al curso. 📚✨',
    seguimiento: '📩 Si ya enviaste tu comprobante, nuestro equipo lo verificará pronto. Gracias por tu paciencia.',
    despedida: '¡Hasta pronto! Que disfrutes tu experiencia en *{nombre}*. 🚀'
  },

  configuracionBot: {
    saludo: '¡Hola {nombre}! Soy el asistente de {nombre}. ¿En qué puedo ayudarte hoy?',
    recordatorioComprobante: '📸 Aún esperamos tu *comprobante de pago*. Cuando lo tengas, envíalo por aquí.',
    respuestaFallback: 'Disculpa, ¿puedes explicarme un poco más para poder ayudarte mejor?'
  },

  sistema: {
    version: '1.0.0',
    permitirQR: true,
    mensajesDebug: false
  }
}
