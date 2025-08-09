// ✅ FILE: src/pages/AdminPedidos.tsx — iOS 26 edition (fix vibrate + timers)
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth'
import toast from 'react-hot-toast'

type DatosPago = {
  referencia?: string
  fecha?: string
}

export interface PedidoItem {
  id: string
  cliente?: string
  estado?: string
  total?: string
  totalBs?: string
  fecha?: string
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
  'cancelado'
] as const

const claseEstado = (estado?: string) => {
  const e = (estado || '').toLowerCase()
  if (e.includes('cancelado')) return 'text-red-400'
  if (e.includes('entregado') || e.includes('recibido')) return 'text-emerald-300'
  if (e.includes('verificado') || e.includes('fabrica') || e.includes('empaquetado')) return 'text-amber-300'
  if (e.includes('enviado') || e.includes('camino')) return 'text-cyan-300'
  return 'text-white/70'
}

const resumenPago = (datosPago?: DatosPago): string => {
  const ref = datosPago?.referencia?.trim()
  const fecha = datosPago?.fecha
  const refInvalida =
    !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada')
  if (!fecha || refInvalida) return '—'
  return `Ref: ${ref}`
}

const AdminPedidos: React.FC = () => {
  const prefersReducedMotion = !!useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.0,
      med: prefersReducedMotion ? 0 : 0.6,
      fast: prefersReducedMotion ? 0 : 0.35
    }),
    [prefersReducedMotion]
  )

  const [pedidos, setPedidos] = useState<PedidoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const [filtroTexto, setFiltroTexto] = useState('')
  const [estadoFiltrado, setEstadoFiltrado] = useState<string | null>(null)

  const [sonando, setSonando] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const navigate = useNavigate()
  const ultimoIdRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null) // ✅ timer web (number)
  const inFlightRef = useRef(false)
  const pollMsRef = useRef(12000) // 12s normal; backoff hasta 60s

  const reproducirAlerta = () => {
    try {
      if (sonando) return
      setSonando(true)
      const audio = new Audio('/alerta-MundoIAanime.mp3')
      audio.play().catch(() => {})
      // ✅ vibrate tipado en DOM
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate([300, 120, 300])
      }
      window.setTimeout(() => setSonando(false), 1500)
    } catch {
      /* noop */
    }
  }

  const exportCSV = (rows: PedidoItem[]) => {
    const header = ['fecha', 'id', 'cliente', 'estado', 'total', 'totalBs', 'telefono', 'pago']
    const data = rows.map((p) => [
      p.fecha ? new Date(p.fecha).toLocaleString('es-VE') : '',
      p.id ?? '',
      p.cliente ?? '',
      p.estado ?? '',
      p.total ?? '',
      p.totalBs ?? '',
      p.telefono ?? '',
      resumenPago(p.datosPago)
    ])
    const csv =
      [header, ...data]
        .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
        .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const cargarPedidos = async (controller?: AbortController) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    setError('')
    try {
      const ok = await isAuthenticated()
      if (!ok) throw new Error('Sesión inválida')

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        method: 'GET',
        credentials: 'include',
        signal: controller?.signal
      })

      if (res.status === 401) {
        await logout()
        navigate('/admin', { replace: true })
        return
      }

      if (res.status === 429) {
        pollMsRef.current = Math.min(pollMsRef.current * 1.5, 60000) // backoff
        setError('Demasiadas solicitudes. Aumentando intervalo temporalmente.')
        return
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Error ${res.status} al obtener pedidos ${txt}`)
      }

      // OK → bajar backoff gradualmente hasta 12s
      pollMsRef.current = Math.max(12000, Math.floor(pollMsRef.current * 0.85))

      const data: PedidoItem[] = await res.json()

      const ordenados = [...data].sort((a, b) => {
        const tb = new Date(b.fecha || 0).getTime()
        const ta = new Date(a.fecha || 0).getTime()
        return tb - ta
      })

      if (ordenados.length > 0 && ordenados[0].id !== ultimoIdRef.current) {
        if (ultimoIdRef.current !== null) {
          toast.success('📦 ¡Nuevo pedido recibido!')
          reproducirAlerta()
        }
        ultimoIdRef.current = ordenados[0].id
      }

      setPedidos(ordenados)
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('❌ Error al cargar pedidos:', err)
        setError('No se pudieron cargar los pedidos.')
        toast.error('No se pudieron cargar los pedidos.')
      }
    } finally {
      inFlightRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Polling con backoff usando setTimeout (no setInterval)
  useEffect(() => {
    const controller = new AbortController()
    cargarPedidos(controller)

    const tick = () => {
      cargarPedidos()
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      timerRef.current = window.setTimeout(tick, pollMsRef.current)
    }

    timerRef.current = window.setTimeout(tick, pollMsRef.current)

    return () => {
      controller.abort()
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const total = pedidos.length
    const cancelados = pedidos.filter((p) => (p.estado || '').toLowerCase().includes('cancelado')).length
    const enProceso = pedidos.filter((p) => {
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
          p.telefono
        ]
          .join(' ')
          .toLowerCase()

        const coincideTexto = !t || blob.includes(t)
        const coincideEstado = !estadoFiltrado || (p.estado || '').toLowerCase() === estadoFiltrado
        return coincideTexto && coincideEstado
      })
      .sort((a, b) => {
        const ea = ESTADOS_ORDEN.indexOf((a.estado || '').toLowerCase() as any)
        const eb = ESTADOS_ORDEN.indexOf((b.estado || '').toLowerCase() as any)
        return (ea === -1 ? 999 : ea) - (eb === -1 ? 999 : eb)
      })
  }, [pedidos, filtroTexto, estadoFiltrado])

  const crearWidget = (
    label: string,
    valor: string | number,
    colorBorder: string,
    targetEstado: string | null
  ) => (
    <motion.button
      type="button"
      onClick={() => setEstadoFiltrado(targetEstado)}
      className={`text-left cursor-pointer bg-white/10 hover:bg-white/15 backdrop-blur-2xl rounded-2xl p-5 ring-1 ring-white/15 border-l-4 ${colorBorder} shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)] transition`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: D.med }}
    >
      <h3 className="text-sm text-white/70">{label}</h3>
      <p className="text-2xl font-semibold text-white">{valor}</p>
    </motion.button>
  )

  if (loading) {
    return (
      <section
        className="relative min-h-screen w-full grid place-items-center text-white"
        style={{
          backgroundImage: "url('/hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <div className="rounded-2xl bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 px-6 py-4 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]">
          🔄 Cargando pedidos…
        </div>
      </section>
    )
  }

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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-8">
        {/* Header + acciones */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-[clamp(22px,4vw,34px)] font-bold">📦 Pedidos</h1>
            <button
              onClick={() => {
                setRefreshing(true)
                cargarPedidos()
              }}
              disabled={refreshing}
              className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 disabled:opacity-60 transition"
              title="Actualizar"
            >
              {refreshing ? 'Actualizando…' : 'Actualizar'}
            </button>
            <button
              onClick={() => exportCSV(datosFiltrados)}
              className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
              title="Exportar CSV (lista filtrada)"
            >
              Exportar CSV
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre, ID, referencia…"
              className="px-4 py-2 rounded-xl bg-white/10 placeholder-white/60 text-sm w-full md:w-96 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
            {estadoFiltrado && (
              <button
                onClick={() => setEstadoFiltrado(null)}
                className="px-3 py-2 rounded-xl bg-white/10 text-xs ring-1 ring-white/15 hover:bg-white/15"
              >
                Limpiar estado
              </button>
            )}
          </div>
        </motion.div>

        {/* Chips de estado */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.fast }}
          className="flex flex-wrap gap-2"
        >
          {(['todos', ...ESTADOS_ORDEN] as const).map((e) => {
            const val = e === 'todos' ? null : e
            const active = estadoFiltrado === val
            return (
              <button
                key={e}
                onClick={() => setEstadoFiltrado(val)}
                className={`h-9 px-3 rounded-full text-sm transition
                           ${active
                             ? 'bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90 text-black'
                             : 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15'}`}
              >
                {e === 'todos' ? 'Todos' : e.replace('_', ' ')}
              </button>
            )
          })}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {crearWidget('Total de pedidos', stats.total, 'border-white', null)}
          {crearWidget('En proceso', stats.enProceso, 'border-amber-300', 'pendiente')}
          {crearWidget('Cancelados', stats.cancelados, 'border-red-500', 'cancelado')}
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

        {/* Lista */}
        {datosFiltrados.length === 0 ? (
          <div className="text-center text-white/70 mt-10">No hay pedidos que coincidan con el filtro.</div>
        ) : (
          <motion.div
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: D.med }}
          >
            {datosFiltrados.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/pedidos/${p.id}`)}
                className="text-left p-6 rounded-2xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)] transition"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-white/80">
                    {p.fecha ? new Date(p.fecha).toLocaleString('es-VE') : '—'}
                  </p>
                  <p className={`text-sm font-bold uppercase ${claseEstado(p.estado)}`}>
                    {p.estado || 'Pendiente'}
                  </p>
                </div>

                <div className="mt-1 grid sm:grid-cols-2 gap-1">
                  <p className="text-lg font-semibold truncate">
                    {p.cliente || 'Cliente anónimo'}
                  </p>
                  <p className="text-white/70 text-sm sm:text-right">
                    📱 {p.telefono || '—'}
                  </p>
                </div>

                <div className="mt-1 grid sm:grid-cols-2 gap-1">
                  <p className="text-white/85 text-sm">
                    💵 Monto: <strong>${p.total ?? '—'}</strong>
                    {p.totalBs ? ` · ${p.totalBs}` : ''}
                  </p>
                  <p className="text-white/65 text-sm sm:text-right">📎 {resumenPago(p.datosPago)}</p>
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
