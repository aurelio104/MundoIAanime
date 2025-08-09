// ✅ FILE: src/components/CoursesSection.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api, API_URL } from '../utils/auth'

type Curso = {
  titulo: string
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado'
  desc: string
  precio: string        // p.ej. "$9.99"
  enlace: string
  video?: string
  imagen?: string
  detalle?: string
  disponible?: boolean  // 👈 nuevo, evita depender del título
}

const courses: Curso[] = [
  {
    video: '/videos/videocurso1.mp4',
    titulo: 'Crea Caminatas Apocalípticas con personajes usando IA',
    nivel: 'Principiante',
    desc: 'Genera personajes anime únicos con IA: prompts, estilo, expresión y animación base.',
    detalle:
      'Crea una imagen desde cero y conviértela en una animación poderosa y viral. Usaremos ChatGPT, Photoshop, Kling AI y CapCut. Ideal para creadores visuales y amantes del storytelling.',
    precio: '$9.99',
    enlace: '/curso/personajes',
    disponible: true
  },
  {
    video: '/videos/videocurso2.mp4',
    titulo: 'Crea Videos de Anime en Live Action Estilo Selfie con IA',
    nivel: 'Intermedio',
    desc: 'Convierte ideas en escenas live action con IA, de guion a video final.',
    detalle:
      'Paso a paso con ChatGPT 4o (guion + imágenes), ajuste en Photoshop y animación con Gemini Veo 3 o Flow AI. No necesitas saber dibujar; sólo imaginación.',
    precio: '$9.99',
    enlace: '/curso/historias',
    disponible: true
  },
  {
    video: '/videos/videocurso3.mp4',
    titulo: 'Crea Videos de Anime en Live Action Cinematográficos con IA',
    nivel: 'Avanzado',
    imagen: '/cursos/live-action.jpg',
    desc: 'Composición avanzada, ritmo, atmósfera y dirección de cámara con IA.',
    precio: '$9.99',
    enlace: '/curso/liveaction',
    disponible: false
  },
  {
    video: '/videos/videocurso4.mp4',
    titulo: 'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA',
    nivel: 'Avanzado',
    imagen: '/cursos/live-action.jpg',
    desc: 'Voces, guion y edición para podcasts hiperrealistas con IA.',
    precio: '$9.99',
    enlace: '/curso/podcast',
    disponible: false
  }
]

// ——— Utils ———
const usdToNumber = (usd: string) => Number(usd.replace('$', '').trim())

