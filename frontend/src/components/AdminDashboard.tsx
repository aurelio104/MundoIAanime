import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';
import { FaEye, FaBoxOpen, FaBook, FaSignOutAlt } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState(0);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const navigate = useNavigate();

  const cargarDatos = async () => {
    try {
      const resVisitas = await fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
        credentials: 'include'
      });
      const dataVisitas = await resVisitas.json();
      setVisitas(dataVisitas.total || 0);

      const resPedidos = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos`, {
        credentials: 'include'
      });
      const dataPedidos = await resPedidos.json();
      const pendientes = dataPedidos.filter((p: any) => p.estado === 'pendiente').length;
      setPedidosPendientes(pendientes);
    } catch (err) {
      console.error('❌ Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const auth = await isAuthenticated();
        if (!auth) throw new Error('Sesión inválida');
        await cargarDatos();
      } catch {
        await logout();
        navigate('/admin', { replace: true });
      }
    };

    verificarSesion();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-xl font-sans bg-black/90 backdrop-blur-xl">
        🔒 Verificando acceso seguro...
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/hero.png')" }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-white font-sans">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center drop-shadow-xl">
          Panel de Administración
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
          <button
            onClick={() => navigate('/admin/visitas')}
            className="glass-button"
          >
            <FaEye size={40} className="mb-2" />
            <span className="text-xl font-bold">{visitas}</span>
            <p className="text-sm mt-1">Visitas</p>
          </button>

          <button
            onClick={() => navigate('/admin/pedidos')}
            className="relative glass-button"
          >
            <FaBoxOpen size={40} className="mb-2" />
            <span className="text-xl font-bold">Pedidos</span>
            <p className="text-sm mt-1">en total</p>
            {pedidosPendientes > 0 && (
              <span className="absolute top-2 right-4 text-xs bg-red-600 rounded-full px-2 py-1 font-bold shadow">
                {pedidosPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/productos')}
            className="glass-button"
          >
            <FaBook size={40} className="mb-2" />
            <span className="text-xl font-bold">Catálogo</span>
          </button>
        </div>

        <button
          onClick={async () => {
            await logout();
            navigate('/admin', { replace: true });
          }}
          className="mt-16 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-red-500 hover:text-white transition-all shadow-xl"
        >
          <FaSignOutAlt className="inline-block mr-2 mb-1" />
          Cerrar sesión
        </button>
      </div>
    </section>
  );
};

export default AdminDashboard;
