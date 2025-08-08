// ✅ FILE: src/pages/AdminVisitas.tsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Visita {
  ip: string
  userAgent: string
  timestamp: string
  geo?: {
    city?: string
    country?: string
    region?: string
  }
}

const AdminVisitas: React.FC = () => {
  const [total, setTotal] = useState(0)
  const [ultimas, setUltimas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/visitas`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total || 0)
        setUltimas(data.ultimas || [])
      })
      .catch((err) => {
        console.error('❌ Error al cargar visitas:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white text-xl font-sans bg-black/90 backdrop-blur-xl">
        🔄 Cargando visitas...
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold font-sans">📍 Registro de Visitas</h1>
            <p className="text-white/60 text-sm mt-2 font-sans">
              Se han registrado un total de <strong>{total}</strong> visitas únicas.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-white text-black text-sm rounded-full px-5 py-2 hover:bg-gray-200 font-semibold"
          >
            ⬅️ Volver al panel
          </button>
        </div>

        {ultimas.length === 0 ? (
          <p className="text-white/60 text-center mt-20">No hay visitas recientes.</p>
        ) : (
          <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-glow-md">
            <ul className="space-y-4">
              {ultimas.map((v, i) => (
                <li key={i} className="border-b border-white/10 pb-2">
                  <p className="text-sm text-white/90">
                    📅 <strong>{new Date(v.timestamp).toLocaleString('es-VE')}</strong>
                  </p>
                  <p className="text-sm text-white/70">
                    🌐 IP: {v.ip} – Navegador: {v.userAgent}
                  </p>
                  <p className="text-sm text-white/70">
                    📍 Ubicación: {v.geo?.city || 'Ciudad desconocida'}, {v.geo?.country || 'País desconocido'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminVisitas
