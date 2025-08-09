// ✅ FILE: src/components/CoursesSection.tsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

// Tipado del curso
type Curso = {
  titulo: string
  nivel: string
  desc: string
  precio: string
  enlace: string
  video?: string
  imagen?: string
  detalle?: string
}

// Datos de los cursos
const courses: Curso[] = [
  {
    video: '/videos/videocurso1.mp4',
    titulo: 'Crea Caminatas Apocalípticas con personajes usando IA',
    nivel: 'Principiante',
    desc: 'Aprende a generar personajes anime únicos usando IA generativa, desde prompts básicos hasta mejora facial, estilo y expresión. Ideal si no tienes experiencia previa.',
    detalle:
      'En este curso aprenderás cómo crear una imagen desde cero, para después convertirla en una animación poderosa y viral, utilizando herramientas como ChatGPT, Photoshop, Kling AI y CapCut.\n\nIdeal para creadores visuales, amantes del storytelling y fans de la cultura pop.',
    precio: '$9.99',
    enlace: '/curso/personajes'
  },
  {
    video: '/videos/videocurso2.mp4',
    titulo: 'Crea Videos de Anime en Live Action Estilo Selfie con IA',
    nivel: 'Intermedio',
    desc: 'Imagina crear escenas de anime en live action con solo una idea y un poco de ayuda de la inteligencia artificial.',
    detalle:
      'Este curso te enseñará a hacerlo paso a paso. Usaremos: ChatGPT 4o como tu guionista y generador de imágenes, Photoshop para ajustar resolución y Gemini Veo 3 o Flow AI para animar y dar voz a tus escenas.\n\nCada escena que crees es un universo nuevo. Sigue explorando, sigue creando. El anime ahora también es tuyo. No necesitas saber dibujar ni editar. Solo necesitas imaginación.',
    precio: '$9.99',
    enlace: '/curso/historias'
  },
  {
    video: '/videos/videocurso3.mp4',
    titulo: 'Crea Videos de Anime en Live Action Cinematográficos con IA',
    nivel: 'Avanzado',
    imagen: '/cursos/live-action.jpg',
    desc: ' ',
    precio: '$9.99',
    enlace: '/curso/liveaction'
  },
  {
    video: '/videos/videocurso4.mp4',
    titulo: 'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA',
    nivel: 'Avanzado',
    imagen: '/cursos/live-action.jpg',
    desc: ' ',
    precio: '$9.99',
    enlace: '/curso/liveaction'
  }
]

