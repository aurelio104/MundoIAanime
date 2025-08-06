// ✅ FILE: src/types/catalogo.ts

/**
 * 🛍️ Producto individual del catálogo.
 */
export interface Producto {
  /** 🆔 Identificador único del producto */
  id: string;

  /** 🏷️ Nombre del producto */
  nombre: string;

  /** 📝 Descripción corta o detallada */
  descripcion: string;

  /** 💲 Precio unitario en dólares */
  precio: number;

  /** 🖼️ URL de la imagen principal del producto */
  imagen: string;
}

/**
 * 📦 Colección de productos agrupados (ej: Nueva Temporada, Hombre, Mujer)
 * - Utilizada para mostrar productos reales del catálogo con su lista.
 */
export interface Coleccion {
  /** 🆔 Identificador único de la colección */
  id: string;

  /** 🏷️ Nombre de la colección */
  nombre: string;

  /** 📝 Descripción general */
  descripcion: string;

  /** 🧩 Lista de productos pertenecientes a esta colección */
  productos: Producto[];
}

/**
 * 🧠 Configuración semántica de colecciones para detección por IA
 * - Utilizada por el motor de intención y respuestas automáticas.
 */
export interface ColeccionConfig {
  /** 📝 Descripción general de la colección */
  description: string;

  /** 🔑 Palabras clave para búsqueda por IA (invisibles para el usuario) */
  keywords: string[];

  /** 🔠 Sinónimos o palabras comunes que el usuario podría usar */
  items: string[];

  /** 💲 Precio promedio o representativo para mostrar en respuestas */
  price: number;

  /** 🔗 Enlace directo a la colección o al catálogo general */
  link: string;
}
