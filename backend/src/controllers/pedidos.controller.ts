import { Request, Response } from 'express';
import { guardarPedido, listarPedidos, confirmarPedidoPorId } from '../storage/pedidos.storage';

export const registrarPedido = async (req: Request, res: Response) => {
  try {
    const pedido = await guardarPedido(req.body);
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).send('Error al guardar el pedido');
  }
};

export const obtenerPedidos = async (_: Request, res: Response) => {
  const pedidos = await listarPedidos();
  res.json(pedidos);
};

export const confirmarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await confirmarPedidoPorId(id);
    res.sendStatus(200);
  } catch {
    res.status(500).send('Error al confirmar el pedido');
  }
};
