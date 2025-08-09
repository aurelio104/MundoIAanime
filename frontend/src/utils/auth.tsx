// ✅ FILE: src/utils/auth.ts
import axios, { AxiosError } from 'axios';

// 🌍 Entorno
const isDev = import.meta.env.DEV;

// 🔗 Base URL del backend (sin slash final)
export const API_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? 'https://api.mundoiaanime.com');

// 🧰 Instancia Axios centralizada (con cookies y sin header Origin manual)
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    // ❌ Nunca agregues 'Origin' aquí. El navegador lo define.
  },
  timeout: 10000,
  // No lances excepción en 4xx; deja que nosotros decidamos
  validateStatus: (s) => s < 500
});

// 🧼 Sanitizar
const sanitize = (input: string): string =>
  typeof input === 'string' ? input.trim() : '';

// 🧯 Util para logs
const errMsg = (e: unknown) =>
  (e as AxiosError)?.message ?? (e as Error)?.message ?? String(e);

// 🧠 Cache y deduplicación para /check-auth (evita 429)
let authCache: { value: boolean; ts: number } | null = null;
let pendingAuth: Promise<boolean> | null = null;
const AUTH_CACHE_MS = 15_000; // 15s de cache suave

// ✅ Login
export async function login(email: string, password: string): Promise<boolean> {
  try {
    const res = await api.post('/api/login', {
      email: sanitize(email).toLowerCase(),
      password: sanitize(password)
    });

    const ok =
      res.status === 200 ||
      (typeof res.data?.message === 'string' &&
        res.data.message.toLowerCase().includes('login'));

    if (ok) {
      authCache = { value: true, ts: Date.now() };
    }

    if (!ok && isDev) console.warn('⚠️ Login no exitoso:', res.status, res.data);
    return ok;
  } catch (e) {
    console.error('❌ Error login:', errMsg(e));
    return false;
  }
}

// ✅ Verificar sesión activa (con cache + dedupe)
//    - Usa isAuthenticated(true) para forzar refresco si lo necesitas.
export async function isAuthenticated(force = false): Promise<boolean> {
  const now = Date.now();

  // Cache suave para evitar spam (especialmente por SW o re-renders)
  if (!force && authCache && now - authCache.ts < AUTH_CACHE_MS) {
    return authCache.value;
  }

  // Deduplicar llamadas concurrentes
  if (pendingAuth) return pendingAuth;

  pendingAuth = (async () => {
    try {
      // 8s para esta verificación es razonable
      const res = await api.get('/api/check-auth', { timeout: 8000 });

      // Considera 200 como autenticado; admite { authenticated: true } o { ok: true }
      const ok =
        res.status === 200 &&
        (res.data?.authenticated === true || res.data?.ok === true);

      authCache = { value: ok, ts: Date.now() };
      return ok;
    } catch (e) {
      console.warn('⛔ Sesión no válida/expirada:', errMsg(e));
      authCache = { value: false, ts: Date.now() };
      return false;
    } finally {
      pendingAuth = null;
    }
  })();

  return pendingAuth;
}

// ✅ Logout
export async function logout(): Promise<void> {
  try {
    const res = await api.post('/api/logout', {});
    if (res.status >= 400 && isDev) {
      console.warn('⚠️ Logout respondió:', res.status, res.data);
    }
  } catch (e) {
    console.error('❌ Error logout:', errMsg(e));
  } finally {
    // Limpia cache local
    authCache = { value: false, ts: Date.now() };
  }
}
