// LoadingSpinner.tsx — versión TypeScript

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Verificando sesión...' }) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-black/90 text-white space-y-4"
      role="status"
      aria-live="polite"
    >
      {/* Logo animado */}
      <motion.img
        src="/logo.png"
        alt="MundoIAanime Logo"
        className="w-20 h-20 object-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.8,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Spinner */}
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

      {/* Mensaje */}
      <p className="text-sm text-white/70">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
