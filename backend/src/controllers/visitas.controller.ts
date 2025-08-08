// src/controllers/visitas.controller.ts
import type { Request, Response } from 'express'
import { fetchVisitasLean } from '../repositories/visitas.repo.js'
import type { VisitasResponse, VisitLeanDTO } from './dto/visitas.dto.js'

export async function obtenerVisitas(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1)
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '25'), 10) || 25))

    const { total, docs } = await fetchVisitasLean(page, pageSize)

    const items: VisitLeanDTO[] = docs.map((v: any) => ({
      ip: v?.ip ?? '',
      userAgent: v?.userAgent ?? '',
      timestamp: v?.timestamp ?? v?.createdAt, // fallback robusto
      geo: {
        country: v?.location?.country,
        city: v?.location?.city
      }
    }))

    const payload: VisitasResponse = { total, page, pageSize, items }
    return res.status(200).json(payload)
  } catch (e) {
    console.error('❌ Error al obtener visitas:', e)
    return res.status(500).json({ error: 'Error interno al obtener visitas' })
  }
}
