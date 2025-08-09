// ✅ FILE: src/components/AdminDashboard.tsx — iOS 26 edition
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { isAuthenticated, logout } from '../utils/auth'
import LoadingSpinner from './LoadingSpinner'

type PedidoAdmin = {
  id: string
  estado?: string
}

const AdminDashboard: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.0,
      med: prefersReducedMotion ? 0 : 0.65,
      fast: prefersReducedMotion ? 0 : 0.4
    }),
    [prefersReducedMotion]
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [visitas, setVisitas] = useState(0)
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [refreshing, setRefreshing] = useState(false)

  const navigate = useNavigate()

  const cargarDatos = async () => {
    try {
      setError('')
      setRefreshing(true)

      // 🔹 Visitas
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include'
      })
      if (resVisitas.ok) {
        const dataVisitas = await resVisitas.json()
        setVisitas(Number(dataVisitas?.total || 0))
      } else {
        console.warn('⚠️ /api/visitas respondió:', resVisitas.status, await resVisitas.text())
      }

      // 🔹 Pedidos ADMIN
      const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        credentials: 'include'
      })
      if (resPedidos.ok) {
        const dataPedidos: PedidoAdmin[] = await resPedidos.json()
        const pendientes = dataPedidos.filter(
          (p) => (p.estado || '').toLowerCase() === 'pendiente'
        ).length
        setPedidosPendientes(pendientes)
      } else {
        console.warn('⚠️ /api/admin/pedidos respondió:', resPedidos.status, await resPedidos.text())
      }

      setLastUpdated(new Date().toLocaleString('es-VE'))
    } catch (err) {
      console.error('❌ Error al cargar datos del dashboard:', err)
      setError('No se pudieron cargar los datos. Intenta nuevamente.')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    const verificarSesionYCargar = async () => {
      try {
        const auth = await isAuthenticated()
        if (!auth) throw new Error('Sesión inválida')
        await cargarDatos()
      } catch {
        await logout()
        navigate('/admin', { replace: true })
      }
    }
    verificarSesionYCargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <LoadingSpinner message="Verificando acceso seguro..." subtext="Cargando panel…" />
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
        animate={{ opacity: 0.8 }}
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
        {/* Header del panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-[clamp(22px,4vw,36px)] font-bold">Panel de Administración</h1>
            <p className="text-white/70 text-sm">MundoIAanime</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              disabled={refreshing}
              className="h-11 px-4 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 backdrop-blur
                         disabled:opacity-60 disabled:cursor-not-allowed transition"
              title="Refrescar datos"
            >
              {refreshing ? 'Actualizando…' : 'Refrescar'}
            </button>

            <button
              onClick={async () => {
                await logout()
                navigate('/admin', { replace: true })
              }}
              className="h-11 px-5 rounded-full
                         bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                         hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                         text-black font-semibold tracking-wide
                         shadow-[0_12px_50px_-12px_rgba(56,189,248,.7)] transition"
            >
              Cerrar sesión
            </button>
          </div>
        </motion.div>

        {/* Error global */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: D.fast }}
            className="mt-4 rounded-xl bg-red-500/10 ring-1 ring-red-400/30 text-red-200 px-4 py-3"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* Métricas */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.med, delay: 0.1 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {/* Card visitas */}
          <article className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]">
            <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                            bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-white/80">Visitas</h3>
              <span className="inline-flex h-8 items-center px-3 rounded-full bg-black/50 ring-1 ring-white/15 text-xs">
                Hoy
              </span>
            </div>
            <div className="mt-3 text-3xl font-semibold">{visitas}</div>
            <button
              onClick={() => navigate('/admin/visitas')}
              className="mt-5 w-full h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              Ver detalle
            </button>
          </article>

          {/* Card pedidos */}
          <article className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]">
            <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                            bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-white/80">Pedidos</h3>
              {pedidosPendientes > 0 && (
                <span className="inline-flex h-8 items-center px-3 rounded-full bg-red-500/20 ring-1 ring-red-400/40 text-xs text-red-200">
                  {pedidosPendientes} pendientes
                </span>
              )}
            </div>
            <div className="mt-3 text-lg text-white/90">
              Gestión y estados de pedidos
            </div>
            <button
              onClick={() => navigate('/admin/pedidos')}
              className="mt-5 w-full h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              Abrir pedidos
            </button>
          </article>

          {/* Card catálogo */}
          <article className="relative rounded-3xl p-6 bg-white/10 backdrop-blur-2xl ring-1 ring-white/15 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]">
            <div className="absolute -inset-[2px] rounded-[26px] opacity-30 blur-2xl pointer-events-none
                            bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.22),transparent_30%,rgba(255,255,255,.18),transparent_70%)]" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-white/80">Catálogo</h3>
              <span className="inline-flex h-8 items-center px-3 rounded-full bg-black/50 ring-1 ring-white/15 text-xs">
                Admin
              </span>
            </div>
            <div className="mt-3 text-lg text-white/90">
              Cursos y productos del sitio
            </div>
            <button
              onClick={() => navigate('/admin/productos')}
              className="mt-5 w-full h-10 rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/15 transition"
            >
              Gestionar catálogo
            </button>
          </article>
        </motion.div>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: D.fast, delay: 0.2 }}
          className="mt-8 text-xs text-white/60"
        >
          Última actualización: {lastUpdated || '—'}
        </motion.div>
      </div>
    </section>
  )
}

export default AdminDashboard
