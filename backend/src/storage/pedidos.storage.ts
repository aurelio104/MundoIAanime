import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';

const FILE = './data/pedidos.json';

export const guardarPedido = async (pedido: any) => {
  const data = await listarPedidos();
  const nuevo = { ...pedido, id: uuid(), confirmado: false };
  data.push(nuevo);
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
  return nuevo;
};

export const listarPedidos = async () => {
  try {
    const file = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(file);
  } catch {
    return [];
  }
};

export const confirmarPedidoPorId = async (id: string) => {
  const data = await listarPedidos();
  const updated = data.map((p: any) => (p.id === id ? { ...p, confirmado: true } : p));
  await fs.writeFile(FILE, JSON.stringify(updated, null, 2));
};
