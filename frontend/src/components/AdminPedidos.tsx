// ✅ src/pages/AdminPedidos.tsx

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { logout, isAuthenticated } from '../utils/auth'
import toast from 'react-hot-toast'

interface Pedido {
  id: string
  cliente?: string
  estado?: string
  total?: string
  totalBs?: string
  fecha?: string
  datosPago?: {
    referencia?: string
    fecha?: string
  }
  telefono?: string
}

const AdminPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [hayNotificacion, setHayNotificacion] = useState<boolean>(false)
  const [filtro, setFiltro] = useState<string>('')
  const [estadoFiltrado, setEstadoFiltrado] = useState<string | null>(null)
  const navigate = useNavigate()
  const ultimoIdRef = useRef<string | null>(null)

  const reproducirAlerta = () => {
    try {
      const sonido = new Audio('/alerta-MundoIAanime.mp3')
      sonido.play()
      if (navigator.vibrate) navigator.vibrate([300, 100, 300])
    } catch (e) {
      console.warn('⚠️ No se pudo reproducir la alerta:', e)
    }
  }

  const cargarPedidos = async () => {
    try {
      const auth = await isAuthenticated()
      if (!auth) throw new Error('Sesión inválida')

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!res.ok) throw new Error(`Servidor respondió con error ${res.status}`)

      const data: Pedido[] = await res.json()
      const ordenados = data.sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime())

      if (ordenados.length > 0 && ordenados[0].id !== ultimoIdRef.current) {
        if (ultimoIdRef.current !== null) {
          toast.success('📦 ¡Nuevo pedido recibido!')
          reproducirAlerta()
          setHayNotificacion(true)
        }
        ultimoIdRef.current = ordenados[0].id
      }

      setPedidos(ordenados)
    } catch (err) {
      console.error('❌ Error al cargar pedidos:', err)
      toast.error('No se pudieron cargar los pedidos. Verifica la conexión.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPedidos()
    const intervalo = setInterval(cargarPedidos, 10000)
    return () => clearInterval(intervalo)
  }, [])

  const resumenPago = (datosPago?: Pedido['datosPago']): string => {
    const ref = datosPago?.referencia?.trim()
    const fecha = datosPago?.fecha
    const refInvalida = !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')
    if (!fecha || refInvalida) return '—'
    return `Ref: ${ref}`
  }

  const claseEstado = (estado?: string) => {
    const e = (estado || '').toLowerCase()
    if (e.includes('cancelado')) return 'text-red-500'
    if (e.includes('entregado') || e.includes('recibido')) return 'text-green-400'
    if (e.includes('verificado') || e.includes('fabrica') || e.includes('empaquetado')) return 'text-yellow-300'
    if (e.includes('enviado') || e.includes('camino')) return 'text-blue-300'
    return 'text-white/60'
  }

  const datosFiltrados = pedidos.filter((p) => {
    const ref = resumenPago(p.datosPago)
    const valores = [
      p.id,
      p.cliente,
      p.estado,
      p.total,
      new Date(p.fecha || '').toLocaleString('es-VE'),
      ref,
    ].join(' ').toLowerCase()
    const coincideTexto = valores.includes(filtro.toLowerCase())
    const coincideEstado = !estadoFiltrado || (p.estado || '').toLowerCase() === estadoFiltrado
    return coincideTexto && coincideEstado
  })

  const handlePedidoClick = (id: string) => {
    setHayNotificacion(false)
    navigate(`/admin/pedidos/${id}`)
  }

  const totalPedidos = pedidos.length
  const totalCancelados = pedidos.filter(p => p.estado?.toLowerCase().includes('cancelado')).length
  const totalEnProceso = pedidos.filter(p =>
    ['pendiente', 'pago_verificado', 'en_fabrica', 'empaquetado', 'enviado'].includes((p.estado || '').toLowerCase())
  ).length

  const crearWidget = (label: string, valor: string | number, color: string, estadoTarget: string | null) => (
    <motion.div
      onClick={() => setEstadoFiltrado(estadoTarget)}
      className={`cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 ${color} shadow-glow-md transition-transform hover:scale-105 font-sans`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-sm text-white/70 font-medium">{label}</h3>
      <p className="text-2xl font-bold text-white">{valor}</p>
    </motion.div>
  )

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Encabezado y filtro */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-heading font-bold">📦 Pedidos registrados</h1>
          <input
            type="text"
            placeholder="Buscar por nombre, ID, referencia..."
            className="px-4 py-2 rounded-xl bg-white/10 placeholder-white/50 text-sm w-full md:w-96 backdrop-blur-md"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* Estadísticas widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {crearWidget('Total de pedidos', totalPedidos, 'border-white', null)}
          {crearWidget('En proceso', totalEnProceso, 'border-yellow-400', 'pendiente')}
          {crearWidget('Cancelados', totalCancelados, 'border-red-500', 'cancelado')}
        </div>

        {/* Lista de pedidos */}
        <motion.div
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {datosFiltrados.map((p) => (
            <div
              key={p.id}
              onClick={() => handlePedidoClick(p.id)}
              className="cursor-pointer p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg shadow-glow-md transition"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-white/70">
                  {new Date(p.fecha || '').toLocaleString('es-VE')}
                </p>
                <p className={`text-sm font-bold uppercase ${claseEstado(p.estado)}`}>
                  {p.estado || 'Pendiente'}
                </p>
              </div>
              <p className="text-lg font-semibold">{p.cliente || 'Cliente anónimo'}</p>
              <p className="text-white/70 text-sm">📱 {p.telefono || '—'}</p>
              <p className="text-white/80 text-sm mt-1">
                💵 Monto: <strong>${p.total}</strong>
              </p>
              <p className="text-white/60 text-sm">📎 {resumenPago(p.datosPago)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default AdminPedidos
