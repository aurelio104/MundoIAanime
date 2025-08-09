// ✅ FILE: src/components/TestTasa.tsx
import React, { useEffect, useState } from 'react'
import { api, API_URL } from '../utils/auth' // usa la instancia central

const precioDolar = 9.99

const TestTasa: React.FC = () => {
  const [tasa, setTasa] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasa = async () => {
      try {
        // 1) Pide a tu backend (cookies, CORS, etc. ya resuelto)
        const r = await api.get('/api/tasa-bcv', { timeout: 9000 })
        if (r.status === 200 && typeof r.data?.tasa === 'number') {
          setTasa(r.data.tasa)
          return
        }
        throw new Error(`Backend respondió ${r.status}`)
      } catch (_e) {
        // 2) Fallback directo a DolarApi (por si el backend cae)
        try {
          const r2 = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' })
          if (!r2.ok) throw new Error(String(r2.status))
          const data: any = await r2.json()
          const valor = Number(data?.promedio)
          if (!Number.isFinite(valor) || valor <= 0) throw new Error('Tasa inválida')
          setTasa(valor)
        } catch (e2) {
          console.error('❌ Error obteniendo tasa:', e2)
          setError('No se pudo obtener la tasa del BCV')
        }
      }
    }

    fetchTasa()
  }, [])

  const formatBs = (monto: number) =>
    monto.toLocaleString('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">Test de conexión a la tasa oficial (BCV)</h1>

      {error && <p className="text-red-500">{error}</p>}

      {tasa ? (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 space-y-3">
          <p>💵 Precio en dólares: <strong>$9.99</strong></p>
          <p>📈 Tasa oficial: <strong>{tasa} Bs/USD</strong></p>
          <p>💰 Monto en bolívares: <strong>{formatBs(precioDolar * tasa)}</strong></p>
          <p className="text-xs text-white/60 mt-2">Fuente: {API_URL}/api/tasa-bcv</p>
        </div>
      ) : (
        !error && <p className="text-white/60">Obteniendo tasa del BCV...</p>
      )}
    </div>
  )
}

export default TestTasa
