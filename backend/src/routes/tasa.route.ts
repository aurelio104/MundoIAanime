// ✅ FILE: src/routes/tasa.route.ts

import {
  Router,
  type Request,
  type Response,
  type Router as RouterType
} from 'express'
import axios from 'axios'

// ✅ Corrección crítica de tipado explícito
const router: RouterType = Router()

// 📈 GET /api/tasa-bcv – Obtener tasa oficial del BCV
router.get('/tasa-bcv', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = await axios.get('https://ve.dolarapi.com/v1/dolares')

    const oficial = Array.isArray(data)
      ? data.find(
          (item: any) =>
            typeof item === 'object' &&
            item?.fuente?.toLowerCase?.() === 'oficial' &&
            typeof item?.promedio === 'string'
        )
      : null

    const tasa = oficial ? parseFloat(oficial.promedio) : null

    if (tasa && !isNaN(tasa) && tasa > 0) {
      return res.status(200).json({ tasa })
    }

    console.warn('⚠️ Tasa oficial no válida:', oficial)
    return res.status(404).json({ error: '❌ Tasa oficial no encontrada o inválida' })
  } catch (error) {
    console.error('❌ Error al obtener la tasa BCV:', error)
    return res.status(500).json({ error: 'Error al obtener la tasa BCV' })
  }
})

export default router
