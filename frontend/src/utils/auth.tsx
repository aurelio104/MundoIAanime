import axios from 'axios';

// 🌍 Detectar si estamos en desarrollo
const isDev = import.meta.env.DEV;

// 🌐 URL base del backend dinámico
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.mundoiaanime.com';

// 🍪 Axios enviará cookies en todas las peticiones por defecto
axios.defaults.withCredentials = true;

// 🧼 Limpieza de entradas para evitar errores por espacios u otros caracteres
const sanitize = (input: string): string =>
  typeof input === 'string' ? input.trim() : '';

// 🔐 Headers comunes con Origin explícito para CORS
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Origin': isDev ? 'http://localhost:5173' : 'https://mundoiaanime.com'
});


// ✅ Iniciar sesión con email y password
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


// ✅ Verificar si el usuario tiene sesión activa
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    console.log('🔎 Verificando sesión activa...');

    const res = await axios.get(`${API_URL}/api/check-auth`, {
      headers: getDefaultHeaders(),
      timeout: 8000
    });

    const authenticated = res.status === 200 && res.data?.authenticated === true;

    console.log('✅ Resultado de sesión:', authenticated);
    return authenticated;
  } catch (err) {
    console.warn('⛔ Sesión no válida o expirada:', err);
    return false;
  }
};


// ✅ Cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}/api/logout`,
      {},
      {
        headers: getDefaultHeaders()
      }
    );
    console.log('👋 Logout completado correctamente');
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
  }
};
