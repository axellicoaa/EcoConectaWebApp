import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { key: 'electronico', label: '📱 Electrónico' },
  { key: 'libro',       label: '📚 Libro' },
  { key: 'hogar',       label: '🪑 Hogar' },
  { key: 'ropa',        label: '👕 Ropa' },
];

const TYPES = ['Donación', 'Venta'];

interface FormState {
  name: string;
  description: string;
  type: string;
  category: string;
}

const Publish: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    type: 'Donación',
    category: 'electronico',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    // Aquí se conectaría con el hook global para agregar el objeto real
    alert(`¡Objeto "${form.name}" publicado correctamente!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white text-center py-8 px-4 shadow-md">
        <div className="flex items-center justify-center gap-2">
          <Leaf className="w-7 h-7 text-green-200" />
          <h1 className="text-3xl font-extrabold">EcoConecta</h1>
        </div>
        <p className="text-green-100 mt-1">Publica un objeto para donar o vender</p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Publicar objeto</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del objeto</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Laptop HP, Camisa azul..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Estado, características, detalles relevantes..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Imagen (opcional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition"
          >
            Publicar
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-1 text-green-700 hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Publish;
