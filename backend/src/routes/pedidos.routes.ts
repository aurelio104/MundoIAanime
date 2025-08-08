import { Router } from 'express';
import { registrarPedido, obtenerPedidos, confirmarPedido } from '../controllers/pedidos.controller';

const router = Router();

router.post('/', registrarPedido);
router.get('/', obtenerPedidos);
router.patch('/:id/confirmar', confirmarPedido);

export default router;
