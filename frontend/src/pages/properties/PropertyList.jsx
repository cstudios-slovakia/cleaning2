import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical } from 'lucide-react';

export default function PropertyList() {
  const properties = [
    { id: 1, name: 'Emerald Grand', rooms: 15, managers: 2 },
    { id: 2, name: 'City Center Suite', rooms: 4, managers: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Properties</h2>
          <p className="text-sm text-slate-500 mt-1">Manage hotels and locations.</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium">
          <Plus size={18} />
          <span>New Property</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(prop => (
          <div key={prop.id} className="card hover:shadow-md transition-shadow group">
            <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative">
              <span className="text-slate-400 font-bold text-lg">{prop.name.charAt(0)}</span>
              <button className="absolute top-3 right-3 p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
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
              <Link 
                to={`/properties/${prop.id}`} 
                className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-primary-600 font-medium px-4 py-2 rounded-xl transition-colors border border-slate-200"
              >
                Manage Property
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
