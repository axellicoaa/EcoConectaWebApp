import React from 'react';
import { Smartphone, BookOpen, Home, Shirt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  name: string;
  description: string;
  image: string;
  category: string;
  type: string;
}

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  electronico: { icon: Smartphone, label: 'Electrónico' },
  libro:       { icon: BookOpen,   label: 'Libro' },
  hogar:       { icon: Home,       label: 'Hogar' },
  ropa:        { icon: Shirt,      label: 'Ropa' },
};

const TYPE_COLORS: Record<string, string> = {
  'Donación': 'bg-green-100 text-green-700',
  'Venta':    'bg-blue-100 text-blue-700',
};

const ObjectCard: React.FC<Props> = ({ name, description, image, category, type }) => (
  <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
    <img
      src={image}
      alt={name}
      className="w-full h-44 object-cover"
      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca'; }}
    />
    <div className="p-4 flex flex-col gap-2 flex-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-800 text-lg leading-tight">{name}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600'}`}>
          {type}
        </span>
      </div>
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
          {CATEGORY_ICONS[category] && (
            React.createElement(CATEGORY_ICONS[category].icon, { className: 'w-3 h-3' })
          )}
          {CATEGORY_ICONS[category]?.label ?? category}
        </span>
      <p className="text-sm text-gray-600 flex-1">{description}</p>
    </div>
  </div>
);

export default ObjectCard;
