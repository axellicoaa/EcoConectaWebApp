import { useState } from 'react'
import type { EcoObject } from '../types'

const INITIAL_OBJECTS: EcoObject[] = [
  {
    id: '1',
    title: 'MacBook Pro 2021',
    description: 'Funciona perfectamente, batería nueva, incluye cargador original',
    category: 'Electrónicos',
    categorySlug: 'electronicos',
    type: 'sale',
    price: 450,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=350&fit=crop',
    location: 'Madrid Centro',
    timeAgo: 'Hace 2 horas',
    seller: { name: 'Carlos M.', id: 'mock-1' },
  },
  {
    id: '2',
    title: 'Colección de Libros de React',
    description: '5 libros de programación en excelente estado, ediciones 2023',
    category: 'Libros',
    categorySlug: 'libros',
    type: 'donation',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=350&fit=crop',
    location: 'Barcelona',
    timeAgo: 'Hace 5 horas',
    seller: { name: 'Ana L.', id: 'mock-2' },
  },
  {
    id: '3',
    title: 'Sofá 3 Plazas Gris',
    description: 'Sofá moderno en perfecto estado, muy cómodo',
    category: 'Hogar',
    categorySlug: 'hogar',
    type: 'sale',
    price: 180,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=350&fit=crop',
    location: 'Valencia',
    timeAgo: 'Hace 1 día',
    seller: { name: 'María P.', id: 'mock-3' },
  },
  {
    id: '4',
    title: 'Chaqueta de Cuero Vintage',
    description: 'Talla M, estilo clásico, en excelente condición',
    category: 'Ropa',
    categorySlug: 'ropa',
    type: 'donation',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=350&fit=crop',
    location: 'Sevilla',
    timeAgo: 'Hace 3 días',
    seller: { name: 'Luis R.', id: 'mock-4' },
  },
  {
    id: '5',
    title: 'iPhone 14 Pro',
    description: '128GB, sin rayones, con funda y protector de pantalla',
    category: 'Electrónicos',
    categorySlug: 'electronicos',
    type: 'sale',
    price: 680,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&h=350&fit=crop',
    location: 'Bilbao',
    timeAgo: 'Hace 6 horas',
    seller: { name: 'Pedro S.', id: 'mock-5' },
  },
  {
    id: '6',
    title: 'Mesa de Comedor de Madera',
    description: 'Mesa extensible para 6-8 personas, madera maciza',
    category: 'Hogar',
    categorySlug: 'hogar',
    type: 'donation',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=350&fit=crop',
    location: 'Zaragoza',
    timeAgo: 'Hace 2 días',
    seller: { name: 'Elena G.', id: 'mock-6' },
  },
]

export function useObjects() {
  const [objects, setObjects] = useState<EcoObject[]>(INITIAL_OBJECTS)

  function addObject(obj: Omit<EcoObject, 'id'>) {
    setObjects(prev => [{ ...obj, id: String(Date.now()) }, ...prev])
  }

  return { objects, addObject }
}
