import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestTasa = () => {
  const [tasa, setTasa] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const precioDolar = 9.99;

  useEffect(() => {
    const fetchTasa = async () => {
      try {
        const res = await axios.get('https://ve.dolarapi.com/v1/dolares');
        const oficial = res.data.find((x: any) => x.fuente.toLowerCase() === 'oficial');
        const tasaObtenida = parseFloat(oficial?.promedio);
        if (!isNaN(tasaObtenida) && tasaObtenida > 0) {
          console.log('✅ Tasa oficial:', tasaObtenida);
          setTasa(tasaObtenida);
        } else {
          throw new Error('Tasa inválida');
        }
      } catch (err) {
        console.error('❌ Error obteniendo tasa:', err);
        setError('No se pudo obtener la tasa del BCV');
      }
    };

    fetchTasa();
  }, []);

  const formatBs = (monto: number) =>
    monto.toLocaleString('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">Test de conexión a la tasa oficial (BCV)</h1>

      {error && <p className="text-red-500">{error}</p>}

      {tasa ? (
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 space-y-3">
          <p>💵 Precio en dólares: <strong>$9.99</strong></p>
          <p>📈 Tasa oficial: <strong>{tasa} Bs/USD</strong></p>
          <p>💰 Monto en bolívares: <strong>{formatBs(precioDolar * tasa)}</strong></p>
        </div>
      ) : (
        !error && <p className="text-white/60">Obteniendo tasa del BCV...</p>
      )}
    </div>
  );
};

export default TestTasa;
