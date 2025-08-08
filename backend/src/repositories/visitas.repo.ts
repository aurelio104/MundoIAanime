// src/repositories/visitas.repo.ts
import Visit from '../models/Visit.model.js'

export async function fetchVisitasLean(page: number, pageSize: number) {
  const skip = Math.max(0, (page - 1) * pageSize)

  // Proyección: sólo lo necesario
  const projection = { ip: 1, userAgent: 1, timestamp: 1, createdAt: 1, location: 1 } as const

  const [total, docs] = await Promise.all([
    Visit.countDocuments().exec(),
    Visit.find({}, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean()
      .exec()
  ])

  return { total, docs }
}
