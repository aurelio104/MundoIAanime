import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth'

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [visitas, setVisitas] = useState(0)
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const navigate = useNavigate()

  const cargarDatos = async () => {
    try {
      // ✅ Obtener visitas
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include',
      })
      if (!resVisitas.ok) throw new Error('Error al obtener visitas')
      const dataVisitas = await resVisitas.json()
      setVisitas(dataVisitas.total || 0)

      // ✅ Obtener pedidos pendientes (usuarios con estadoPago === 'pendiente')
      const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pendientes`, {
        credentials: 'include',
      })
      if (!resPedidos.ok) throw new Error('Error al obtener pedidos')
      const dataPedidos = await resPedidos.json()

      // ✅ Contar pedidos pendientes
      const pendientes = Array.isArray(dataPedidos)
        ? dataPedidos.length
        : 0
      setPedidosPendientes(pendientes)

    } catch (err) {
      console.error('❌ Error al cargar datos del dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const auth = await isAuthenticated()
        if (!auth) throw new Error('Sesión inválida')
        await cargarDatos()
      } catch {
        await logout()
        navigate('/admin', { replace: true })
      }
    }

    verificarSesion()
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 text-white text-center">
        <h1 className="text-4xl font-heading font-bold mb-12 animate-slideFadeUp">
          Panel de Administración – MundoIAanime
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl animate-slideFadeUp">
          {/* 📈 Botón Visitas */}
          <button
            onClick={() => navigate('/admin/visitas')}
            className="glass-button glass-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xl font-semibold">{visitas}</span>
            <span className="text-sm opacity-70">Visitas</span>
          </button>

          {/* 📦 Botón Pedidos */}
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="relative glass-button glass-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h18v18H3V3z" />
            </svg>
            <span className="text-lg font-semibold">Pedidos</span>
            {pedidosPendientes > 0 && (
              <span className="absolute top-2 right-4 text-xs bg-red-600 rounded-full px-2 py-0.5 font-bold">
                {pedidosPendientes}
              </span>
            )}
          </button>

          {/* 📚 Botón Catálogo */}
          <button
            onClick={() => navigate('/admin/productos')}
            className="glass-button glass-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-lg font-semibold">Catálogo</span>
          </button>
        </div>

        {/* 🚪 Cerrar sesión */}
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
