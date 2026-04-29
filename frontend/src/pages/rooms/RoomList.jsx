import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Plus, Search } from 'lucide-react';

export default function RoomList() {
  const rooms = [
    { id: 101, name: 'Room 101', property: 'Emerald Grand', lastCleaned: 'Yesterday, 14:00' },
    { id: 102, name: 'Lobby', property: 'Emerald Grand', lastCleaned: 'Today, 08:00' },
    { id: 201, name: 'Apt 4A', property: 'City Center Suite', lastCleaned: '3 days ago' },
  ];

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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Room Name</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Property</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Last Cleaned</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                        <BedDouble size={16} />
                      </div>
                      <span className="font-medium text-slate-800">{room.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{room.property}</td>
                  <td className="p-4 text-slate-500 text-sm">{room.lastCleaned}</td>
                  <td className="p-4 text-right">
                    <Link to={`/rooms/${room.id}`} className="text-primary-600 hover:text-primary-800 font-medium text-sm px-3 py-1.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