const formatBs = (monto: number) =>
  monto.toLocaleString('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 })

const TASA_CACHE_KEY = 'tasa-bcv-cache'
const TASA_TTL_MS = 5 * 60 * 1000 // 5 min

const CoursesSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion()

  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [formValues, setFormValues] = useState({ nombre: '', apellido: '', correo: '' })
  const [enviando, setEnviando] = useState(false)

  const [tasaBCV, setTasaBCV] = useState<number>(0)
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null)

  // ✅ Obtener tasa BCV (cache sesión para evitar 429)
  useEffect(() => {
    const cached = sessionStorage.getItem(TASA_CACHE_KEY)
    if (cached) {
      try {
        const { tasa, ts } = JSON.parse(cached)
        if (Date.now() - ts < TASA_TTL_MS && typeof tasa === 'number' && tasa > 0) {
          setTasaBCV(tasa)
          return
        }
      } catch {}
    }

    let active = true
    api.get('/api/tasa-bcv', { timeout: 9000 })
      .then((r) => {
        const tasa = Number(r.data?.tasa)
        if (active && Number.isFinite(tasa) && tasa > 0) {
          setTasaBCV(tasa)
          sessionStorage.setItem(TASA_CACHE_KEY, JSON.stringify({ tasa, ts: Date.now() }))
        }
      })
      .catch((e) => {
        console.error('❌ Error obteniendo tasa BCV:', e)
      })
    return () => { active = false }
  }, [])

  // 💵 Bs referencial del curso seleccionado
  const montoBs = useMemo(() => {
    if (!selectedCourse || !tasaBCV) return ''
    const precio = usdToNumber(selectedCourse.precio)
    if (!Number.isFinite(precio)) return ''
    return formatBs(precio * tasaBCV)
  }, [selectedCourse, tasaBCV])

  const generarID = () => Math.random().toString(36).slice(2, 10).toUpperCase()

  // ✅ Guardar pedido y abrir WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    const nombre = formValues.nombre.trim()
    const apellido = formValues.apellido.trim()
    const correo = formValues.correo.trim().toLowerCase()
    if (!nombre || !apellido || !correo) return

    const idCompra = generarID()
    const fechaISO = new Date().toISOString()

    try {
      setEnviando(true)

      const payload = {
        cursoTitulo: selectedCourse.titulo,
        nombre,
        apellido,
        correo,
        idCompra,
        fechaISO,
        canal: 'web'
      }

      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        console.error('❌ Error al registrar pedido:', await res.text())
        alert('No se pudo registrar el pedido. Intenta nuevamente.')
        return
      }

      const fechaVE = new Date().toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })

      const mensaje =
        `DETALLE DE LA COMPRA:\n\n` +
        `Curso: ${selectedCourse.titulo}\n` +
        `Precio: ${selectedCourse.precio}${montoBs ? ` · ${montoBs}` : ''}\n` +
        `ID Compra: ${idCompra}\n` +
        `Fecha: ${fechaVE}\n\n` +
        `Nombre: ${nombre} ${apellido}\n` +
        `Correo: ${correo}\n` +
        `Gracias por tu compra. Te contactaremos pronto con el acceso al curso.`

      const url = `https://wa.me/584244043150?text=${encodeURIComponent(mensaje)}`
      window.open(url, '_blank')

      setSelectedCourse(null)
      setFormValues({ nombre: '', apellido: '', correo: '' })
    } catch (err) {
      console.error('❌ Error procesando pedido:', err)
      alert('No se pudo registrar el pedido. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ——— Animaciones globales ———
  const D = useMemo(
    () => ({
      slow: prefersReducedMotion ? 0 : 1.2,
      med: prefersReducedMotion ? 0 : 0.8,
      fast: prefersReducedMotion ? 0 : 0.5
    }),
    [prefersReducedMotion]
  )

  return (
    <section id="tulio-catalogo" className="relative py-20 px-6 text-white overflow-hidden">
      {/* Auroras sutiles de fondo */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.65 }}
        viewport={{ once: true }}
        transition={{ duration: D.med }}
        style={{
          background:
            'radial-gradient(40% 40% at 10% 20%, rgba(56,189,248,.20), transparent 60%), radial-gradient(45% 45% at 90% 10%, rgba(168,85,247,.18), transparent 60%), radial-gradient(40% 40% at 50% 80%, rgba(16,185,129,.18), transparent 60%)'
        }}
      />

      <div className="max-w-7xl mx-auto text-center mb-12">
        <motion.h2
          className="text-[clamp(28px,5vw,48px)] font-bold tracking-tight drop-shadow-[0_6px_25px_rgba(0,0,0,.6)]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: D.med }}
        >
          Cursos disponibles
        </motion.h2>
        <motion.p
          className="text-white/80 text-lg max-w-3xl mx-auto mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: D.fast, delay: 0.15 }}
        >
          Domina herramientas de IA para crear contenido anime visualmente impresionante y narrativas cinematográficas.
        </motion.p>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {courses.map((curso, idx) => {
          const disabled = curso.disponible === false
          return (
            <motion.article
              key={curso.titulo}
              initial={{ opacity: 0, y: 28, scale: prefersReducedMotion ? 1 : 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: D.med, delay: idx * 0.12 }}
              className="group relative rounded-3xl overflow-hidden
                         ring-1 ring-white/10 bg-white/[0.06] backdrop-blur-xl
                         shadow-[0_10px_60px_-10px_rgba(0,0,0,.5)]
                         hover:ring-white/20 hover:shadow-[0_20px_80px_-20px_rgba(0,0,0,.65)]
                         transition-all"
            >
              {/* Media */}
              <div className="relative h-56 w-full overflow-hidden">
                {curso.video ? (
                  <video
                    src={curso.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover
                               transition-transform duration-[1200ms]
                               group-hover:scale-[1.05]"
                  />
                ) : (
                  <img
                    src={curso.imagen}
                    alt={curso.titulo}
                    className="h-full w-full object-cover
                               transition-transform duration-[1200ms]
                               group-hover:scale-[1.05]"
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {/* Chip nivel */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-3 h-8 rounded-full
                                   bg-black/60 text-white text-xs ring-1 ring-white/20 backdrop-blur">
                    {curso.nivel}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-white drop-shadow-md">
                  {curso.titulo}
                </h3>
                <p className="text-sm text-white/70 min-h-[3.5rem]">
                  {curso.desc || 'Aprende técnicas modernas para crear contenido con IA.'}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-white font-bold text-base">
                    {curso.precio}
                  </div>
                  {!disabled && (
                    <button
                      onClick={() => setSelectedCourse(curso)}
                      className="inline-flex items-center justify-center px-5 h-11 rounded-full
                                 bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                                 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                                 text-black font-semibold tracking-wide
                                 shadow-[0_10px_40px_-10px_rgba(56,189,248,.6)]
                                 transition-all"
                    >
                      Comprar curso
                    </button>
                  )}
                  {disabled && (
                    <span className="inline-flex items-center px-5 h-11 rounded-full
                                      bg-white/10 text-white/80 ring-1 ring-white/15 backdrop-blur">
                      Próximamente
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* === MODAL DE COMPRA === */}
      {selectedCourse && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Comprar curso ${selectedCourse.titulo}`}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: D.fast }}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedCourse(null)}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-3xl
                       bg-white/10 backdrop-blur-2xl ring-1 ring-white/20
                       shadow-[0_10px_60px_-10px_rgba(0,0,0,.6)]
                       p-6 text-white"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: D.med, ease: 'easeOut' }}
          >
            <button
              ref={modalCloseBtnRef}
              onClick={() => setSelectedCourse(null)}
              className="absolute top-3 right-4 text-2xl text-white/80 hover:text-white"
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="text-xl sm:text-2xl font-bold drop-shadow-md">
              {selectedCourse.titulo}
            </h2>
            <p className="text-sm text-white/80 whitespace-pre-line mt-2">
              {selectedCourse.detalle || selectedCourse.desc}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center px-3 h-8 rounded-full bg-black/60 text-white text-xs ring-1 ring-white/20 backdrop-blur">
                {selectedCourse.nivel}
              </span>
              <span className="text-base font-semibold">
                {selectedCourse.precio}{montoBs ? ` · ${montoBs} aprox.` : ''}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="nombre"
                  type="text"
                  placeholder="Nombre"
                  required
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  value={formValues.nombre}
                  onChange={(e) => setFormValues((s) => ({ ...s, nombre: e.target.value }))}
                />
                <input
                  name="apellido"
                  type="text"
                  placeholder="Apellido"
                  required
                  className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  value={formValues.apellido}
                  onChange={(e) => setFormValues((s) => ({ ...s, apellido: e.target.value }))}
                />
              </div>
              <input
                name="correo"
                type="email"
                placeholder="Correo electrónico"
                required
                className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                value={formValues.correo}
                onChange={(e) => setFormValues((s) => ({ ...s, correo: e.target.value }))}
              />

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-2 h-12 rounded-full
                           bg-gradient-to-r from-cyan-400/90 via-fuchsia-400/90 to-emerald-400/90
                           hover:from-cyan-400 hover:via-fuchsia-400 hover:to-emerald-400
                           text-black font-semibold tracking-wide
                           shadow-[0_10px_40px_-10px_rgba(56,189,248,.6)]
                           disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {enviando ? 'Enviando...' : 'Notificar pago por WhatsApp'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

export default CoursesSection
