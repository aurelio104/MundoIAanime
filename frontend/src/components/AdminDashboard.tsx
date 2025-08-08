import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../utils/auth'
import heroBg from '../assets/hero.jpg' // Asegúrate de tener esta imagen

interface Pedido {
  id: string
  titulo: string
  precio: string
  idCompra: string
  fecha: string
  nombre: string
  apellido: string
  correo: string
  metodo: string
  comprobante: string
  confirmado: boolean
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [visitas, setVisitas] = useState<number>(0)
  const navigate = useNavigate()

  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setPedidos(data)
      } else {
        console.error('❌ Error al obtener pedidos:', await res.text())
      }
    } catch (e) {
      console.error('❌ Error al cargar pedidos:', e)
    }
  }

  const cargarVisitas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setVisitas(data.total)
      } else {
        console.error('❌ Error al obtener visitas:', await res.text())
      }
    } catch (e) {
      console.error('❌ Error al cargar visitas:', e)
    }
  }

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const auth = await isAuthenticated()
        if (!auth) throw new Error('Sesión inválida')
        console.log('✅ Sesión de administrador válida')
        await cargarPedidos()
        await cargarVisitas()
      } catch {
        await logout()
        navigate('/admin', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    verificarSesion()
  }, [navigate])

  const confirmarPago = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${id}/confirmar`, {
        method: 'PATCH',
        credentials: 'include'
      })
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, confirmado: true } : p))
      )
    } catch (e) {
      alert('⚠️ Error al confirmar el pago.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin', { replace: true })
  }

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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold font-sans">Panel de Pedidos – MundoIAanime</h1>
              <p className="text-white/60 text-sm mt-2 font-sans">
                👁️ Total de visitas registradas:{' '}
                <span className="font-bold">{visitas}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-white text-black rounded-full px-5 py-2 hover:bg-red-500 hover:text-white transition font-semibold"
            >
              Cerrar sesión
            </button>
          </div>

          {pedidos.length === 0 ? (
            <p className="text-white/70 text-center mt-10 font-sans">
              No hay pedidos registrados por el momento.
            </p>
          ) : (
            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-glow-md"
                >
                  <p className="text-lg font-semibold">{pedido.titulo}</p>
                  <p className="text-white/70 text-sm">💵 Precio: {pedido.precio}</p>
                  <p className="text-white/70 text-sm">🆔 ID Compra: {pedido.idCompra}</p>
                  <p className="text-white/70 text-sm">📅 Fecha: {pedido.fecha}</p>
                  <p className="text-white/70 text-sm">👤 Nombre: {pedido.nombre} {pedido.apellido}</p>
                  <p className="text-white/70 text-sm">✉️ Correo: {pedido.correo}</p>
                  <p className="text-white/70 text-sm">💳 Método: {pedido.metodo}</p>
                  <p className="text-white/70 text-sm">📎 Comprobante: {pedido.comprobante}</p>

                  <button
                    onClick={() => confirmarPago(pedido.id)}
                    disabled={pedido.confirmado}
                    className={`mt-4 w-full py-2 rounded-full text-sm font-semibold transition ${
                      pedido.confirmado
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {pedido.confirmado ? '✅ Pago Confirmado' : 'Confirmar Pago'}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
