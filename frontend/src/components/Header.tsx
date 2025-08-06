// Header.tsx — versión TypeScript

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        hasScrolled
          ? 'bg-[#0f0f11]/80 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#inicio"
          onClick={closeMobileMenu}
          className="flex items-center space-x-3 group"
        >
          <img
            src="/logo.png"
            alt="Logo MundoIAanime"
            className="w-10 h-10 rounded-full shadow-glow-md"
          />
          <span className="text-xl font-bold tracking-wide text-white group-hover:text-cyan-400 transition">
            MundoIAanime
          </span>
        </a>

        <nav className="hidden md:flex items-center space-x-8">
          {[
            { label: 'Inicio', id: '#inicio' },
            { label: 'Cursos', id: '#tulio-catalogo' },
          ].map(({ label, id }) => (
            <a
              key={id}
              href={id}
              onClick={closeMobileMenu}
              className="text-sm uppercase tracking-widest text-white/80 hover:text-cyan-400 transition font-medium"
            >
              {label}
            </a>
          ))}

          <a
            href="/admin"
            className="ios-button text-sm px-4 py-2 ml-4"
          >
            Admin
          </a>
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir menú móvil"
          aria-expanded={isMobileMenuOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? 'M6 18L18 6M6 6l12 12'
                  : 'M4 6h16M4 12h16M4 18h16'
              }
            />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden bg-[#111] border-t border-white/10 overflow-hidden backdrop-blur-md"
          >
            <div className="flex flex-col space-y-4 px-6 py-6">
              {[
                { label: 'Inicio', id: '#inicio' },
                { label: 'Cursos', id: '#tulio-catalogo' },
                { label: 'Contacto', id: '#contacto' },
              ].map(({ label, id }) => (
                <a
                  key={id}
                  href={id}
                  onClick={closeMobileMenu}
                  className="text-sm uppercase tracking-widest text-white hover:text-cyan-400 transition"
                >
                  {label}
                </a>
              ))}
              <a
                href="/admin"
                className="ios-button text-center"
              >
                Admin
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
