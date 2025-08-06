import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';
import toast from 'react-hot-toast';

interface Coleccion {
  id: string;
  nombre: string;
  descripcion: string;
}

const DashboardProductos: React.FC = () => {
  const navigate = useNavigate();
  const [colecciones, setColecciones] = useState<Coleccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nuevaColeccion, setNuevaColeccion] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    const verificar = async () => {
      const auth = await isAuthenticated();
      if (!auth) {
        logout();
        navigate('/admin');
      } else {
        cargarColecciones();
      }
    };
    verificar();
  }, [navigate]);

  const cargarColecciones = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudo obtener las colecciones');
      const data = await res.json();
      setColecciones(data);
    } catch (err) {
      console.error('❌ Error cargando colecciones:', err);
      toast.error('Error al cargar colecciones');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (id: string) => navigate(`/admin/colecciones/${id}`);

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta colección?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar colección');
      setColecciones((prev) => prev.filter((c) => c.id !== id));
      toast.success('✅ Colección eliminada');
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      toast.error('No se pudo eliminar la colección');
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, descripcion } = nuevaColeccion;

    if (!nombre || !descripcion) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/colecciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, descripcion }),
      });
      if (!res.ok) throw new Error('Error al crear colección');

      const nueva = await res.json();
      setColecciones(prev => [...prev, nueva]);
      toast.success('✅ Colección creada');
      setNuevaColeccion({ nombre: '', descripcion: '' });
    } catch (err) {
      console.error('❌ Error al crear colección:', err);
      toast.error('No se pudo crear la colección');
    }
  };

  return (
    <section
      className="relative min-h-screen w-full flex items-center justify-center text-center overflow-hidden px-4 py-20 font-sans"
      style={{
        backgroundImage: "url('/hero.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div className="absolute inset-0 bg-black z-0" initial={{ opacity: 1 }} animate={{ opacity: 0.5 }} transition={{ duration: 1.4 }} />
      <motion.div className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 1.8, delay: 0.6 }} />

      <motion.div className="relative z-20 text-white flex flex-col items-center w-full max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img src="/LogoB.png" alt="Logo MundoIAanime" className="w-20 h-20 mb-6 object-contain"
          initial={{ scale: 0 }} animate={{ scale: 2, y: -20 }} transition={{ duration: 1.5, delay: 0.5 }} />

        <motion.h2 className="text-3xl font-heading uppercase tracking-wider mb-6"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.3 }}>
          Gestión de Cursos
        </motion.h2>

        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full text-left text-white space-y-6 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.6 }}
        >
          {/* Formulario crear nueva colección */}
          <form onSubmit={handleCrear} className="space-y-4">
            <h3 className="text-xl font-semibold">➕ Nuevo Curso</h3>
            <input
              type="text"
              placeholder="Nombre del curso"
              value={nuevaColeccion.nombre}
              onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, nombre: e.target.value })}
              className="w-full px-4 py-2 rounded bg-white/5 border border-white/20 text-white"
            />
            <textarea
              placeholder="Descripción del curso"
              value={nuevaColeccion.descripcion}
              onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, descripcion: e.target.value })}
              className="w-full px-4 py-2 rounded bg-white/5 border border-white/20 text-white"
            />
            <button
              type="submit"
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
            >
              Crear curso
            </button>
          </form>

          {/* Lista de cursos */}
          <hr className="border-white/20 my-6" />

          {loading ? (
            <p className="text-white/90">Cargando cursos...</p>
          ) : colecciones.length === 0 ? (
            <p className="text-white/70">No hay cursos disponibles.</p>
          ) : (
            <ul className="space-y-4">
              {colecciones.map((col) => (
                <li key={col.id} className="bg-white/10 p-4 rounded-xl border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{col.nombre}</h3>
                      <p className="text-white/70 text-sm">{col.descripcion}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEditar(col.id)}
                        className="px-4 py-1 bg-blue-600 rounded hover:bg-blue-700 transition"
                        aria-label="Editar colección"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(col.id)}
                        className="px-4 py-1 bg-red-600 rounded hover:bg-red-700 transition"
                        aria-label="Eliminar colección"
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

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mt-10 py-2 px-6 border border-white text-white text-sm uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm"
        >
          ← Volver al panel
        </button>
      </motion.div>
    </section>
  );
};

export default DashboardProductos;
