// IosInstallPrompt.tsx — versión TypeScript

import React, { useEffect, useState } from 'react';

const isIos = (): boolean =>
  typeof window !== 'undefined' &&
  /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

const isInStandaloneMode = (): boolean =>
  'standalone' in window.navigator && Boolean((window.navigator as any).standalone);

const IosInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  useEffect(() => {
    if (isIos() && !isInStandaloneMode()) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label="Instrucciones para instalar la app en iPhone"
      className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:w-auto p-4 bg-white text-black rounded-xl shadow-xl z-50 border border-gray-300 text-center text-sm md:text-base transition-opacity duration-700 ease-in-out"
      style={{ opacity: 0.95 }}
    >
      📲 Para instalar esta app en tu iPhone:
      <br />
      Toca el ícono <strong>Compartir</strong> y selecciona{' '}
      <strong>"Agregar a pantalla de inicio"</strong>.
    </div>
  );
};

export default IosInstallPrompt;
