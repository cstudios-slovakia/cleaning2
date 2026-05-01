import React, { useState, useEffect } from 'react';
import { RefreshCcw, FileText, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchProperties, fetchRooms } from '../lib/api';
import { useAssignments } from '../hooks/useAssignments';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { assignments } = useAssignments();

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await fetchProperties();
      const r = await fetchRooms();
      setProperties(p);
      setRooms(r);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ok': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'due': return 'bg-blue-500 text-white border-blue-600 shadow-blue-500/30 shadow-sm';
      case 'overdue': return 'bg-orange-500 text-white border-orange-600 shadow-orange-500/30 shadow-sm';
      case 'immediate': return 'bg-red-500 text-white border-red-600 shadow-red-500/30 shadow-sm';
      case 'cleaning': return 'bg-purple-500 text-white border-purple-600 shadow-purple-500/30 shadow-sm';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  // Compute stats
  const activeAssignments = assignments.filter(a => !a.doneBy);
  const completedToday = assignments.filter(a => {
    if (!a.doneBy || !a.doneAt) return false;
    const today = new Date().toLocaleDateString();
    return a.doneAt.includes(today) || a.date === 'Today'; // Simple check
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">System Landscape</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Key performance indicators and status.</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md relative overflow-hidden">
          <FileText size={120} className="absolute -right-6 -bottom-6 text-white/10" />
          <p className="text-blue-100 font-semibold text-sm tracking-wider uppercase mb-2">Assignments Due</p>
          <h3 className="text-4xl font-extrabold mb-1">{activeAssignments.length}</h3>
          <p className="text-sm text-blue-100">Across {properties.length} properties</p>
        </div>
        
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md relative overflow-hidden">
          <CheckCircle size={120} className="absolute -right-6 -bottom-6 text-white/10" />
          <p className="text-emerald-100 font-semibold text-sm tracking-wider uppercase mb-2">Completed Today</p>
          <h3 className="text-4xl font-extrabold mb-1">{completedToday}</h3>
          <p className="text-sm text-emerald-100">Across all teams</p>
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
        <div className="flex gap-6 overflow-x-auto p-5 pb-8 items-start">
          {properties.map(p => (
            <div key={p.id} className="flex-1 min-w-[240px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white shrink-0">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-800 text-center">{p.name}</h4>
              </div>
              <div className="p-3 space-y-3">
                {rooms.filter(r => r.property_id === p.id).map(room => {
                  const roomAssignments = activeAssignments.filter(a => a.room === room.name && a.property === p.name);
                  
                  let status = 'ok';
                  for (const a of roomAssignments) {
                    let isOverdue = false;
                    if (a.date === 'Today' || a.time?.includes('Today')) {
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const timeMatch = a.time?.match(/(\d{1,2}):(\d{2})/);
                      if (timeMatch) {
                        const isPM = a.time.toLowerCase().includes('pm');
                        let hours = parseInt(timeMatch[1]);
                        if (isPM && hours !== 12) hours += 12;
                        if (!isPM && hours === 12) hours = 0;
                        const scheduledMinutes = hours * 60 + parseInt(timeMatch[2]);
                        if (scheduledMinutes < currentMinutes) isOverdue = true;
                      }
                    } else if (a.date?.includes('Yesterday') || a.time?.includes('Yesterday')) {
                      isOverdue = true;
                    }
                    
                    if (isOverdue) {
                      status = 'overdue';
                      break;
                    }
                    if (a.date === 'Today') status = 'due';
                  }

                  return (
                    <div 
                      key={room.id} 
                      className={cn("p-4 rounded-xl border text-center font-bold text-sm transition-transform hover:scale-105 cursor-pointer shadow-sm", getStatusStyle(status))}
                      title={`Status: ${status}`}
                    >
                      {room.name}
                    </div>
                  );
                })}
                {rooms.filter(r => r.property_id === p.id).length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-6 italic">No rooms added</p>
                )}
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="w-full text-center text-slate-500 py-8 italic">
              No properties available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
