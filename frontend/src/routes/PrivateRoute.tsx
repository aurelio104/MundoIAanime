// ✅ FILE: src/routes/PrivateRoute.tsx

import React, { useEffect, useState, ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation()
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        console.log('🔐 Verificando acceso a ruta privada...')
        const ok = await isAuthenticated()

        if (ok) {
          console.log('✅ Autenticación válida en ruta protegida')
          setAuthState('authorized')
        } else {
          console.warn('⛔ No autorizado en ruta protegida')
          setAuthState('unauthorized')
        }
      } catch (err) {
        console.error('❌ Error verificando sesión:', err)
        setAuthState('unauthorized')
      }
    }

    verificarSesion()
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <LoadingSpinner message="Verificando acceso seguro..." />
      </div>
    )
  }

  if (authState === 'unauthorized') {
    return <Navigate to="/admin" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default PrivateRoute
