import fs from 'fs/promises'
import path from 'path'
import type { Coleccion } from '../types/catalogo.js'

const STORAGE_PATH = path.resolve('storage/colecciones.json')

export async function getAllCollections(): Promise<Coleccion[]> {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function saveCollections(colecciones: Coleccion[]): Promise<void> {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(colecciones, null, 2), 'utf-8')
}
