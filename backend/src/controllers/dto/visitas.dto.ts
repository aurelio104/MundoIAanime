// src/controllers/dto/visitas.dto.ts
export type VisitLeanDTO = {
  ip: string
  userAgent: string
  timestamp: Date | undefined
  geo: {
    country?: string
    city?: string
  }
}

export type VisitasResponse = {
  total: number
  page: number
  pageSize: number
  items: VisitLeanDTO[]
}
