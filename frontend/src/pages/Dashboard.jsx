import React from 'react';

const mockProperties = [
  { id: 1, name: 'Emerald Grand' },
  { id: 2, name: 'City Center Suite' }
];

const mockRooms = [
  { id: 101, propId: 1, name: 'Room 101', status: 'ok' },
  { id: 102, propId: 1, name: 'Room 102', status: 'due' },
  { id: 103, propId: 1, name: 'Lobby', status: 'overdue' },
  { id: 201, propId: 2, name: 'Apt 4A', status: 'immediate' },
  { id: 202, propId: 2, name: 'Apt 4B', status: 'cleaning' },
];

export default function Dashboard() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'bg-gray-300'; // grey
      case 'due': return 'bg-blue-400'; // blue
      case 'overdue': return 'bg-orange-400'; // orange
      case 'immediate': return 'bg-red-500'; // red
      case 'cleaning': return 'bg-purple-400'; // purple
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Dashboard</h2>
        <div className="flex space-x-2 text-xs">
          <div className="flex items-center"><span className="w-3 h-3 bg-gray-300 inline-block mr-1 rounded-sm"></span> OK</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-400 inline-block mr-1 rounded-sm"></span> Due</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-orange-400 inline-block mr-1 rounded-sm"></span> Overdue</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-red-500 inline-block mr-1 rounded-sm"></span> Immediate</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-purple-400 inline-block mr-1 rounded-sm"></span> Cleaning</div>
        </div>
      </div>

      <div className="glass bg-white p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 border-b font-medium text-gray-500 w-1/4">Room / Property</th>
                {mockProperties.map(p => (
                  <th key={p.id} className="p-3 border-b font-semibold text-gray-700 text-center">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockRooms.map(room => (
                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b font-medium">{room.name}</td>
                  {mockProperties.map(p => (
                    <td key={p.id} className="p-3 border-b text-center">
                      {room.propId === p.id ? (
                        <div 
                          className={`w-10 h-10 mx-auto rounded-xl shadow-sm ${getStatusColor(room.status)} transition-transform hover:scale-110 cursor-pointer`}
                          title={`Status: ${room.status}`}
                        ></div>
                      ) : (
                        <div className="w-10 h-10 mx-auto rounded-xl bg-gray-100 opacity-50"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
