import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Archive, Building2, History } from 'lucide-react';
import Modal from '../../components/Modal';

export default function PropertyList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  
  // Initialize from localStorage or use defaults
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('emerald_properties');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Emerald Grand', rooms: 15, managers: 2 },
      { id: 2, name: 'City Center Suite', rooms: 4, managers: 1 },
    ];
  });

  // Save to localStorage whenever properties change
  useEffect(() => {
    localStorage.setItem('emerald_properties', JSON.stringify(properties));
  }, [properties]);

  const handleAddProperty = (e) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    const newProp = {
      id: Date.now(),
      name: newPropName,
      rooms: 0,
      managers: 0
    };

    setProperties([...properties, newProp]);
    setNewPropName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
          <p className="text-sm text-slate-500 mt-1">Manage hotels and locations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} />
          <span>New Property</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(prop => (
          <div key={prop.id} className="card hover:shadow-md transition-shadow group overflow-hidden flex flex-col">
            <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
              {prop.coverImage ? (
                <img src={prop.coverImage} alt={prop.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 font-bold text-lg">{prop.name.charAt(0)}</span>
              )}
              
              {prop.logo && (
                <div className="absolute bottom-2 left-2 w-10 h-10 bg-white rounded-lg shadow-md p-1 z-10">
                  <img src={prop.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm(`Are you sure you want to archive ${prop.name}?`)) {
                    setProperties(properties.filter(p => p.id !== prop.id));
                  }
                }}
                className="absolute top-3 right-3 p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Archive Property"
              >
                <Archive size={16} />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-800">{prop.name}</h3>
              <div className="flex space-x-4 mt-2 mb-4 text-sm text-slate-500">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{prop.rooms}</span>
                  <span className="text-xs uppercase tracking-wider">Rooms</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{prop.managers}</span>
                  <span className="text-xs uppercase tracking-wider">Managers</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/properties/${prop.id}/logs`}
                  style={{ backgroundColor: prop.theme || '#0ea5e9' }}
                  className="flex items-center justify-center text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                  title="View Cleaning Logs"
                >
                  <History size={18} />
                </Link>
                <Link 
                  to={`/properties/${prop.id}`} 
                  className="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-primary-600 font-medium px-4 py-2 rounded-xl transition-colors border border-slate-200"
                >
                  Manage Property
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Property"
      >
        <form onSubmit={handleAddProperty} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Name</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                placeholder="e.g. Grand Hotel"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

