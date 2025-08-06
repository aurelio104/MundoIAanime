// ✅ FILE: src/routes/PrivateRoute.tsx

import React, { useEffect, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'

// 🎯 Props tipadas
interface PrivateRouteProps {
  children: ReactNode
}

/**
 * 🔒 Componente que protege rutas privadas.
 * Verifica si hay sesión válida. Si no, redirige al login.
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation()
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const ok = await isAuthenticated()
        setAuthState(ok ? 'authorized' : 'unauthorized')
      } catch (err) {
        console.error('❌ Error al verificar sesión:', err)
        setAuthState('unauthorized')
      }
    }

    verificarSesion()
  }, [])

  // ⏳ Mientras verifica autenticación
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <LoadingSpinner message="Verificando acceso seguro..." />
      </div>
    )
  }

  // ❌ Redirige si no tiene sesión
  if (authState === 'unauthorized') {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  // ✅ Acceso permitido
  return <>{children}</>
}

export default PrivateRoute
