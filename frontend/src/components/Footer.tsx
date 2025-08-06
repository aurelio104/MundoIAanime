import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0b0b0e] text-white pt-12 pb-6 px-4 sm:px-6 text-center font-sans border-t border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10 border-b border-white/10 pb-10">
        
        {/* Marca */}
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-cyan-400">MundoIAanime</h2>
          <p className="text-sm text-white/70 mt-2 max-w-md mx-auto">
            Aprende a crear anime con inteligencia artificial. Cursos, comunidad y herramientas para potenciar tu creatividad visual.
          </p>
        </div>

        {/* Navegación */}
        <nav aria-label="Navegación principal">
          <h3 className="text-xs uppercase font-semibold tracking-wide mb-3 text-white/50">
            Secciones
          </h3>
          <ul className="space-y-2 text-sm text-white/70" role="list">
            <li>
              <a href="#inicio" className="hover:text-cyan-400 transition" aria-label="Ir a Inicio">
                Inicio
              </a>
            </li>
            <li>
              <a href="#tulio-catalogo" className="hover:text-cyan-400 transition" aria-label="Ver cursos">
                Cursos
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-xs text-white/40 px-2">
        &copy; {new Date().getFullYear()} MundoIAanime. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
