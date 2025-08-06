/**
 * 🛒 Item individual agregado al carrito o pedido del usuario.
 */
export interface CartItem {
  /** 🧥 Modelo o producto (ej: "Set Old Money", "Camisa Slim") */
  model: string;

  /** 📏 Talla seleccionada (ej: "M", "L", "XL") */
  size: string;

  /** 🎨 Color del producto */
  color: string;

  /** 💲 Precio unitario en dólares */
  price: number;

  /** 🧮 Cantidad solicitada del mismo item (mínimo 1 por defecto) */
  quantity?: number;

  /** 📸 URL opcional del producto (para visualización en WhatsApp o admin panel) */
  imageUrl?: string;

  /** 📝 Comentario opcional del usuario sobre este item (ej: “para regalo”) */
  note?: string;
}
