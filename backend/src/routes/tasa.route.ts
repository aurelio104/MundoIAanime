// ✅ FILE: src/routes/tasa.route.ts

import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'
import axios from 'axios'

// ✅ Corrección TS2742: tipo explícito para el router
const router: RouterType = Router()

// 📈 GET /api/tasa-bcv – Obtener tasa oficial del BCV
router.get('/tasa-bcv', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = await axios.get('https://ve.dolarapi.com/v1/dolares')

    // 🔍 Buscar tasa con fuente oficial
    const oficial = data.find(
      (item: any) =>
        typeof item === 'object' &&
        item?.fuente?.toLowerCase?.() === 'oficial' &&
        typeof item?.promedio === 'string'
    )

    const tasa = oficial ? parseFloat(oficial.promedio) : null

    // ✅ Validación de la tasa
    if (tasa && !isNaN(tasa) && tasa > 0) {
      return res.status(200).json({ tasa })
    }

    return res.status(404).json({ error: '❌ Tasa oficial no encontrada o inválida' })
  } catch (error) {
    console.error('❌ Error al obtener la tasa BCV:', error)
    return res.status(500).json({ error: 'Error al obtener la tasa BCV' })
  }
})

export default router
