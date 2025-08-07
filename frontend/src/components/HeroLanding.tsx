// HeroLanding.tsx — versión TypeScript

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HeroLanding: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const start = window.scrollY;
      const end = 100;
      const duration = 1000;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        window.scrollTo(0, start + (end - start) * progress);
        if (progress < 1) requestAnimationFrame(animateScroll);
      };

      requestAnimationFrame(animateScroll);
    }, 3500);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showModal) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showModal]);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const scrollToCatalog = () => {
    const section = document.querySelector('#tulio-catalogo');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="inicio"
      className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden select-none"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        zIndex: 1,
      }}
    >
      {showModal && (
<motion.div
  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.4 }}
>
  <motion.div
    className="max-w-md w-full glass text-white p-6 relative sm:max-w-xs sm:w-full h-[80%] overflow-auto"
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <button
      onClick={() => setShowModal(false)}
      className="absolute top-3 right-4 text-white text-xl font-bold hover:text-red-400 transition"
      aria-label="Cerrar"
    >
      ×
    </button>
    <div className="w-full">
      <blockquote
        className="tiktok-embed w-full"
        cite="https://www.tiktok.com/@mundoiaanime/video/7522630469943315725"
        data-video-id="7522630469943315725"
        style={{ maxWidth: '100%', minWidth: '100%' }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            title="@mundoiaanime"
            href="https://www.tiktok.com/@mundoiaanime?refer=embed"
          >
            @mundoiaanime
          </a>{' '}
          Nezuko Kamado caminando entre las ruinas. 📌 Visual Art AI.
        </section>
      </blockquote>
    </div>
  </motion.div>
</motion.div>
      )}

      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6, ease: 'easeOut' }}
      />

      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-10"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img
          src="/logo.png"
          alt="Logo MundoIAanime"
          className="w-40 h-40 object-contain pointer-events-none select-none rounded-full shadow-glow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1.5, y: -30 }}
          transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
        />

        <motion.h1
          className="text-2xl md:text-4xl font-bold tracking-wide text-white drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        >
          Aprende a crear contenido anime con Inteligencia Artificial
        </motion.h1>

        <motion.div
          className="flex flex-col space-y-4 mt-4 items-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.6, ease: 'easeOut' }}
        >
          <a
            href="https://whatsapp.com/channel/0029Vb6FQccGZNCrqrneCE0G"
            className="ios-button w-56 text-lg text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            Únete al canal VIP
          </a>

          <button
            onClick={scrollToCatalog}
            className="ios-button w-56 text-lg"
          >
            Ver Cursos
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroLanding;
