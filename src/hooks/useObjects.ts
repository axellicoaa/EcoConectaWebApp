import { useState } from 'react';
import type { EcoObject } from '../types';
import { getDefaultImage } from '../utils/ecoHelpers';

const INITIAL_OBJECTS: EcoObject[] = [
  { id: 1, name: 'Laptop HP usada',   description: 'Funciona perfecto, batería nueva',  category: 'electronico', type: 'Donación' },
  { id: 2, name: 'Libro de React',    description: 'Learning React – edición 2023',      category: 'libro',       type: 'Venta'    },
  { id: 3, name: 'Mesa de madera',    description: 'Ideal para comedor, 6 personas',     category: 'hogar',       type: 'Donación' },
  { id: 4, name: 'Camisa azul M',     description: 'Muy poco uso, talla M',              category: 'ropa',        type: 'Donación' },
  { id: 5, name: 'Celular Samsung',   description: 'Galaxy A32, sin detalles',           category: 'electronico', type: 'Venta'    },
  { id: 6, name: 'Silla de oficina',  description: 'Ergonómica, ajustable en altura',    category: 'hogar',       type: 'Venta'    },
];

export function useObjects() {
  const [objects, setObjects] = useState<EcoObject[]>(
    INITIAL_OBJECTS.map(obj => ({ ...obj, image: obj.image ?? getDefaultImage(obj.name, obj.category) }))
  );

  function addObject(obj: Omit<EcoObject, 'id' | 'image'> & { image?: string }) {
    const newObj: EcoObject = {
      ...obj,
      id: Date.now(),
      image: obj.image ?? getDefaultImage(obj.name, obj.category),
    };
    setObjects(prev => [newObj, ...prev]);
  }

  return { objects, addObject };
}
