// ✅ FILE: src/components/AdminDashboard.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth'

type PedidoAdmin = {
  id: string
  estado?: string
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [visitas, setVisitas] = useState(0)
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const navigate = useNavigate()

  const cargarDatos = async () => {
    try {
      // 🔹 Visitas
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include',
      })
      if (resVisitas.ok) {
        const dataVisitas = await resVisitas.json()
        setVisitas(Number(dataVisitas?.total || 0))
      } else {
        console.warn('⚠️ /api/visitas respondió:', resVisitas.status, await resVisitas.text())
      }

      // 🔹 Pedidos (ADMIN)
      const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        credentials: 'include',
      })
      if (resPedidos.ok) {
        const dataPedidos: PedidoAdmin[] = await resPedidos.json()
        // Consideramos "pendiente" solo los que tienen estado === 'pendiente'
        const pendientes = dataPedidos.filter(p => (p.estado || '').toLowerCase() === 'pendiente').length
        setPedidosPendientes(pendientes)
      } else {
        console.warn('⚠️ /api/admin/pedidos respondió:', resPedidos.status, await resPedidos.text())
      }
    } catch (err) {
      console.error('❌ Error al cargar datos del dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const verificarSesionYCargar = async () => {
      try {
        const auth = await isAuthenticated()
        if (!auth) throw new Error('Sesión inválida')
        await cargarDatos()
      } catch {
        await logout()
        navigate('/admin', { replace: true })
      }
    }
    verificarSesionYCargar()
  }, [navigate])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-xl font-sans bg-black/90 backdrop-blur-xl">
        🔒 Verificando acceso seguro...
      </div>
    )
  }

  return (
    <section
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/hero.png')" }}
    >
      {/* Capa oscura + blur para efecto iOS */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 text-white text-center">
        <h1 className="text-4xl font-heading font-bold mb-12 animate-slideFadeUp">
          Panel de Administración – MundoIAanime
        </h1>

        {/* Botonera central con efecto glass */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl animate-slideFadeUp">
          <button
            onClick={() => navigate('/admin/visitas')}
            className="glass-button glass-shadow group"
            aria-label="Ver visitas"
          >
            {/* Ojo / Visitas */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 group-hover:scale-110 transition"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-2xl font-semibold">{visitas}</span>
            <span className="text-sm opacity-70">Visitas</span>
          </button>

          <button
            onClick={() => navigate('/admin/pedidos')}
            className="relative glass-button glass-shadow group"
            aria-label="Ver pedidos"
          >
            {/* Caja / Pedidos */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 group-hover:scale-110 transition"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 7.5L12 3l9 4.5M3 7.5v9L12 21m0-13.5v13.5M21 7.5v9l-9 4.5" />
            </svg>
            <span className="text-lg font-semibold">Pedidos</span>

            {pedidosPendientes > 0 && (
              <span className="absolute top-2 right-3 text-xs bg-red-600 rounded-full px-2 py-0.5 font-bold shadow">
                {pedidosPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/productos')}
            className="glass-button glass-shadow group"
            aria-label="Ver catálogo"
          >
            {/* Lista / Catálogo */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-1 group-hover:scale-110 transition"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-lg font-semibold">Catálogo</span>
          </button>
        </div>

        <button
          onClick={async () => {
            await logout()
            navigate('/admin', { replace: true })
          }}
          className="mt-14 bg-white text-black rounded-full px-8 py-2 hover:bg-red-500 hover:text-white transition font-semibold text-sm shadow-md"
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  )
}

export default AdminDashboard
