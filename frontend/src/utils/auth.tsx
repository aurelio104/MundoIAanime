import axios from 'axios';

// 🌍 Detectar entorno
const isDev = import.meta.env.DEV;

// 📡 URL del backend dinámico (usando variable de entorno si existe)
export const API_URL = isDev
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL || 'https://api.mundoiaanime.com';

// 🍪 Incluir cookies en TODAS las peticiones axios
axios.defaults.withCredentials = true;

// 🔐 Headers comunes para CORS con Origin explícito
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Origin': isDev ? 'http://localhost:5173' : 'https://mundoiaanime.com'
});

// 🧼 Sanitizar cadenas para prevenir errores por espacios o caracteres invisibles
const sanitize = (input: string): string =>
  typeof input === 'string' ? input.trim() : '';

// 🔐 Iniciar sesión con email y contraseña
export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${API_URL}/api/login`,
      {
        email: sanitize(email).toLowerCase(),
        password: sanitize(password)
      },
      {
        headers: getDefaultHeaders(),
        timeout: 10000
      }
    );

    const success = res.status === 200 && res.data?.message === 'Login exitoso';
    console.log('✅ Login:', success ? 'Exitoso' : 'Fallido');
    return success;
  } catch (err) {
    console.error('❌ Error al iniciar sesión:', err);
    return false;
  }
};

// 🛡️ Verificar si hay una sesión activa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('🔎 Verificando sesión activa...');

    const res = await axios.get(`${API_URL}/api/check-auth`, {
      headers: getDefaultHeaders(),
      timeout: 8000
    });

    const authenticated =
      res.status === 200 && res.data?.authenticated === true;

    console.log('✅ Resultado:', authenticated);
    return authenticated;
  } catch (err) {
    console.warn('⛔ Sesión no válida o expirada:', err);
    return false;
  }
};

// 🚪 Cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/api/logout`,
      {},
      {
        headers: getDefaultHeaders()
      }
    );
    console.log('👋 Sesión cerrada correctamente');
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
  }
};
