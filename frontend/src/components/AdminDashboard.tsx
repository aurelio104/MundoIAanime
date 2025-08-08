// ✅ FILE: src/components/AdminDashboard.tsx

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
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include'
      })
      const dataVisitas = await resVisitas.json()
      setVisitas(dataVisitas.total || 0)

      const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
        credentials: 'include'
      })
      const dataPedidos = await resPedidos.json()
      const pendientes = dataPedidos.filter((p: any) => !p.confirmado).length
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl"></div>
      <div className="relative z-10 py-20 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-sans mb-10">Panel de Administración – MundoIAanime</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/admin/visitas')}
              className="bg-white/10 hover:bg-white/20 transition text-white rounded-2xl py-10 px-6 shadow-lg"
            >
              👁️ <br />
              <span className="text-2xl font-bold">{visitas}</span> <br />
              Visitas
            </button>

            <button
              onClick={() => navigate('/admin/pedidos')}
              className="relative bg-white/10 hover:bg-white/20 transition text-white rounded-2xl py-10 px-6 shadow-lg"
            >
              📦 <br />
              Pedidos
              {pedidosPendientes > 0 && (
                <span className="absolute top-2 right-4 text-xs bg-red-600 rounded-full px-2 py-1 font-bold">
                  {pedidosPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/admin/productos')}
              className="bg-white/10 hover:bg-white/20 transition text-white rounded-2xl py-10 px-6 shadow-lg"
            >
              📚 <br />
              Catálogo
            </button>
          </div>

          <button
            onClick={async () => {
              await logout()
              navigate('/admin', { replace: true })
            }}
            className="mt-12 text-sm bg-white text-black rounded-full px-6 py-2 hover:bg-red-500 hover:text-white transition font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
