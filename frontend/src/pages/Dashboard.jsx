import React from 'react';
import { RefreshCcw, FileText, CheckCircle } from 'lucide-react';

const mockProperties = [
  { id: 1, name: 'Grand Hotel' },
  { id: 2, name: 'City Center' },
  { id: 3, name: 'Riverside' }
];

const mockRooms = [
  { id: 101, propId: 1, name: 'Room 101', status: 'ok' },
  { id: 102, propId: 1, name: 'Room 102', status: 'due' },
  { id: 103, propId: 1, name: 'Lobby', status: 'overdue' },
  { id: 201, propId: 2, name: 'Apt 4A', status: 'immediate' },
  { id: 202, propId: 2, name: 'Apt 4B', status: 'cleaning' },
  { id: 301, propId: 3, name: 'Suite 1', status: 'ok' },
];

export default function Dashboard() {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'ok': return 'bg-slate-100 text-slate-400';
      case 'due': return 'bg-blue-100 text-blue-600 border-blue-200 border';
      case 'overdue': return 'bg-orange-100 text-orange-600 border-orange-200 border';
      case 'immediate': return 'bg-red-100 text-red-600 border-red-200 border';
      case 'cleaning': return 'bg-purple-100 text-purple-600 border-purple-200 border';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Key performance indicators and status.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
          <RefreshCcw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md relative overflow-hidden">
          <FileText size={120} className="absolute -right-6 -bottom-6 text-white/10" />
          <p className="text-blue-100 font-semibold text-sm tracking-wider uppercase mb-2">Assignments Due</p>
          <h3 className="text-4xl font-extrabold mb-1">24</h3>
          <p className="text-sm text-blue-100">8 overdue across properties</p>
        </div>
        
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md relative overflow-hidden">
          <CheckCircle size={120} className="absolute -right-6 -bottom-6 text-white/10" />
          <p className="text-emerald-100 font-semibold text-sm tracking-wider uppercase mb-2">Completed Today</p>
          <h3 className="text-4xl font-extrabold mb-1">17</h3>
          <p className="text-sm text-emerald-100">92% completion rate</p>
        </div>

        <div className="card p-6 flex flex-col justify-center">
          <h3 className="text-slate-800 font-bold mb-4">Legend</h3>
          <div className="grid grid-cols-2 gap-3 text-sm font-medium text-slate-600">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span>OK</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span>Due</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>Overdue</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Immediate</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span>Cleaning</span></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Property Status Matrix</h3>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="pb-4 font-semibold text-slate-500 text-sm w-1/4 uppercase tracking-wider">Room</th>
                {mockProperties.map(p => (
                  <th key={p.id} className="pb-4 font-semibold text-slate-700 text-center">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockRooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{room.name}</td>
                  {mockProperties.map(p => (
                    <td key={p.id} className="py-4 text-center">
                      {room.propId === p.id ? (
                        <div 
                          className={cn("w-10 h-10 mx-auto rounded-xl shadow-sm transition-transform hover:scale-105 cursor-pointer flex items-center justify-center font-bold text-xs", getStatusStyle(room.status))}
                          title={`Status: ${room.status}`}
                        >
                          {room.status === 'ok' && '✓'}
                        </div>
                      ) : (
                        <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 border border-slate-100"></div>
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