// Función para formatear monto en Bolívares (si quieres mostrar estimado en el modal)
const formatBs = (monto: number): string =>
  monto.toLocaleString('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  })

const CoursesSection: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null)
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    correo: ''
  })
  const [enviando, setEnviando] = useState(false)

  // Opcional: tasa BCV para mostrar Bs referencial
  const [tasaBCV, setTasaBCV] = useState<number>(0)
  const [montoBs, setMontoBs] = useState<string>('')

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || ''}/api/tasa-bcv`, { withCredentials: true })
      .then((res) => {
        const tasa = res.data?.tasa
        if (!isNaN(tasa) && tasa > 0) setTasaBCV(tasa)
      })
      .catch((err) => console.error('❌ Error obteniendo tasa BCV:', err))
  }, [])

  useEffect(() => {
    if (selectedCourse && tasaBCV > 0) {
      const precio = parseFloat(selectedCourse.precio.replace('$', ''))
      setMontoBs(formatBs(precio * tasaBCV))
    } else {
      setMontoBs('')
    }
  }, [selectedCourse, tasaBCV])

  const generarID = () => Math.random().toString(36).substring(2, 10).toUpperCase()

  // ✅ Guardar pedido en backend y luego abrir WhatsApp
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
        cursoTitulo: selectedCourse.titulo, // En el backend validas y calculas precio
        nombre,
        apellido,
        correo,
        idCompra,
        fechaISO,
        canal: 'web'
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        console.error('❌ Error al registrar pedido:', await res.text())
        alert('No se pudo registrar el pedido. Intenta nuevamente.')
        return
      }

      // ✅ Si se guardó en el server, arma el mensaje a WhatsApp y abre chat
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
        `Precio: ${selectedCourse.precio}\n` +
        `ID Compra: ${idCompra}\n` +
        `Fecha: ${fechaVE}\n\n` +
        `Nombre: ${nombre} ${apellido}\n` +
        `Correo: ${correo}\n` +
        `Gracias por tu compra. Te contactaremos pronto con el acceso al curso.`

      const url = `https://wa.me/584244043150?text=${encodeURIComponent(mensaje)}`
      window.open(url, '_blank')

      // Limpieza
      setSelectedCourse(null)
      setFormValues({ nombre: '', apellido: '', correo: '' })
    } catch (err) {
      console.error('❌ Error procesando pedido:', err)
      alert('No se pudo registrar el pedido. Intenta nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="tulio-catalogo" className="bg-[#0a0a0c] py-20 px-6 text-white">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Cursos disponibles</h2>
        <p className="text-white/80 text-lg">
          Domina herramientas de IA para crear contenido anime visualmente impresionante y narrativas cinematográficas.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {courses.map((curso, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="glass rounded-3xl overflow-hidden border border-white/10 hover:scale-[1.02] transition shadow-glow-md"
          >
            {curso.video ? (
              <video
                src={curso.video}
                autoPlay
                loop
                muted
                playsInline
                className="h-56 w-full object-cover"
              />
            ) : (
              <img src={curso.imagen} alt={curso.titulo} className="h-56 w-full object-cover" />
            )}
            <div className="p-6 space-y-3">
              <h3 className="text-2xl font-semibold text-white drop-shadow-md">{curso.titulo}</h3>
              <p className="text-sm text-white/60">Nivel: {curso.nivel}</p>
              <p className="text-white/70 text-sm">{curso.desc}</p>
              <p className="text-white font-bold">{curso.precio}{montoBs && selectedCourse?.titulo === curso.titulo ? ` · ${montoBs}` : ''}</p>
              <button
                onClick={() => setSelectedCourse(curso)}
                className={`ios-button mt-3 w-full ${
                  curso.titulo === 'Crea Videos de Anime en Live Action Cinematográficos con IA' ||
                  curso.titulo === 'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA'
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={
                  curso.titulo === 'Crea Videos de Anime en Live Action Cinematográficos con IA' ||
                  curso.titulo === 'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA'
                }
              >
                {curso.titulo === 'Crea Videos de Anime en Live Action Cinematográficos con IA' ||
                curso.titulo === 'Crea Podcast Hiper-realistas con tus personajes favoritos usando IA'
                  ? 'Próximamente'
                  : 'Comprar curso'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass text-white max-w-lg w-full p-6 relative space-y-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-3 right-4 text-2xl text-white hover:text-red-500"
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{selectedCourse.titulo}</h2>
            <p className="text-sm text-white/80 whitespace-pre-line">
              {selectedCourse.detalle || selectedCourse.desc}
            </p>
            <p className="text-lg font-semibold text-white">
              Precio: {selectedCourse.precio}
              {montoBs ? ` · ${montoBs} aprox.` : ''}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="nombre"
                  type="text"
                  placeholder="Nombre"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-sm text-white placeholder-white/50"
                  value={formValues.nombre}
                  onChange={(e) => setFormValues({ ...formValues, nombre: e.target.value })}
                />
                <input
                  name="apellido"
                  type="text"
                  placeholder="Apellido"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-sm text-white placeholder-white/50"
                  value={formValues.apellido}
                  onChange={(e) => setFormValues({ ...formValues, apellido: e.target.value })}
                />
              </div>
              <input
                name="correo"
                type="email"
                placeholder="Correo electrónico"
                required
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-sm text-white placeholder-white/50"
                value={formValues.correo}
                onChange={(e) => setFormValues({ ...formValues, correo: e.target.value })}
              />

              <button
                type="submit"
                disabled={enviando}
                className="w-full mt-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full text-sm"
              >
                {enviando ? 'Enviando...' : 'Notificar pago por WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default CoursesSection
