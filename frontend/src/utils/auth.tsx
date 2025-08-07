// ✅ FILE: src/utils/auth.ts

import axios from 'axios'

// 🌍 Detectar entorno
const isDev = import.meta.env.DEV

// 📡 Backend URL dinámico
export const API_URL = isDev
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL || 'https://appropriate-wilmette-aurelio104-e8ed3ae9.koyeb.app'

// 🍪 Incluir cookies en TODAS las peticiones (requerido para cookies Secure + SameSite=None)
axios.defaults.withCredentials = true

// 🧼 Limpiar inputs
const sanitize = (input: string): string =>
  typeof input === 'string' ? input.trim() : ''

// 🔐 Iniciar sesión
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${API_URL}/api/login`,
      {
        email: sanitize(email).toLowerCase(),
        password: sanitize(password)
      },
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          // 🔒 Necesario para Safari y producción
          'Content-Type': 'application/json',
          'Origin': isDev ? 'http://localhost:5173' : 'https://mundo-i-aanime-hxbt.vercel.app'
        }
      }
    )

    const success = res.status === 200 && res.data?.message === 'Login exitoso'
    console.log('✅ Login:', success ? 'Exitoso' : 'Fallido')
    return success
  } catch (err) {
    console.error('❌ Login error:', err)
    return false
  }
}

// 🛡️ Verificar sesión activa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('👉 Verificando sesión activa con cookie...')

    const res = await axios.get(`${API_URL}/api/check-auth`, {
      withCredentials: true,
      timeout: 8000,
      headers: {
        'Origin': isDev ? 'http://localhost:5173' : 'https://mundo-i-aanime-hxbt.vercel.app'
      }
    })

    const authenticated = res.status === 200 && res.data?.authenticated === true
    console.log('✅ Resultado de sesión activa:', authenticated)
    return authenticated
  } catch (err) {
    console.warn('⛔ Sesión no válida:', err)
    return false
  }
}

// 👋 Cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/api/logout`,
      {},
      {
        withCredentials: true,
        headers: {
          'Origin': isDev ? 'http://localhost:5173' : 'https://mundo-i-aanime-hxbt.vercel.app'
        }
      }
    )
    console.log('👋 Logout completado correctamente')
  } catch (err) {
    console.error('❌ Error durante logout:', err)
  }
}
