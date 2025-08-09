// ✅ FILE: src/pages/DashboardProductos.tsx — iOS 26 edition (CRUD Cursos)
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, logout } from '../utils/auth'
import toast from 'react-hot-toast'

interface Coleccion {
  id: string
  nombre: string
  descripcion: string
  // Campos opcionales si el backend los agrega en el futuro:
  // slug?: string
  // precioUSD?: number
  // estado?: 'publicado' | 'borrador'
  // createdAt?: string
  // updatedAt?: string
}

const MAX_NOMBRE = 120
const MAX_DESC = 1000

const DashboardProductos: React.FC = () => {
  const navigate = useNavigate()

  const prefersReducedMotion = !!useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.0,
      med: prefersReducedMotion ? 0 : 0.6,
      fast: prefersReducedMotion ? 0 : 0.35
    }),
    [prefersReducedMotion]
  )

  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Crear
  const [nuevaColeccion, setNuevaColeccion] = useState({ nombre: '', descripcion: '' })
  const [creando, setCreando] = useState(false)

  // UX
  const [q, setQ] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // -------- Helpers
  const sanitize = (s: string) => s.normalize('NFC').trim()
  const canSubmitNueva =
    sanitize(nuevaColeccion.nombre).length > 2 &&
    sanitize(nuevaColeccion.descripcion).length > 5 &&
    sanitize(nuevaColeccion.nombre).length <= MAX_NOMBRE &&
    sanitize(nuevaColeccion.descripcion).length <= MAX_DESC

  const exportCSV = () => {
    const header = ['id', 'nombre', 'descripcion']
    const rows = filtered.map((c) => [c.id, c.nombre, c.descripcion])
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cursos_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // -------- Cargar colecciones
  const cargarColecciones = async () => {
    setError('')
    setRefreshing(true)
    try {
      // auth
      const ok = await isAuthenticated()
      if (!ok) throw new Error('401')

      // abort anterior
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones`, {
        credentials: 'include',
        signal: controller.signal
      })
      if (res.status === 401) throw new Error('401')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Coleccion[] = await res.json()
      setColecciones(Array.isArray(data) ? data : [])
    } catch (e: any) {
      if (e?.message === '401') {
        await logout()
        navigate('/admin', { replace: true })
        return
      }
      console.error('❌ Error cargando colecciones:', e)
      setError('No se pudieron cargar los cursos. Intenta nuevamente.')
      toast.error('Error al cargar cursos')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarColecciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -------- Crear
  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    const nombre = sanitize(nuevaColeccion.nombre)
    const descripcion = sanitize(nuevaColeccion.descripcion)

    if (!canSubmitNueva) {
      toast.error('Completa los campos correctamente.')
      return
    }

    setCreando(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion })
      })
      if (res.status === 401) {
        await logout()
        navigate('/admin', { replace: true })
        return
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Error creando curso: ${txt || res.status}`)
      }
      const nueva = (await res.json()) as Coleccion
      setColecciones((prev) => [...prev, nueva])
      setNuevaColeccion({ nombre: '', descripcion: '' })
      toast.success('✅ Curso creado')
    } catch (err) {
      console.error('❌ Error al crear curso:', err)
      toast.error('No se pudo crear el curso')
    } finally {
      setCreando(false)
    }
  }

  // -------- Editar / Eliminar
  const handleEditar = (id: string) => navigate(`/admin/colecciones/${id}`)

  const handleEliminar = async (id: string) => {
    const c = colecciones.find((x) => x.id === id)
    const label = c?.nombre ? `“${c.nombre}”` : 'este curso'
    if (!confirm(`¿Seguro que deseas eliminar ${label}?`)) return

    // UI optimista
    const snapshot = [...colecciones]
    setColecciones((prev) => prev.filter((x) => x.id !== id))

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.status === 401) {
        await logout()
        navigate('/admin', { replace: true })
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('🗑️ Curso eliminado')
    } catch (err) {
      console.error('❌ Error al eliminar:', err)
      setColecciones(snapshot) // revert
      toast.error('No se pudo eliminar el curso')
    }
  }

  // -------- Filtro
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return colecciones
    return colecciones.filter((c) =>
      [c.nombre, c.descripcion, c.id].filter(Boolean).join(' ').toLowerCase().includes(query)
    )
  }, [colecciones, q])

  // -------- UI
  if (loading) {
    return (
      <section
        className="relative min-h-screen w-full overflow-hidden grid place-items-center text-white"
        style={{
          backgroundImage: "url('/hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <div className="rounded-2xl bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 px-6 py-4">
          Cargando cursos…
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MundoIAanime" className="w-10 h-10 rounded-full shadow" />
            <h2 className="text-[clamp(22px,4vw,34px)] font-bold">Gestión de Cursos</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              ← Panel
            </button>
            <button
              onClick={cargarColecciones}
              disabled={refreshing}
              className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 disabled:opacity-60 transition"
              title="Refrescar"
            >
              {refreshing ? 'Actualizando…' : 'Refrescar'}
            </button>
            <button
              onClick={exportCSV}
              className="h-10 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
              title="Exportar CSV"
            >
              Exportar CSV
            </button>
          </div>
        </motion.div>

        {/* Crear curso */}
        <motion.form
          onSubmit={handleCrear}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.05 }}
          className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)] space-y-4"
        >
          <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                          bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
          <h3 className="text-xl font-semibold">➕ Nuevo Curso</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70">Nombre del curso</label>
              <input
                type="text"
                placeholder="Ej. Crea Caminatas Apocalípticas con IA"
                value={nuevaColeccion.nombre}
                onChange={(e) =>
                  setNuevaColeccion((s) => ({ ...s, nombre: e.target.value.slice(0, MAX_NOMBRE) }))
                }
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <p className="text-[11px] text-white/50 mt-1">
                {nuevaColeccion.nombre.length}/{MAX_NOMBRE}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-white/70">Descripción</label>
              <textarea
                rows={4}
                placeholder="Breve descripción del curso…"
                value={nuevaColeccion.descripcion}
                onChange={(e) =>
                  setNuevaColeccion((s) => ({ ...s, descripcion: e.target.value.slice(0, MAX_DESC) }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <p className="text-[11px] text-white/50 mt-1">
                {nuevaColeccion.descripcion.length}/{MAX_DESC}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar en cursos…"
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <span className="text-white/70 text-sm">
                {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              type="submit"
              disabled={!canSubmitNueva || creando}
              className="h-11 px-6 rounded-full disabled:opacity-50
                         bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                         hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                         text-black font-semibold tracking-wide shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)] transition"
            >
              {creando ? 'Creando…' : 'Crear curso'}
            </button>
          </div>
        </motion.form>

        {/* Lista de cursos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.1 }}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-xl bg-red-500/15 ring-1 ring-red-400/30 text-red-200 px-4 py-3" role="alert">
              {error}
            </div>
          )}

          {refreshing && !colecciones.length ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-4">
                  <div className="h-5 w-1/3 bg-white/10 animate-pulse rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/10 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-white/70">No hay cursos para mostrar.</p>
          ) : (
            <ul className="grid gap-4">
              {filtered.map((col) => (
                <li
                  key={col.id}
                  className="relative rounded-2xl p-5 bg-white/10 hover:bg-white/15 ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)] transition"
                >
                  <div className="absolute -inset-[1px] rounded-[18px] opacity-20 blur-xl pointer-events-none
                                  bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{col.nombre}</h3>
                      <p className="text-white/75 text-sm mt-1 whitespace-pre-line">{col.descripcion}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditar(col.id)}
                        className="h-9 px-3 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
                        aria-label="Editar curso"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(col.id)}
                        className="h-9 px-3 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-red-500/20 transition"
                        aria-label="Eliminar curso"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default DashboardProductos
