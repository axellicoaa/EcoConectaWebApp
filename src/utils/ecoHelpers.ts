import type { EcoObject } from '../types';

export function getDefaultImage(name: string, category: string): string {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (c === 'electronico' || n.includes('laptop') || n.includes('computadora') || n.includes('celular') || n.includes('tablet'))
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400';

  if (c === 'hogar' || n.includes('colchon') || n.includes('cama') || n.includes('mesa') || n.includes('silla') || n.includes('sofa'))
    return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400';

  if (c === 'libro' || n.includes('libro') || n.includes('novela') || n.includes('texto'))
    return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400';

  if (c === 'ropa' || n.includes('camisa') || n.includes('pantalon') || n.includes('vestido') || n.includes('chaqueta'))
    return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400';

  return 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400';
}

export function filterObjects(objects: EcoObject[], category: string, search: string): EcoObject[] {
  return objects.filter(obj => {
    const matchCat = category === 'Todos' || obj.category === category;
    const q = search.toLowerCase();
    const matchSearch = obj.title.toLowerCase().includes(q) || obj.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}
