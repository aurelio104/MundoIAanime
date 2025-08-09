// ✅ FILE: src/pages/AdminPedidos.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth'
import toast from 'react-hot-toast'

type DatosPago = {
  referencia?: string
  fecha?: string
}

export interface PedidoItem {
  id: string                    // ← viene del backend mapeado a String(p._id)
  cliente?: string              // "Nombre Apellido"
  estado?: string               // pendiente | pago_verificado | ...
  total?: string                // "9.99"
  totalBs?: string              // opcional
  fecha?: string                // ISO string
  datosPago?: DatosPago
  telefono?: string
}

const ESTADOS_ORDEN = [
  'pendiente',
  'pago_verificado',
  'en_fabrica',
  'empaquetado',
  'enviado',
  'en_camino',
  'entregado',
  'recibido',
  'cancelado',
]

const claseEstado = (estado?: string) => {
  const e = (estado || '').toLowerCase()
  if (e.includes('cancelado')) return 'text-red-500'
  if (e.includes('entregado') || e.includes('recibido')) return 'text-green-400'
  if (e.includes('verificado') || e.includes('fabrica') || e.includes('empaquetado')) return 'text-yellow-300'
  if (e.includes('enviado') || e.includes('camino')) return 'text-blue-300'
  return 'text-white/60'
}

const resumenPago = (datosPago?: DatosPago): string => {
  const ref = datosPago?.referencia?.trim()
  const fecha = datosPago?.fecha
  const refInvalida = !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')
  if (!fecha || refInvalida) return '—'
  return `Ref: ${ref}`
}

const AdminPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [estadoFiltrado, setEstadoFiltrado] = useState<string | null>(null)
  const [sonando, setSonando] = useState(false)
  const navigate = useNavigate()
  const ultimoIdRef = useRef<string | null>(null)
  const intervaloRef = useRef<number | null>(null)

  const reproducirAlerta = () => {
    try {
      if (sonando) return
      setSonando(true)
      const audio = new Audio('/alerta-MundoIAanime.mp3')
      audio.play().catch(() => {})
      if (navigator.vibrate) navigator.vibrate([300, 120, 300])
      setTimeout(() => setSonando(false), 1500)
    } catch {
      /* noop */
    }
  }

  const cargarPedidos = async (controller?: AbortController) => {
    try {
      const ok = await isAuthenticated()
      if (!ok) throw new Error('Sesión inválida')

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        method: 'GET',
        credentials: 'include',
        signal: controller?.signal,
      })

      if (res.status === 401) {
        await logout()
        navigate('/admin', { replace: true })
        return
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Error ${res.status} al obtener pedidos ${txt}`)
      }

      const data: PedidoItem[] = await res.json()

      // Orden descendente por fecha
      const ordenados = [...data].sort((a, b) => {
        const tb = new Date(b.fecha || 0).getTime()
        const ta = new Date(a.fecha || 0).getTime()
        return tb - ta
      })

      // Notificación si hay nuevo pedido
      if (ordenados.length > 0 && ordenados[0].id !== ultimoIdRef.current) {
        if (ultimoIdRef.current !== null) {
          toast.success('📦 ¡Nuevo pedido recibido!')
          reproducirAlerta()
        }
        ultimoIdRef.current = ordenados[0].id
      }

      setPedidos(ordenados)
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('❌ Error al cargar pedidos:', err)
      toast.error('No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    cargarPedidos(controller)

    // Auto-refresh cada 10s
    intervaloRef.current = window.setInterval(() => cargarPedidos(), 10000)

    return () => {
      controller.abort()
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
        intervaloRef.current = null
      }
    }
  }, [])

  const stats = useMemo(() => {
    const total = pedidos.length
    const cancelados = pedidos.filter(p => (p.estado || '').toLowerCase().includes('cancelado')).length
    const enProceso = pedidos.filter(p => {
      const e = (p.estado || '').toLowerCase()
      return ['pendiente', 'pago_verificado', 'en_fabrica', 'empaquetado', 'enviado', 'en_camino'].includes(e)
    }).length
    return { total, cancelados, enProceso }
  }, [pedidos])

  const datosFiltrados = useMemo(() => {
    const t = filtroTexto.toLowerCase().trim()
    return pedidos
      .filter((p) => {
        const ref = resumenPago(p.datosPago)
        const blob = [
          p.id,
          p.cliente,
          p.estado,
          p.total,
          new Date(p.fecha || '').toLocaleString('es-VE'),
          ref,
          p.telefono,
        ]
          .join(' ')
          .toLowerCase()

        const coincideTexto = !t || blob.includes(t)
        const coincideEstado = !estadoFiltrado || (p.estado || '').toLowerCase() === estadoFiltrado
        return coincideTexto && coincideEstado
      })
      // como extra: agrupar por prioridad de estado
      .sort((a, b) => {
        const ea = ESTADOS_ORDEN.indexOf((a.estado || '').toLowerCase())
        const eb = ESTADOS_ORDEN.indexOf((b.estado || '').toLowerCase())
        return (ea === -1 ? 999 : ea) - (eb === -1 ? 999 : eb)
      })
  }, [pedidos, filtroTexto, estadoFiltrado])

  const crearWidget = (label: string, valor: string | number, color: string, targetEstado: string | null) => (
    <motion.button
      type="button"
      onClick={() => setEstadoFiltrado(targetEstado)}
      className={`text-left cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl p-4 border-l-4 ${color} shadow-glow-md transition-transform hover:scale-105 font-sans`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-sm text-white/70 font-medium">{label}</h3>
      <p className="text-2xl font-bold text-white">{valor}</p>
    </motion.button>
  )

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-xl font-sans bg-black/90 backdrop-blur-xl">
        🔄 Cargando pedidos...
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Encabezado y filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold">📦 Pedidos</h1>
            <button
              onClick={() => cargarPedidos()}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/10"
              title="Actualizar"
            >
              Actualizar
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre, ID, referencia..."
              className="px-4 py-2 rounded-xl bg-white/10 placeholder-white/50 text-sm w-full md:w-96 backdrop-blur-md"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {estadoFiltrado && (
              <button
                onClick={() => setEstadoFiltrado(null)}
                className="px-3 py-2 rounded-xl bg-white/10 text-xs border border-white/10 hover:bg-white/20"
              >
                Limpiar estado
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {crearWidget('Total de pedidos', stats.total, 'border-white', null)}
          {crearWidget('En proceso', stats.enProceso, 'border-yellow-400', 'pendiente')}
          {crearWidget('Cancelados', stats.cancelados, 'border-red-500', 'cancelado')}
        </div>

        {/* Lista */}
        {datosFiltrados.length === 0 ? (
          <div className="text-center text-white/60 mt-10">No hay pedidos que coincidan con el filtro.</div>
        ) : (
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {datosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/pedidos/${p.id}`)}
                className="text-left cursor-pointer p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-lg shadow-glow-md transition"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-white/70">
                    {p.fecha ? new Date(p.fecha).toLocaleString('es-VE') : '—'}
                  </p>
                  <p className={`text-sm font-bold uppercase ${claseEstado(p.estado)}`}>
                    {p.estado || 'Pendiente'}
                  </p>
                </div>

                <div className="mt-1 grid sm:grid-cols-2 gap-1">
                  <p className="text-lg font-semibold truncate">{p.cliente || 'Cliente anónimo'}</p>
                  <p className="text-white/70 text-sm sm:text-right">📱 {p.telefono || '—'}</p>
                </div>

                <div className="mt-1 grid sm:grid-cols-2 gap-1">
                  <p className="text-white/80 text-sm">
                    💵 Monto: <strong>${p.total ?? '—'}</strong>{p.totalBs ? ` · ${p.totalBs}` : ''}
                  </p>
                  <p className="text-white/60 text-sm sm:text-right">📎 {resumenPago(p.datosPago)}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default AdminPedidos
