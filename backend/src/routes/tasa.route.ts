// En el archivo de rutas de tu backend (api.routes.ts por ejemplo)
import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/tasa-bcv', async (req, res) => {
  try {
    const response = await axios.get('https://ve.dolarapi.com/v1/dolares');
    const oficial = response.data.find((x: any) => x.fuente.toLowerCase() === 'oficial');
    const tasa = parseFloat(oficial?.promedio);

    if (tasa && tasa > 0) {
      return res.json({ tasa });
    } else {
      return res.status(400).json({ error: 'Tasa no válida' });
    }
  } catch (err) {
    console.error('❌ Error al obtener la tasa BCV:', err);
    return res.status(500).json({ error: 'Error al obtener la tasa BCV' });
  }
});

export default router;
