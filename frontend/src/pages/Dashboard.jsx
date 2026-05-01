import React, { useState, useEffect } from 'react';
import { RefreshCcw, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { fetchProperties, fetchRooms } from '../lib/api';
import { useAssignments } from '../hooks/useAssignments';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLogsTab, setActiveLogsTab] = useState('today'); // 'today' or 'logs'
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
  const completedAssignments = assignments
    .filter(a => a.doneBy && a.doneAt)
    .sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt));

  const todaysCleanings = completedAssignments.filter(a => {
    const today = new Date().toLocaleDateString();
    return a.doneAt.includes(today) || a.date === 'Today';
  });

  const completedToday = todaysCleanings.length;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Today's Tasks Matrix */}
        <div className="card h-full flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 shrink-0">Today's Tasks Matrix</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span>OK</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span>Due</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span>Overdue</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>Immediate</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span>Cleaning</span></div>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto p-5 pb-8 items-start flex-1">
            {properties.map(p => (
              <div key={p.id} className="min-w-[180px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white shrink-0">
                <div className="bg-slate-50 p-3 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs text-center truncate">{p.name}</h4>
                </div>
                <div className="p-2 space-y-2">
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
                      <Link 
                        key={room.id} 
                        to={`/rooms/${room.id}`}
                        className={cn("block p-3 rounded-lg border text-center font-bold text-[11px] transition-transform hover:scale-105 cursor-pointer shadow-sm", getStatusStyle(status))}
                        title={`Status: ${status}`}
                      >
                        {room.name}
                      </Link>
                    );
                  })}
                  {rooms.filter(r => r.property_id === p.id).length === 0 && (
                    <p className="text-center text-slate-400 text-[10px] py-4 italic font-medium">No rooms</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed Activity Card */}
        <div className="card h-full flex flex-col min-h-[500px]">
          <div className="border-b border-slate-100 bg-slate-50/50 p-1 flex">
            <button
              onClick={() => setActiveLogsTab('today')}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                activeLogsTab === 'today' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Today's Cleanings
            </button>
            <button
              onClick={() => setActiveLogsTab('logs')}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                activeLogsTab === 'logs' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Recent Logs
            </button>
          </div>
          
          <div className="p-0 flex-1 overflow-y-auto max-h-[600px]">
            {activeLogsTab === 'today' ? (
              <div className="h-full">
                {todaysCleanings.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {todaysCleanings.map(a => (
                      <li key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <p className="font-bold text-slate-800">{a.room} <span className="text-slate-400 font-medium text-xs ml-1 uppercase tracking-wider">({a.property})</span></p>
                        <div className="flex items-center space-x-2 text-sm mt-1.5">
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">✓ Cleaned by {a.doneBy}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium text-xs">
                            {new Date(a.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-full opacity-60">
                    <CheckCircle size={40} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Nothing finished today yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                {completedAssignments.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {completedAssignments.slice(0, 50).map(a => (
                      <li key={a.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="font-bold text-slate-800">{a.room} <span className="text-slate-400 font-medium text-xs ml-1 uppercase tracking-wider">({a.property})</span></p>
                            <p className="text-xs text-slate-500 mt-1">
                              <span className="font-semibold text-slate-700">{a.doneBy}</span> completed cleaning
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg shrink-0">
                            {new Date(a.doneAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-full opacity-60">
                    <FileText size={40} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No activity history available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
