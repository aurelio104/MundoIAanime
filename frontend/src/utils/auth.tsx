// ✅ FILE: src/utils/auth.ts
import axios from 'axios'

// 🌍 Determina si estás en desarrollo
const isDev = import.meta.env.DEV

// 📡 URL base del backend
export const API_URL = isDev
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL || 'https://api.mundoiaanime.com'

// 🍪 Asegura que axios incluya cookies en cada solicitud
axios.defaults.withCredentials = true

// 🧼 Limpia cadenas de entrada
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
        timeout: 10000
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

// 🛡️ Verificar si hay sesión activa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('👉 Verificando sesión activa con cookie...')

    const res = await axios.get(`${API_URL}/api/check-auth`, {
      withCredentials: true,
      timeout: 7000
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
    await axios.post(`${API_URL}/api/logout`, {}, { withCredentials: true })
    console.log('👋 Logout completado correctamente')
  } catch (err) {
    console.error('❌ Error durante logout:', err)
  }
}
