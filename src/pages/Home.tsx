import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import ObjectCard from '../components/ObjectCard';
import { filterObjects } from '../utils/ecoHelpers';
import { useObjects } from '../hooks/useObjects';

const Home: React.FC = () => {
  const { objects } = useObjects();
  const [selected, setSelected] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = filterObjects(objects, selected, search);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <CategoryChips selected={selected} onSelect={setSelected} />

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar objetos..."
            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Objetos disponibles</h2>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No se encontraron objetos para tu búsqueda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map(obj => (
              <ObjectCard key={obj.id} {...obj} image={obj.image ?? ''} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
