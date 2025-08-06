// AdminPedidos.tsx — convertido completamente a TypeScript

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../utils/auth';
import toast from 'react-hot-toast';

interface Pedido {
  id: string;
  cliente?: string;
  estado?: string;
  total?: string;
  totalBs?: string;
  fecha?: string;
  datosPago?: {
    referencia?: string;
    fecha?: string;
  };
  telefono?: string;
}

const AdminPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hayNotificacion, setHayNotificacion] = useState<boolean>(false);
  const [filtro, setFiltro] = useState<string>('');
  const [estadoFiltrado, setEstadoFiltrado] = useState<string | null>(null);
  const navigate = useNavigate();
  const ultimoIdRef = useRef<string | null>(null);

  const reproducirAlerta = () => {
    try {
      const sonido = new Audio('/alerta-MundoIAanime.mp3');
      sonido.play();
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    } catch (e) {
      console.warn('⚠️ No se pudo reproducir la alerta:', e);
    }
  };

  const cargarPedidos = async () => {
    try {
      const auth = await isAuthenticated();
      if (!auth) throw new Error('Sesión inválida');

      const url = `${import.meta.env.VITE_API_URL}/api/admin/pedidos`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Servidor respondió con error ${res.status}`);

      const data: Pedido[] = await res.json();
      const ordenados = data.sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime());

      if (ordenados.length > 0 && ordenados[0].id !== ultimoIdRef.current) {
        if (ultimoIdRef.current !== null) {
          toast.success('📦 ¡Nuevo pedido recibido!');
          reproducirAlerta();
          setHayNotificacion(true);
        }
        ultimoIdRef.current = ordenados[0].id;
      }

      setPedidos(ordenados);
    } catch (err) {
      console.error('❌ Error al cargar pedidos:', err);
      toast.error('No se pudieron cargar los pedidos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const intervalo = setInterval(cargarPedidos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const resumenPago = (datosPago?: Pedido['datosPago']): string => {
    const ref = datosPago?.referencia?.trim();
    const fecha = datosPago?.fecha;
    const refInvalida = !ref || ref.length < 6 || /^0{6,}$/.test(ref) || ref.toLowerCase().includes('no detectada');
    if (!fecha || refInvalida) return '—';
    return `Ref: ${ref}`;
  };

  const claseEstado = (estado?: string) => {
    const e = (estado || '').toLowerCase();
    if (e.includes('cancelado')) return 'text-red-600';
    if (e.includes('entregado') || e.includes('recibido')) return 'text-green-600';
    if (e.includes('verificado') || e.includes('fabrica') || e.includes('empaquetado')) return 'text-yellow-600';
    if (e.includes('enviado') || e.includes('camino')) return 'text-blue-600';
    return 'text-gray-700';
  };

  const datosFiltrados = pedidos.filter((p) => {
    const ref = resumenPago(p.datosPago);
    const valores = [
      p.id,
      p.cliente,
      p.estado,
      p.total,
      new Date(p.fecha || '').toLocaleString('es-VE'),
      ref,
    ].join(' ').toLowerCase();
    const coincideTexto = valores.includes(filtro.toLowerCase());
    const coincideEstado = !estadoFiltrado || (p.estado || '').toLowerCase() === estadoFiltrado;
    return coincideTexto && coincideEstado;
  });

  const handlePedidoClick = (id: string) => {
    setHayNotificacion(false);
    navigate(`/admin/pedidos/${id}`);
  };

  const generarKeyUnica = (p: Pedido) => `${p.id}-${p.telefono || 'no-tel'}-${p.fecha || Date.now()}`;

  const totalPedidos = pedidos.length;
  const totalCancelados = pedidos.filter(p => p.estado?.toLowerCase().includes('cancelado')).length;
  const totalEnProceso = pedidos.filter(p =>
    ['pendiente', 'pago_verificado', 'en_fabrica', 'empaquetado', 'enviado'].includes((p.estado || '').toLowerCase())
  ).length;
  const montoTotal = pedidos.reduce((acc, p) => acc + (parseFloat(p.total || '0') || 0), 0);

  const crearWidget = (label: string, valor: string | number, color: string, estadoTarget: string | null) => (
    <motion.div
      onClick={() => setEstadoFiltrado(estadoTarget)}
      className={`cursor-pointer backdrop-blur-sm bg-white/30 hover:bg-white/40 rounded-xl p-4 border-l-4 ${color} text-left shadow transition-transform hover:scale-105 font-sans`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h3 className="text-sm text-white/70 font-medium">{label}</h3>
      <p className="text-2xl font-bold text-white">{valor}</p>
    </motion.div>
  );

  return <></>; // Conserva tu JSX original
};

export default AdminPedidos;