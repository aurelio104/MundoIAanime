// ✅ FILE: src/context/NotificacionesContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'

// 🔒 Tipado del valor que maneja el contexto
interface NotificacionesContextType {
  hayNotificacion: boolean
  setHayNotificacion: Dispatch<SetStateAction<boolean>>
}

// 🎯 Creamos el contexto
const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined)

// 🧩 Props del proveedor
interface NotificacionesProviderProps {
  children: ReactNode
}

/**
 * 📦 Proveedor del contexto de notificaciones.
 * Encierra tu app o sección que necesita acceso al estado de notificaciones.
 */
export const NotificacionesProvider: React.FC<NotificacionesProviderProps> = ({ children }) => {
  const [hayNotificacion, setHayNotificacion] = useState<boolean>(false)

  // 💾 (Opcional) Cargar estado desde localStorage si se desea persistencia
  useEffect(() => {
    const stored = localStorage.getItem('hayNotificacion')
    if (stored === 'true') setHayNotificacion(true)
  }, [])

  // 💾 (Opcional) Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('hayNotificacion', hayNotificacion ? 'true' : 'false')
  }, [hayNotificacion])

  return (
    <NotificacionesContext.Provider value={{ hayNotificacion, setHayNotificacion }}>
      {children}
    </NotificacionesContext.Provider>
  )
}

/**
 * 🧠 Hook personalizado para usar el contexto de notificaciones.
 * Lanza error si se usa fuera del proveedor.
 */
export const useNotificaciones = (): NotificacionesContextType => {
  const context = useContext(NotificacionesContext)
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de un <NotificacionesProvider>')
  }
  return context
}
