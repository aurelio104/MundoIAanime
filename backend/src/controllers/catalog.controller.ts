import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getAllCollections, saveCollections } from '../utils/catalogo.storage.js'
import type { Producto, Coleccion } from '../types/catalogo.js'

// 📦 Obtener todas las colecciones
export const obtenerColecciones = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const colecciones: Coleccion[] = await getAllCollections()
    return res.json(colecciones)
  } catch (err) {
    console.error('❌ Error al cargar colecciones:', err)
    return res.status(500).json({ error: 'Error al cargar las colecciones' })
  }
}

// 📦 Obtener colección por ID
export const obtenerColeccion = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const coleccion = colecciones.find((c: Coleccion) => c.id === id)
    if (!coleccion) return res.status(404).json({ error: 'Colección no encontrada' })
    return res.json(coleccion)
  } catch (err) {
    console.error('❌ Error al buscar colección:', err)
    return res.status(500).json({ error: 'Error al buscar la colección' })
  }
}

// 🆕 Crear nueva colección
export const crearColeccion = async (req: Request, res: Response): Promise<Response> => {
  const { nombre, descripcion, productoInicial } = req.body
  if (!nombre || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' })
  }

  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const nueva: Coleccion = {
      id: uuidv4(),
      nombre,
      descripcion,
      productos: productoInicial ? [{
        id: uuidv4(),
        nombre: productoInicial.nombre,
        descripcion: productoInicial.descripcion || '',
        precio: parseFloat(productoInicial.precio),
        imagen: productoInicial.imagen
      }] : []
    }

    colecciones.push(nueva)
    await saveCollections(colecciones)
    return res.status(201).json(nueva)
  } catch (err) {
    console.error('❌ Error al crear colección:', err)
    return res.status(500).json({ error: 'Error al crear colección' })
  }
}

// ✏️ Editar colección
export const editarColeccion = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  const { nombre, descripcion } = req.body

  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const coleccion = colecciones.find((c: Coleccion) => c.id === id)
    if (!coleccion) return res.status(404).json({ error: 'Colección no encontrada' })

    if (nombre) coleccion.nombre = nombre
    if (descripcion) coleccion.descripcion = descripcion

    await saveCollections(colecciones)
    return res.json({ success: true, coleccion })
  } catch (err) {
    console.error('❌ Error al editar colección:', err)
    return res.status(500).json({ error: 'Error al editar colección' })
  }
}

// ❌ Eliminar colección
export const eliminarColeccion = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params

  try {
    let colecciones: Coleccion[] = await getAllCollections()
    const existente = colecciones.find((c: Coleccion) => c.id === id)
    if (!existente) return res.status(404).json({ error: 'Colección no encontrada' })

    colecciones = colecciones.filter((c: Coleccion) => c.id !== id)
    await saveCollections(colecciones)
    return res.json({ success: true })
  } catch (err) {
    console.error('❌ Error al eliminar colección:', err)
    return res.status(500).json({ error: 'Error al eliminar colección' })
  }
}

// ➕ Agregar producto a colección
export const agregarProducto = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  const { nombre, descripcion, precio, imagen } = req.body

  if (!nombre || !precio || !imagen) {
    return res.status(400).json({ error: 'Faltan datos del producto' })
  }

  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const coleccion = colecciones.find((c: Coleccion) => c.id === id)
    if (!coleccion) return res.status(404).json({ error: 'Colección no encontrada' })

    const nuevoProducto: Producto = {
      id: uuidv4(),
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      imagen
    }

    coleccion.productos.push(nuevoProducto)
    await saveCollections(colecciones)
    return res.status(201).json(nuevoProducto)
  } catch (err) {
    console.error('❌ Error al agregar producto:', err)
    return res.status(500).json({ error: 'Error al agregar producto' })
  }
}

// 🛠️ Editar producto
export const editarProducto = async (req: Request, res: Response): Promise<Response> => {
  const { id, pid } = req.params
  const { nombre, descripcion, precio, imagen } = req.body

  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const coleccion = colecciones.find((c: Coleccion) => c.id === id)
    if (!coleccion) return res.status(404).json({ error: 'Colección no encontrada' })

    const producto = coleccion.productos.find((p: Producto) => p.id === pid)
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' })

    if (nombre) producto.nombre = nombre
    if (descripcion) producto.descripcion = descripcion
    if (precio) producto.precio = parseFloat(precio)
    if (imagen) producto.imagen = imagen

    await saveCollections(colecciones)
    return res.json({ success: true, producto })
  } catch (err) {
    console.error('❌ Error al editar producto:', err)
    return res.status(500).json({ error: 'Error al editar producto' })
  }
}

// 🗑️ Eliminar producto
export const eliminarProducto = async (req: Request, res: Response): Promise<Response> => {
  const { id, pid } = req.params

  try {
    const colecciones: Coleccion[] = await getAllCollections()
    const coleccion = colecciones.find((c: Coleccion) => c.id === id)
    if (!coleccion) return res.status(404).json({ error: 'Colección no encontrada' })

    const originalLength = coleccion.productos.length
    coleccion.productos = coleccion.productos.filter((p: Producto) => p.id !== pid)

    if (coleccion.productos.length === originalLength) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    await saveCollections(colecciones)
    return res.json({ success: true })
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err)
    return res.status(500).json({ error: 'Error al eliminar producto' })
  }
}
