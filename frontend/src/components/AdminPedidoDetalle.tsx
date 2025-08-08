import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { isAuthenticated, logout } from '../utils/auth';

interface Pedido {
  id: string;
  estado?: string;
  total?: number;
  totalBs?: string;
  fecha?: string;
  productos?: string[];
  tallas?: string[];
  colores?: string[];
  preciosUnitarios?: number[];
  metodoPago?: string;
  datosPago?: {
    referencia?: string;
    fecha?: string;
  };
  datosEntrega?: string;
  cliente?: string;
  telefono?: string;
  clienteResumen?: {
    total: number;
    pagados: number;
    pendientes: number;
    cancelados: number;
  };
  alertas?: string[];
}

const estadosOpciones = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Pago verificado', value: 'pago_verificado' },
  { label: 'En fábrica', value: 'en_fabrica' },
  { label: 'Empaquetado', value: 'empaquetado' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'En camino', value: 'en_camino' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Recibido (cliente)', value: 'recibido' },
  { label: 'Cancelado', value: 'cancelado' },
];

const ESTADOS_EXPIRADOS = ['entregado', 'recibido', 'cancelado'];

const AdminPedidoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarPedido = async () => {
    const ok = await isAuthenticated();
    if (!ok) {
      logout();
      navigate('/admin');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al buscar pedido');
      const data: Pedido = await res.json();
      setPedido(data);
      setNuevoEstado(data.estado || '');
      setLoading(false);

      (data.alertas || []).forEach((alerta) => {
        toast((t) => (
          <span>
            ⚠️ {alerta}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-2 font-bold text-yellow-500"
            >
              Cerrar
            </button>
          </span>
        ), { duration: 8000 });
      });
    } catch (err) {
      console.error('❌ Error al cargar el pedido:', err);
      toast.error('No se pudo cargar el pedido');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedido();
  }, [id]);

  const actualizarEstado = async () => {
    if (!nuevoEstado) return;

    const ref = pedido?.datosPago?.referencia?.trim();
    const fecha = pedido?.datosPago?.fecha;
    const refInvalida = !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada');

    if (nuevoEstado === 'pago_verificado' && (!fecha || refInvalida)) {
      toast.error('❌ Referencia o fecha inválida. No puedes marcar como "pago_verificado" sin datos válidos.');
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      toast.success('✅ Estado actualizado correctamente');
      await cargarPedido();
    } catch (err) {
      console.error(err);
      toast.error('❌ No se pudo actualizar el estado');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="text-white font-sans p-6">Cargando...</p>;
  if (!pedido) return <p className="text-white font-sans p-6">Pedido no encontrado.</p>;

  const ref = pedido?.datosPago?.referencia?.trim();
  const fecha = pedido?.datosPago?.fecha;
  const fechaFormateada = fecha && !isNaN(new Date(fecha).getTime()) ? new Date(fecha).toLocaleString('es-VE') : 'No detectada';
  const esExpirado = ESTADOS_EXPIRADOS.includes((pedido.estado || '').toLowerCase());

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        <button
          onClick={() => navigate('/admin/pedidos')}
          className="text-sm bg-white text-black rounded-full px-4 py-2 hover:bg-white/80 transition font-semibold"
        >
          ⬅️ Volver a pedidos
        </button>

        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-glow-md">
          <h2 className="text-2xl font-bold mb-2">📦 Detalle del Pedido</h2>
          <p className="text-sm text-white/70 mb-2">ID: <span className="font-mono">{pedido.id}</span></p>
          <p className="text-white text-lg">💰 Total: <strong>${pedido.total?.toFixed(2)}</strong></p>
          <p className="text-white/70 text-sm">🕒 Fecha: {new Date(pedido.fecha || '').toLocaleString('es-VE')}</p>

          <div className="mt-4">
            <label className="block text-white/80 mb-1 text-sm">📋 Estado actual</label>
            <select
              className="w-full bg-white/10 rounded-xl px-4 py-2 text-sm text-white"
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
            >
              {estadosOpciones.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <p className="text-white/80 text-sm mb-1">💳 Método de pago: <strong>{pedido.metodoPago || '—'}</strong></p>
            <p className="text-white/80 text-sm">📎 Referencia: <strong>{ref || '—'}</strong></p>
            <p className="text-white/80 text-sm">🗓️ Fecha de pago: <strong>{fechaFormateada}</strong></p>
          </div>

          <button
            disabled={guardando || nuevoEstado === pedido.estado}
            onClick={actualizarEstado}
            className="mt-6 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
          >
            {guardando ? 'Guardando...' : 'Actualizar Estado'}
          </button>
        </div>

        {pedido.cliente && pedido.clienteResumen && (
          <motion.div
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white shadow-glow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-2">👤 Historial del Cliente</h3>
            <p><strong>Nombre:</strong> {pedido.cliente}</p>
            <p><strong>Teléfono:</strong> {(pedido.telefono || '').replace('@s.whatsapp.net', '')}</p>
            <p><strong>Pedidos totales:</strong> {pedido.clienteResumen.total}</p>
            <p><strong>Pagados:</strong> {pedido.clienteResumen.pagados}</p>
            <p><strong>Pendientes:</strong> {pedido.clienteResumen.pendientes}</p>
            <p><strong>Cancelados:</strong> {pedido.clienteResumen.cancelados}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AdminPedidoDetalle;
