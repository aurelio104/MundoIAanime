// ✅ FILE: src/pages/AdminVisitas.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

const AdminVisitas: React.FC = () => {
  const navigate = useNavigate()

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data/Pagination
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [items, setItems] = useState<VisitItem[]>([])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  )

  const fetchVisitas = async (p = page, ps = pageSize) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(ps) })
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas?${params.toString()}`, {
        credentials: 'include'
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: VisitasResponse = await res.json()
      setTotal(data.total || 0)
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e: any) {
      console.error('❌ Error al cargar visitas:', e)
      setError('No se pudieron cargar las visitas. Intenta de nuevo.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitas(page, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const formatDate = (ts?: string | Date) => {
    if (!ts) return '—'
    const d = typeof ts === 'string' ? new Date(ts) : ts
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('es-VE')
  }

  const shortUA = (ua: string) => (ua?.length > 120 ? ua.slice(0, 117) + '…' : ua || '—')

  if (loading) {
    return (
      <section className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl px-6 py-4 border border-white/10 shadow-glow-md">
          🔄 Cargando visitas...
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">📍 Registro de Visitas</h1>
            <p className="text-white/60 text-sm mt-2">
              Se han registrado <strong>{total}</strong> visitas en total.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-white text-black text-sm rounded-full px-5 py-2 hover:bg-gray-200 font-semibold"
          >
            ⬅️ Volver al panel
          </button>
        </div>

        {/* Filtros / Paginación superior */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-white/70">Filas por página</label>
            <select
              className="bg-white/10 text-sm rounded-xl px-3 py-2 border border-white/10 backdrop-blur-md"
              value={pageSize}
              onChange={(e) => {
                setPage(1) // reset page
                setPageSize(Number(e.target.value))
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 text-sm rounded-xl bg-white/10 border border-white/10 disabled:opacity-40"
            >
              ◀ Anterior
            </button>
            <span className="text-sm text-white/70">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 text-sm rounded-xl bg-white/10 border border-white/10 disabled:opacity-40"
            >
              Siguiente ▶
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Lista */}
        {items.length === 0 && !error ? (
          <p className="text-white/60 text-center mt-16">No hay visitas para mostrar.</p>
        ) : (
          <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-glow-md border border-white/10">
            <ul className="divide-y divide-white/10">
              {items.map((v, i) => (
                <li key={`${v.ip}-${i}`} className="py-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-sm text-white/90">
                      📅 <strong>{formatDate(v.timestamp)}</strong>
                    </p>
                    <p className="text-sm text-white/70">
                      🌐 IP: <span className="font-mono">{v.ip || '—'}</span>
                    </p>
                  </div>
                  <p className="text-sm text-white/70 mt-1">
                    🧭 Ubicación: {v.geo?.city || 'Ciudad desconocida'}, {v.geo?.country || 'País desconocido'}
                  </p>
                  <p className="text-xs text-white/50 mt-1 break-words">
                    🖥️ UA: {shortUA(v.userAgent)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Paginación inferior (mismo control) */}
        {items.length > 0 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/10 disabled:opacity-40"
            >
              ◀ Anterior
            </button>
            <span className="text-sm text-white/70">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm rounded-full bg-white/10 border border-white/10 disabled:opacity-40"
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
