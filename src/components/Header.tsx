import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Plus } from 'lucide-react';

const Header: React.FC = () => (
  <header className="bg-green-700 text-white text-center py-10 px-4 shadow-md">
    <div className="flex items-center justify-center gap-2">
      <Leaf className="w-8 h-8 text-green-200" />
      <h1 className="text-4xl font-extrabold tracking-tight">EcoConecta</h1>
    </div>
    <p className="mt-2 text-green-100 text-lg">Reutiliza, dona y conecta con tu comunidad</p>
    <Link
      to="/publicar"
      className="mt-4 inline-flex items-center gap-1 bg-white text-green-700 font-semibold px-5 py-2 rounded-full hover:bg-green-100 transition"
    >
      <Plus className="w-4 h-4" /> Publicar objeto
    </Link>
  </header>
);

export default Header;
