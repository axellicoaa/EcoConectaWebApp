import React from 'react';
import { Smartphone, BookOpen, Home, Shirt, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  { key: 'Todos',       label: 'Todos',       Icon: RefreshCw },
  { key: 'electronico', label: 'Electrónicos', Icon: Smartphone },
  { key: 'libro',       label: 'Libros',       Icon: BookOpen },
  { key: 'hogar',       label: 'Hogar',        Icon: Home },
  { key: 'ropa',        label: 'Ropa',         Icon: Shirt },
];

interface Props {
  selected: string;
  onSelect: (cat: string) => void;
}

const CategoryChips: React.FC<Props> = ({ selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 justify-center my-5">
    {CATEGORIES.map(cat => (
      <button
        key={cat.key}
        onClick={() => onSelect(cat.key)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition
          ${selected === cat.key
            ? 'bg-green-600 text-white border-green-600 shadow'
            : 'bg-white text-green-700 border-green-400 hover:bg-green-50'
          }`}
      >
        <cat.Icon className="w-4 h-4" />
        {cat.label}
      </button>
    ))}
  </div>
);

export default CategoryChips;
