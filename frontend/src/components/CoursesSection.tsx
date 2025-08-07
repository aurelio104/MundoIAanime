import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Tipado del curso
type Curso = {
  titulo: string;
  nivel: string;
  desc: string;
  precio: string;
  enlace: string;
  video?: string;
  imagen?: string;
  detalle?: string;
};

// Datos de los cursos
const courses: Curso[] = [
  {
    video: '/videos/videocurso1.mp4',
    titulo: "Crea Caminatas Apocalípticas con personajes usando IA",
    nivel: "Principiante",
    desc: "Aprende a generar personajes anime únicos usando IA generativa, desde prompts básicos hasta mejora facial, estilo y expresión. Ideal si no tienes experiencia previa.",
    detalle: "En este curso aprenderás cómo crear una imagen desde cero, para después convertirla en una animación poderosa y viral, utilizando herramientas como ChatGPT, Photoshop, Kling AI y CapCut.\n\nIdeal para creadores visuales, amantes del storytelling y fans de la cultura pop.",
    precio: "$9.99",
    enlace: "/curso/personajes"
  },
  {
    video: '/videos/videocurso2.mp4',
    titulo: "Crea Videos de Anime en Live Action Estilo Selfie con IA",
    nivel: "Intermedio",
    desc: "Imagina crear escenas de anime en live action con solo una idea y un poco de ayuda de la inteligencia artificial.",
    detalle: "Este curso te enseñará a hacerlo paso a paso. Usaremos: ChatGPT 4o como tu guionista y generador de imágenes, Photoshop para ajustar resolución y Gemini Veo 3 o Flow AI para animar y dar voz a tus escenas.\n\nCada escena que crees es un universo nuevo. Sigue explorando, sigue creando. El anime ahora también es tuyo. No necesitas saber dibujar ni editar. Solo necesitas imaginación.",
    precio: "$9.99",
    enlace: "/curso/historias"
  },
  {
    video: '/videos/videocurso3.mp4',
    titulo: "Crea Videos de Anime en Live Action Cinematográficos con IA",
    nivel: "Avanzado",
    imagen: "/cursos/live-action.jpg",
    desc: " ",
    precio: "$9.99",
    enlace: "/curso/liveaction"
  },
  {
    video: '/videos/videocurso4.mp4',
    titulo: "Crea Podcast Hiper-realistas con tus personajes favoritos usando IA",
    nivel: "Avanzado",
    imagen: "/cursos/live-action.jpg",
    desc: " ",
    precio: "$9.99",
    enlace: "/curso/liveaction"
  },
];

// Función para formatear monto en Bolívares
const formatBs = (monto: number): string =>
  monto.toLocaleString('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  });

const CoursesSection = () => {
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);
  const [formValues, setFormValues] = useState({ nombre: '', apellido: '', correo: '', metodo: '', comprobante: '' });
  const [tasaBCV, setTasaBCV] = useState<number>(0);
  const [montoBs, setMontoBs] = useState<string>('');

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL || ''}/api/tasa-bcv`, { withCredentials: true })
      .then((res) => {
        const tasa = res.data?.tasa;
        if (!isNaN(tasa) && tasa > 0) {
          setTasaBCV(tasa);
        }
      })
      .catch((err) => {
        console.error('❌ Error obteniendo tasa BCV:', err);
      });
  }, []);

  useEffect(() => {
    if (selectedCourse && tasaBCV > 0 && formValues.metodo === 'Pago Móvil') {
      const precio = parseFloat(selectedCourse.precio.replace('$', ''));
      setMontoBs(formatBs(precio * tasaBCV));
    } else {
      setMontoBs('');
    }
  }, [selectedCourse, tasaBCV, formValues.metodo]);

  const generarID = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idCompra = generarID();
    const fecha = new Date().toLocaleString('es-VE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const precioDolar = parseFloat(selectedCourse?.precio.replace('$', '') || '0');
    const montoEnBs = formatBs(precioDolar * tasaBCV);

    const mensaje = `DETALLE DE LA COMPRA:\n\n` +
      `Curso: ${selectedCourse?.titulo}\n` +
      `Precio: ${selectedCourse?.precio}\n` +
      `ID Compra: ${idCompra}\n` +
      `Fecha: ${fecha}\n\n` +
      `Nombre: ${formValues.nombre} ${formValues.apellido}\n` +
      `Correo: ${formValues.correo}\n` +


      `Gracias por tu compra. Te contactaremos pronto con el acceso al curso.`;

    const url = `https://wa.me/584244043150?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const infoMetodo: Record<string, string> = {
    'Zelle': 'Correo Zelle: franceline@example.com',
    'Pago Móvil': 'Pago Móvil: +58 414-000-0000 / CI: 12345678',
    'PayPal': 'Enlace PayPal: paypal.me/mundoiaanime',
    'Binance': 'USDT TRC20: TNJ8xxx....XRP'
  };

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
              <p className="text-white font-bold">{curso.precio}</p>
              <button
                onClick={() => setSelectedCourse(curso)}
                className={`ios-button mt-3 w-full ${curso.titulo === "Crea Videos de Anime en Live Action Cinematográficos con IA" || curso.titulo === "Crea Podcast Hiper-realistas con tus personajes favoritos usando IA" ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                disabled={curso.titulo === "Crea Videos de Anime en Live Action Cinematográficos con IA" || curso.titulo === "Crea Podcast Hiper-realistas con tus personajes favoritos usando IA"}
              >
                {curso.titulo === "Crea Videos de Anime en Live Action Cinematográficos con IA" || curso.titulo === "Crea Podcast Hiper-realistas con tus personajes favoritos usando IA" ? "Próximamente" : "Comprar curso"}
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
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{selectedCourse.titulo}</h2>
            <p className="text-sm text-white/80 whitespace-pre-line">{selectedCourse.detalle || selectedCourse.desc}</p>
            <p className="text-lg font-semibold text-white">Precio: {selectedCourse.precio}</p>

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
                className="w-full mt-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full text-sm"
              >
                Notificar pago por WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CoursesSection;
