// ✅ FILE: src/pages/AdminPedidoDetalle.tsx — iOS 26 edition
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import toast from 'react-hot-toast'
import { isAuthenticated, logout } from '../utils/auth'
import LoadingSpinner from '../components/LoadingSpinner'

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
  { label: 'Cancelado', value: 'cancelado' }
] as const

const ESTADOS_EXPIRADOS = ['entregado', 'recibido', 'cancelado']

const normalizarPedido = (raw: any): PedidoView => ({
  id: String(raw._id || raw.id),
  estado: raw.estado,
  total: typeof raw.precioUSD === 'number' ? raw.precioUSD : undefined,
  totalBs: raw.totalBs,
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
  alertas: raw.alertas
})

const AdminPedidoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const prefersReducedMotion = !!useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.0,
      med: prefersReducedMotion ? 0 : 0.65,
      fast: prefersReducedMotion ? 0 : 0.4
    }),
    [prefersReducedMotion]
  )

  const [pedido, setPedido] = useState<PedidoView | null>(null)
  const [loading, setLoading] = useState(true)
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string>('')

  const cargarPedido = async () => {
    try {
      const ok = await isAuthenticated()
      if (!ok) throw new Error('401')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos/${id}`, {
        credentials: 'include'
      })
      if (res.status === 401) throw new Error('401')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json()
      const data = normalizarPedido(raw)
      setPedido(data)
      setNuevoEstado(data.estado || '')
      ;(data.alertas || []).forEach((a) =>
        toast((t) => (
          <span>
            ⚠️ {a}
            <button onClick={() => toast.dismiss(t.id)} className="ml-2 font-bold text-yellow-400">
              Cerrar
            </button>
          </span>
        ), { duration: 8000 })
      )
      setError('')
    } catch (e: any) {
      if (e?.message === '401') {
        await logout()
        navigate('/admin', { replace: true })
        return
      }
      console.error('❌ Error al cargar el pedido:', e)
      setError('No se pudo cargar el pedido.')
      toast.error('No se pudo cargar el pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPedido()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const actualizarEstado = async () => {
    if (!nuevoEstado || !pedido) return

    // Regla de seguridad para "pago_verificado"
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
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('✅ Estado actualizado')
      await cargarPedido()
    } catch (e) {
      console.error('❌ Error actualizando estado:', e)
      toast.error('No se pudo actualizar el estado')
    } finally {
      setGuardando(false)
    }
  }

  const copiarId = async () => {
    try {
      await navigator.clipboard.writeText(pedido?.id || '')
      toast.success('ID copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const contactarWhatsApp = () => {
    if (!pedido?.telefono) return
    const tel = (pedido.telefono || '').replace('@s.whatsapp.net', '').replace(/[^\d+]/g, '')
    const msg = `Hola ${pedido.cliente || ''}, te contacto sobre tu pedido ${pedido.id} (${pedido.estado || 'pendiente'}).`
    const url = `https://wa.me/${encodeURIComponent(tel)}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  if (loading) return <LoadingSpinner message="Cargando pedido…" subtext="Un momento, por favor" />
  if (!pedido) {
    return (
      <section className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="rounded-2xl bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 px-6 py-4">
          Pedido no encontrado.
        </div>
      </section>
    )
  }

  const refPago = pedido.datosPago?.referencia?.trim() || '—'
  const fechaPagoFmt =
    pedido.datosPago?.fecha && !isNaN(new Date(pedido.datosPago.fecha).getTime())
      ? new Date(pedido.datosPago.fecha).toLocaleString('es-VE')
      : 'No detectada'
  const esExpirado = ESTADOS_EXPIRADOS.includes((pedido.estado || '').toLowerCase())

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Auroras iOS 26 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 20% 20%, rgba(56,189,248,.28), transparent 60%), radial-gradient(45% 45% at 80% 15%, rgba(168,85,247,.24), transparent 60%), radial-gradient(40% 40% at 50% 85%, rgba(16,185,129,.24), transparent 60%)'
        }}
      />
      {/* Velo + Frost */}
      <motion.div
        className="absolute inset-0 -z-10 bg-black/70"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: D.slow }}
      />
      <motion.div
        className="absolute inset-0 -z-10 bg-white/5 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        transition={{ duration: D.slow, delay: 0.1 }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-8">
        {/* Acciones superiores */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med }}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
          >
            ← Volver
          </button>
          <button
            onClick={copiarId}
            className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
            title="Copiar ID"
          >
            Copiar ID
          </button>
          <button
            onClick={contactarWhatsApp}
            disabled={!pedido.telefono}
            className="h-10 px-4 rounded-full disabled:opacity-50
                       bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                       hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                       text-black font-semibold tracking-wide shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)] transition"
          >
            Contactar por WhatsApp
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.fast }}
            className="rounded-xl bg-red-500/15 ring-1 ring-red-400/30 text-red-200 px-4 py-3"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Detalle principal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.05 }}
          className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]"
        >
          <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                          bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">📦 Detalle del Pedido</h2>
            {esExpirado && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15">
                Estado finalizado
              </span>
            )}
          </div>

          <p className="text-sm text-white/70 mt-2">
            ID: <span className="font-mono">{pedido.id}</span>
          </p>
          <p className="text-white text-lg mt-1">
            💰 Total:{' '}
            <strong>{typeof pedido.total === 'number' ? `$${pedido.total.toFixed(2)}` : '—'}</strong>
            {pedido.totalBs ? <span className="text-white/60"> · {pedido.totalBs}</span> : null}
          </p>
          <p className="text-white/70 text-sm">
            🕒 Fecha: {pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-VE') : '—'}
          </p>

          {/* Estado */}
          <div className="mt-5">
            <label className="block text-white/80 mb-1 text-sm">📋 Estado actual</label>
            <select
              className="w-full bg-white/10 rounded-xl px-4 py-2 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              {estadosOpciones.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            <button
              disabled={guardando || nuevoEstado === pedido.estado}
              onClick={actualizarEstado}
              className="mt-4 h-10 px-5 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 disabled:opacity-50 transition"
            >
              {guardando ? 'Guardando…' : 'Actualizar estado'}
            </button>
          </div>

          {/* Pago */}
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <p className="text-white/80 text-sm">
              💳 Método de pago: <strong>{pedido.metodoPago || '—'}</strong>
            </p>
            <p className="text-white/80 text-sm">
              📎 Referencia: <strong>{refPago}</strong>
            </p>
            <p className="text-white/80 text-sm sm:col-span-2">
              🗓️ Fecha de pago: <strong>{fechaPagoFmt}</strong>
            </p>
          </div>

          {/* Entrega */}
          {pedido.datosEntrega && (
            <div className="mt-6">
              <h3 className="text-sm text-white/80 mb-1">📦 Datos de entrega</h3>
              <p className="text-white/90 text-sm whitespace-pre-wrap">{pedido.datosEntrega}</p>
            </div>
          )}

          {/* Ítems / líneas (si existen arrays) */}
          {(pedido.productos?.length || pedido.tallas?.length || pedido.colores?.length) && (
            <div className="mt-6">
              <h3 className="text-sm text-white/80 mb-2">🧾 Ítems</h3>
              <div className="overflow-auto rounded-xl ring-1 ring-white/10">
                <table className="min-w-full text-sm bg-white/5">
                  <thead className="text-white/70">
                    <tr>
                      <th className="text-left px-3 py-2">Producto</th>
                      <th className="text-left px-3 py-2">Talla</th>
                      <th className="text-left px-3 py-2">Color</th>
                      <th className="text-right px-3 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(pedido.productos || []).map((prod, i) => (
                      <tr key={`${prod}-${i}`}>
                        <td className="px-3 py-2">{prod}</td>
                        <td className="px-3 py-2">{pedido.tallas?.[i] || '—'}</td>
                        <td className="px-3 py-2">{pedido.colores?.[i] || '—'}</td>
                        <td className="px-3 py-2 text-right">
                          {typeof pedido.preciosUnitarios?.[i] === 'number'
                            ? `$${pedido.preciosUnitarios?.[i].toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>

        {/* Historial del cliente */}
        {pedido.cliente && pedido.clienteResumen && (
          <motion.div
            className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.med }}
          >
            <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                            bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
            <h3 className="text-xl font-bold mb-2">👤 Historial del Cliente</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-white/90">
              <p><strong>Nombre:</strong> {pedido.cliente}</p>
              <p>
                <strong>Teléfono:</strong> {(pedido.telefono || '').replace('@s.whatsapp.net', '') || '—'}
              </p>
              <p><strong>Pedidos totales:</strong> {pedido.clienteResumen.total}</p>
              <p><strong>Pagados:</strong> {pedido.clienteResumen.pagados}</p>
              <p><strong>Pendientes:</strong> {pedido.clienteResumen.pendientes}</p>
              <p><strong>Cancelados:</strong> {pedido.clienteResumen.cancelados}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default AdminPedidoDetalle
