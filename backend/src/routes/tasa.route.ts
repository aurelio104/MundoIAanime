// ✅ FILE: src/routes/tasa.route.ts

import {
  Router,
  type Router as RouterType,
  type Request,
  type Response
} from 'express'
import axios from 'axios'

const router: RouterType = Router()

// 📈 Ruta para obtener la tasa oficial del BCV desde dolarapi.com
router.get('/tasa-bcv', async (_req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = await axios.get('https://ve.dolarapi.com/v1/dolares')

    const oficial = data.find(
      (item: any) =>
        typeof item === 'object' &&
        item?.fuente?.toLowerCase?.() === 'oficial' &&
        typeof item?.promedio === 'string'
    )

    const tasa = oficial ? parseFloat(oficial.promedio) : null

    if (tasa && !isNaN(tasa) && tasa > 0) {
      return res.status(200).json({ tasa })
    }

    return res.status(404).json({ error: 'Tasa oficial no encontrada o inválida' })
  } catch (error) {
    console.error('❌ Error al obtener la tasa BCV:', error)
    return res.status(500).json({ error: 'Error al obtener la tasa BCV' })
  }
})

export default router
