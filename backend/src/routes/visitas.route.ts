// src/routes/visitas.route.ts
import express from 'express';
import Visit from '../models/Visit.model.js';

const router = express.Router();

router.post('/api/visitas', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const visita = new Visit({
      ip,
      userAgent
    });

    await visita.save();

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error registrando visita:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

export default router;
