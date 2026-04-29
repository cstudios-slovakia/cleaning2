import React from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, AlertCircle } from 'lucide-react';

export default function RoomList() {
  const rooms = [
    { id: 101, name: 'Room 101', property: 'Emerald Grand', lastCleaned: 'Yesterday, 14:00', interval: 2 },
    { id: 102, name: 'Lobby', property: 'Emerald Grand', lastCleaned: 'Today, 08:00', interval: 1 },
    { id: 201, name: 'Apt 4A', property: 'City Center Suite', lastCleaned: '3 days ago', interval: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Rooms</h2>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-md">
          Add Room
        </button>
      </div>

      <div className="glass bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Property</th>
              <th className="p-4 font-semibold text-gray-600">Last Cleaned</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <BedDouble size={18} />
                    </div>
                    <span className="font-medium text-gray-800">{room.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{room.property}</td>
                <td className="p-4 text-gray-500 text-sm">{room.lastCleaned}</td>
                <td className="p-4 text-right">
                  <Link to={`/rooms/${room.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium px-3 py-1 rounded-md hover:bg-emerald-50 transition-colors">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
