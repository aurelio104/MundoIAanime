import React from 'react';
import { motion } from 'framer-motion';

const CTASection = () => {
  return (
    <section id="contacto" className="bg-gradient-to-br from-[#111] to-[#1c1c1c] text-white py-20 px-6 text-center">
      <motion.div
        className="max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold">
          ¿Estás listo para crear anime con inteligencia artificial?
        </h2>
        <p className="text-white/70 text-lg">
          Comienza hoy mismo tu viaje con IA. Accede a todos los cursos, comunidad y contenido exclusivo.
        </p>
        <a
          href="#tulio-catalogo"
          className="inline-block bg-white text-black px-8 py-3 rounded-full text-lg font-semibold shadow hover:scale-105 transition"
        >
          Ver todos los cursos
        </a>
      </motion.div>
    </section>
  );
};

export default CTASection;