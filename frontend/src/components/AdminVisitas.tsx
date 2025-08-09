// ✅ FILE: src/pages/AdminVisitas.tsx — iOS 26 edition (fixed)
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'

type VisitItem = {
  ip: string
  userAgent: string
  timestamp?: string | Date
  geo?: {
    city?: string
    country?: string
  }
}

type VisitasResponse = {
  total: number
  page: number
  pageSize: number
  items: VisitItem[]
}

// Acepta booleano y decide duraciones
const T = (reduced: boolean) => ({
  slow: reduced ? 0 : 1.0,
  med: reduced ? 0 : 0.65,
  fast: reduced ? 0 : 0.4
})

const formatDate = (ts?: string | Date) => {
  if (!ts) return '—'
  const d = typeof ts === 'string' ? new Date(ts) : ts
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('es-VE')
}

const shortUA = (ua: string) => (ua?.length > 140 ? ua.slice(0, 137) + '…' : ua || '—')

const AdminVisitas: React.FC = () => {
  const navigate = useNavigate()

  // ⚠️ useReducedMotion puede devolver boolean | null → normalizamos a boolean
  const prefersReducedMotionRaw = useReducedMotion()
  const prefersReducedMotion = !!prefersReducedMotionRaw
  const D = useMemo(() => T(prefersReducedMotion), [prefersReducedMotion])

  // UI
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Data / Pagination
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [items, setItems] = useState<VisitItem[]>([])
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const fetchVisitas = async (p = page, ps = pageSize) => {
    setError(null)
    setRefreshing(true)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(ps) })
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas?${params.toString()}`, {
        credentials: 'include'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: VisitasResponse = await res.json()
      setTotal(Number(data.total || 0))
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      console.error('❌ Error al cargar visitas:', e)
      setError('No se pudieron cargar las visitas. Intenta de nuevo.')
      setItems([])
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitas(page, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((v) => {
      const city = v.geo?.city?.toLowerCase() || ''
      const country = v.geo?.country?.toLowerCase() || ''
      const ip = v.ip?.toLowerCase() || ''
      const ua = v.userAgent?.toLowerCase() || ''
      return city.includes(q) || country.includes(q) || ip.includes(q) || ua.includes(q)
    })
  }, [items, search])

  const exportCSV = () => {
    const header = ['timestamp', 'ip', 'city', 'country', 'userAgent']
    const rows = filtered.map((v) => [
      formatDate(v.timestamp).replaceAll(',', ''),
      v.ip ?? '',
      v.geo?.city ?? '',
      v.geo?.country ?? '',
      (v.userAgent ?? '').replaceAll('\n', ' ')
    ])
    const csv = [header, ...rows].map((r) =>
      r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visitas_p${page}_n${filtered.length}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <LoadingSpinner message="Cargando visitas…" subtext="Preparando datos" />
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[clamp(22px,4vw,34px)] font-bold">📍 Registro de Visitas</h1>
            <p className="text-white/70 text-sm mt-1">
              Se han registrado <strong>{total}</strong> visitas en total.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="h-11 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur transition"
              title="Exportar CSV (página actual)"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="h-11 px-5 rounded-full
                         bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                         hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                         text-black font-semibold tracking-wide
                         shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)] transition"
            >
              ← Volver
            </button>
          </div>
        </motion.div>

        {/* Controles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.fast, delay: 0.05 }}
          className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/70">Filas por página</label>
            <select
              className="bg-white/10 text-sm rounded-xl px-3 py-2 border border-white/15 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/30"
              value={pageSize}
              onChange={(e) => {
                setPage(1)
                setPageSize(Number(e.target.value))
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Buscar por IP, ciudad, país o agente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[320px] px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={() => fetchVisitas(page, pageSize)}
              disabled={refreshing}
              className="h-11 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur disabled:opacity-60 transition"
              title="Refrescar"
            >
              {refreshing ? 'Actualizando…' : 'Refrescar'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 text-sm rounded-full bg-white/10 border border-white/15 disabled:opacity-40"
            >
              ◀ Anterior
            </button>
            <span className="text-sm text-white/70">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 text-sm rounded-full bg-white/10 border border-white/15 disabled:opacity-40"
            >
              Siguiente ▶
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.fast }}
            className="mt-4 bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Lista */}
        {filtered.length === 0 && !error ? (
          <p className="text-white/70 text-center mt-16">No hay visitas para mostrar.</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.med, delay: 0.05 }}
            className="mt-6 rounded-2xl bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)] p-6"
          >
            <ul className="divide-y divide-white/10">
              {filtered.map((v, i) => (
                <li key={`${v.ip}-${i}`} className="py-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-sm text-white/90">
                      📅 <strong>{formatDate(v.timestamp)}</strong>
                    </p>
                    <p className="text-sm text-white/70">
                      🌐 IP: <span className="font-mono">{v.ip || '—'}</span>
                    </p>
                  </div>
                  <p className="text-sm text-white/75 mt-1">
                    🧭 Ubicación: {v.geo?.city || 'Ciudad desconocida'}, {v.geo?.country || 'País desconocido'}
                  </p>
                  <p className="text-xs text-white/55 mt-1 break-words">
                    🖥️ UA: {shortUA(v.userAgent)}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Paginación inferior */}
        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/15 disabled:opacity-40"
            >
              ◀ Anterior
            </button>
            <span className="text-sm text-white/70">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/15 disabled:opacity-40"
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminVisitas
