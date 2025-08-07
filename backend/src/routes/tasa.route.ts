// ✅ FILE: routes/tasa.route.ts

import { Router, type Router as RouterType, type Request, type Response } from 'express'
import axios from 'axios'

// ✅ Tipado explícito para evitar errores TS2742
const router: RouterType = Router()

// 📈 Ruta para obtener la tasa del BCV
router.get('/tasa-bcv', async (_req: Request, res: Response) => {
  try {
    const response = await axios.get('https://ve.dolarapi.com/v1/dolares')
    const oficial = response.data.find((x: any) => x.fuente?.toLowerCase() === 'oficial')
    const tasa = parseFloat(oficial?.promedio)

    if (tasa && tasa > 0) {
      return res.json({ tasa })
    } else {
      return res.status(400).json({ error: 'Tasa no válida' })
    }
  } catch (err) {
    console.error('❌ Error al obtener la tasa BCV:', err)
    return res.status(500).json({ error: 'Error al obtener la tasa BCV' })
  }
})

export default router
