import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Plus, Search, Building2 } from 'lucide-react';

export default function RoomList() {
  const [groupedRooms, setGroupedRooms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const groups = {};

    properties.forEach(prop => {
      const rooms = JSON.parse(localStorage.getItem(`emerald_rooms_${prop.id}`) || '[]');
      groups[prop.name] = rooms.map(r => ({
        ...r,
        property: prop.name,
        propertyId: prop.id,
        // Mock last cleaned for now if not present
        lastCleaned: r.lastCleaned || 'Never'
      }));
    });

    setGroupedRooms(groups);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading rooms...</div>;

  const totalProperties = Object.keys(groupedRooms).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rooms</h2>
          <p className="text-sm text-slate-500 mt-1">Manage cleaning units and intervals.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors">
            <Plus size={18} />
            <span className="hidden sm:inline">Add Room</span>
          </button>
        </div>
      </div>

      {totalProperties === 0 ? (
        <div className="card p-12 text-center">
          <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No properties found</h3>
          <p className="text-slate-500 mb-6">Create a property first to manage its rooms.</p>
          <Link to="/properties" className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors">
            Go to Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([propertyName, propertyRooms]) => (
            <div key={propertyName} className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
                <Building2 size={18} className="text-slate-400"/>
                <h3 className="font-bold text-slate-800">{propertyName}</h3>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold ml-2">
                  {propertyRooms.length}
                </span>
              </div>
              {propertyRooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No rooms added to this property yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Room Name</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Last Cleaned</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {propertyRooms.map(room => (
                        <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                <BedDouble size={16} />
                              </div>
                              <span className="font-medium text-slate-800">{room.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-500 text-sm">{room.lastCleaned}</td>
                          <td className="p-4 text-right">
                            <Link to={`/properties/${room.propertyId}`} className="text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
