import axios from 'axios'

// 🌍 Detectar entorno
const isDev = import.meta.env.DEV

// 📡 Backend URL
export const API_URL = isDev
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL || 'https://appropriate-wilmette-aurelio104-e8ed3ae9.koyeb.app'

// 🍪 Cookies incluidas por defecto
axios.defaults.withCredentials = true

// ✨ Limpiar string
const sanitize = (input: string): string =>
  typeof input === 'string' ? input.trim() : ''

// 🔐 Iniciar sesión
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await axios.post(`${API_URL}/api/login`, {
      email: sanitize(email).toLowerCase(),
      password: sanitize(password)
    })

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
    const res = await axios.get(`${API_URL}/api/check-auth`)
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
    await axios.post(`${API_URL}/api/logout`)
    console.log('👋 Logout completado correctamente')
  } catch (err) {
    console.error('❌ Error durante logout:', err)
  }
}
