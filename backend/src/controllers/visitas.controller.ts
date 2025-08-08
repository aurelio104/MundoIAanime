// ✅ FILE: src/controllers/visitas.controller.ts

import { Request, Response } from 'express'
import Visit from '../models/Visit.model.js'

export const obtenerVisitas = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const total = await Visit.countDocuments()
    const ultimas = await Visit.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    return res.json({
      total,
      ultimas: ultimas.map((v) => ({
        ip: v.ip,
        userAgent: v.userAgent,
        timestamp: v.createdAt,
        geo: v.location
      }))
    })
  } catch (error) {
    console.error('❌ Error al obtener visitas:', error)
    return res.status(500).json({ error: 'Error interno al obtener visitas' })
  }
}
