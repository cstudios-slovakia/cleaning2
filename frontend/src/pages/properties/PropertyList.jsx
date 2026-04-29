import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function PropertyList() {
  const properties = [
    { id: 1, name: 'Emerald Grand', rooms: 15, managers: 2 },
    { id: 2, name: 'City Center Suite', rooms: 4, managers: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Properties</h2>
        <button className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-md">
          <Plus size={18} />
          <span>Add Property</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(prop => (
          <div key={prop.id} className="glass bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-32 bg-gradient-to-r from-emerald-400 to-gold-400 opacity-80 relative">
              <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                {prop.name}
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>{prop.rooms} Rooms</p>
                <p>{prop.managers} Managers</p>
              </div>
              <Link 
                to={`/properties/${prop.id}`} 
                className="text-emerald-600 font-medium hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg"
              >
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
