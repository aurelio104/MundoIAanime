// ✅ FILE: src/pages/AdminPedidoDetalle.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { isAuthenticated, logout } from '../utils/auth'

type DatosPago = {
  referencia?: string
  fecha?: string
}

interface PedidoView {
  id: string
  estado?: string
  total?: number
  totalBs?: string
  fecha?: string
  productos?: string[]
  tallas?: string[]
  colores?: string[]
  preciosUnitarios?: number[]
  metodoPago?: string
  datosPago?: DatosPago
  datosEntrega?: string
  cliente?: string
  telefono?: string
  clienteResumen?: {
    total: number
    pagados: number
    pendientes: number
    cancelados: number
  }
  alertas?: string[]
}

const estadosOpciones = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Pago verificado', value: 'pago_verificado' },
  { label: 'En fábrica', value: 'en_fabrica' },
  { label: 'Empaquetado', value: 'empaquetado' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'En camino', value: 'en_camino' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Recibido (cliente)', value: 'recibido' },
  { label: 'Cancelado', value: 'cancelado' },
]

const ESTADOS_EXPIRADOS = ['entregado', 'recibido', 'cancelado']

const AdminPedidoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [pedido, setPedido] = useState<PedidoView | null>(null)
  const [loading, setLoading] = useState(true)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [guardando, setGuardando] = useState(false)

  // ⚠️ El backend devuelve el documento crudo del modelo:
  // { _id, idCompra, cursoTitulo, precioUSD, estado, nombre, apellido, createdAt, datosPago, ... }
  // Aquí lo mapeamos al shape que usa el front (PedidoView).
  const normalizarPedido = (raw: any): PedidoView => ({
    id: String(raw._id || raw.id),
    estado: raw.estado,
    total: typeof raw.precioUSD === 'number' ? raw.precioUSD : undefined,
    totalBs: undefined,
    fecha: raw.createdAt,
    productos: raw.productos,
    tallas: raw.tallas,
    colores: raw.colores,
    preciosUnitarios: raw.preciosUnitarios,
    metodoPago: raw.metodoPago,
    datosPago: raw.datosPago,
    datosEntrega: raw.datosEntrega,
    cliente: [raw.nombre, raw.apellido].filter(Boolean).join(' ').trim() || 'Cliente',
    telefono: raw.telefono,
    clienteResumen: raw.clienteResumen,
    alertas: raw.alertas,
  })

  const cargarPedido = async () => {
    const ok = await isAuthenticated()
    if (!ok) {
      await logout()
      navigate('/admin')
      return
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos/${id}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Error ${res.status} al buscar pedido`)
      const raw = await res.json()
      const data = normalizarPedido(raw)
      setPedido(data)
      setNuevoEstado(data.estado || '')
      setLoading(false)

      ;(data.alertas || []).forEach((alerta) => {
        toast(
          (t) => (
            <span>
              ⚠️ {alerta}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-2 font-bold text-yellow-500"
              >
                Cerrar
              </button>
            </span>
          ),
          { duration: 8000 }
        )
      })
    } catch (err) {
      console.error('❌ Error al cargar el pedido:', err)
      toast.error('No se pudo cargar el pedido')
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPedido()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const actualizarEstado = async () => {
    if (!nuevoEstado || !pedido) return

    const ref = pedido.datosPago?.referencia?.trim()
    const fecha = pedido.datosPago?.fecha
    const refInvalida =
      !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')

    if (nuevoEstado === 'pago_verificado' && (!fecha || refInvalida)) {
      toast.error('❌ No puedes marcar como "Pago verificado" sin referencia y fecha válidas.')
      return
    }

    try {
      setGuardando(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error(`Error ${res.status} actualizando estado`)
      toast.success('✅ Estado actualizado correctamente')
      await cargarPedido()
    } catch (err) {
      console.error(err)
      toast.error('❌ No se pudo actualizar el estado')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return <p className="text-white font-sans p-6">Cargando...</p>
  if (!pedido) return <p className="text-white font-sans p-6">Pedido no encontrado.</p>

  const ref = pedido.datosPago?.referencia?.trim() || '—'
  const fechaPago = pedido.datosPago?.fecha
  const fechaPagoFmt =
    fechaPago && !isNaN(new Date(fechaPago).getTime())
      ? new Date(fechaPago).toLocaleString('es-VE')
      : 'No detectada'

  const esExpirado = ESTADOS_EXPIRADOS.includes((pedido.estado || '').toLowerCase())

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="text-sm bg-white text-black rounded-full px-4 py-2 hover:bg-white/80 transition font-semibold"
        >
          ⬅️ Volver a pedidos
        </button>

        {/* Detalle del pedido */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-glow-md">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">📦 Detalle del Pedido</h2>
            {esExpirado && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
                Estado finalizado
              </span>
            )}
          </div>

          <p className="text-sm text-white/70 mt-2">
            ID: <span className="font-mono">{pedido.id}</span>
          </p>
          <p className="text-white text-lg mt-1">
            💰 Total:{' '}
            <strong>
              {typeof pedido.total === 'number' ? `$${pedido.total.toFixed(2)}` : '—'}
            </strong>
          </p>
          <p className="text-white/70 text-sm">
            🕒 Fecha: {pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-VE') : '—'}
          </p>

          {/* Estado actual */}
          <div className="mt-5">
            <label className="block text-white/80 mb-1 text-sm">📋 Estado actual</label>
            <select
              className="w-full bg-white/10 rounded-xl px-4 py-2 text-sm text-white"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              {estadosOpciones.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Datos de pago */}
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <p className="text-white/80 text-sm">
              💳 Método de pago: <strong>{pedido.metodoPago || '—'}</strong>
            </p>
            <p className="text-white/80 text-sm">
              📎 Referencia: <strong>{ref}</strong>
            </p>
            <p className="text-white/80 text-sm sm:col-span-2">
              🗓️ Fecha de pago: <strong>{fechaPagoFmt}</strong>
            </p>
          </div>

          {/* Botón de actualización */}
          <button
            disabled={guardando || nuevoEstado === pedido.estado}
            onClick={actualizarEstado}
            className="mt-6 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
          >
            {guardando ? 'Guardando...' : 'Actualizar Estado'}
          </button>
        </div>

        {/* Historial del cliente */}
        {pedido.cliente && pedido.clienteResumen && (
          <motion.div
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white shadow-glow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-2">👤 Historial del Cliente</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <p>
                <strong>Nombre:</strong> {pedido.cliente}
              </p>
              <p>
                <strong>Teléfono:</strong>{' '}
                {(pedido.telefono || '').replace('@s.whatsapp.net', '') || '—'}
              </p>
              <p>
                <strong>Pedidos totales:</strong> {pedido.clienteResumen.total}
              </p>
              <p>
                <strong>Pagados:</strong> {pedido.clienteResumen.pagados}
              </p>
              <p>
                <strong>Pendientes:</strong> {pedido.clienteResumen.pendientes}
              </p>
              <p>
                <strong>Cancelados:</strong> {pedido.clienteResumen.cancelados}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default AdminPedidoDetalle
