import React, { useState, useEffect } from 'react';
import { RefreshCcw, FileText, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, parseDateString } from '../lib/utils';
import { fetchProperties, fetchRooms, saveAssignment } from '../lib/api';
import { useAssignments } from '../hooks/useAssignments';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLogsTab, setActiveLogsTab] = useState('today'); // 'today' or 'logs'
  const { assignments } = useAssignments();
  const { user } = useAuth();

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

  const getAssignmentStatus = (a) => {
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
        if (scheduledMinutes < currentMinutes) return 'overdue';
      }
      return 'due';
    } else if (a.date?.includes('Yesterday') || a.time?.includes('Yesterday')) {
      return 'overdue';
    }
    return 'ok';
  };

  const handleExpressClean = async (e, propertyName, roomName) => {
    e.preventDefault();
    e.stopPropagation();
    
    const targetAssignment = activeAssignments.find(a => a.room === roomName && a.property === propertyName);
    
    if (!targetAssignment) {
      return;
    }

    if (!confirm(`Express Clean: Mark ${roomName} as finished?`)) return;

    try {
      const now = new Date();
      const updatedAssignment = {
        ...targetAssignment,
        doneBy: user?.name || 'Quick Clean',
        doneAt: now.toISOString(),
        tasks: targetAssignment.tasks?.map(t => ({ ...t, done: true })) || []
      };
      
      await saveAssignment(updatedAssignment);
      loadData();
    } catch (err) {
      console.error("Express clean failed", err);
    }
  };

  const activeAssignments = assignments.filter(a => !a.doneBy);
  
  const pendingTodayOrOverdue = activeAssignments.filter(a => {
    const status = getAssignmentStatus(a);
    return status === 'due' || status === 'overdue';
  });

  // Compute stats
  const activeAssignmentsCount = activeAssignments.length;
  const completedAssignments = assignments
    .filter(a => a.doneBy && a.doneAt)
    .sort((a, b) => parseDateString(b.doneAt) - parseDateString(a.doneAt));

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
                      const aStatus = getAssignmentStatus(a);
                      if (aStatus === 'overdue') {
                        status = 'overdue';
                        break;
                      }
                      if (aStatus === 'due') status = 'due';
                    }

                    return (
                      <div key={room.id} className="relative group/item">
                        <Link 
                          to={`/rooms/${room.id}`}
                          className={cn(
                            "block p-3 rounded-lg border text-center font-bold text-[11px] transition-all hover:translate-y-[-2px] cursor-pointer shadow-sm pr-8", 
                            getStatusStyle(status)
                          )}
                          title={`Status: ${status}`}
                        >
                          {room.name}
                        </Link>
                        {status !== 'ok' && (
                          <button
                            onClick={(e) => handleExpressClean(e, p.name, room.name)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors opacity-0 group-hover/item:opacity-100"
                            title="Express Clean"
                          >
                            <Zap size={12} fill="currentColor" />
                          </button>
                        )}
                      </div>
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
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex bg-slate-200/50 p-1 rounded-xl w-full">
              <button
                onClick={() => setActiveLogsTab('today')}
                className={cn(
                  "flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all",
                  activeLogsTab === 'today' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                )}
              >
                Pending Today
              </button>
              <button
                onClick={() => setActiveLogsTab('logs')}
                className={cn(
                  "flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all",
                  activeLogsTab === 'logs' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                )}
              >
                Recent Logs
              </button>
            </div>
          </div>
          
          <div className="p-0 flex-1 overflow-y-auto max-h-[600px]">
            {activeLogsTab === 'today' ? (
              <div className="h-full p-4">
                {pendingTodayOrOverdue.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTodayOrOverdue.map((a) => {
                      const status = getAssignmentStatus(a);
                      return (
                        <Link key={a.id} to={`/assignments/${a.id}`} className="block p-4 bg-white border border-slate-100 hover:border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {a.room} <span className="text-slate-400 font-medium text-[10px] ml-1 uppercase tracking-wider">({a.property})</span>
                              </p>
                              <div className="flex items-center space-x-2 mt-1.5">
                                {status === 'overdue' ? (
                                  <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-md uppercase tracking-wider">Overdue</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-md uppercase tracking-wider">Due Today</span>
                                )}
                                <span className="text-xs text-slate-500 font-medium flex items-center">
                                  <div className="w-1 h-1 rounded-full bg-slate-300 mx-1.5"></div>
                                  {a.time}
                                </span>
                              </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center h-full opacity-60">
                    <CheckCircle size={40} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No pending tasks today</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full">
                {completedAssignments.length > 0 ? (
                  <div className="px-6 py-6 space-y-6">
                    {completedAssignments.slice(0, 50).map((a, i) => (
                      <div key={a.id} className="relative pl-6">
                        {i !== Math.min(completedAssignments.length, 50) - 1 && (
                          <div className="absolute left-2 top-6 bottom-[-24px] w-0.5 bg-slate-100"></div>
                        )}
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm"></div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {a.room} <span className="text-slate-400 font-medium text-[10px] ml-1 uppercase tracking-wider">({a.property})</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-700">{a.doneBy}</span> completed cleaning
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">
                            {parseDateString(a.doneAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {parseDateString(a.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
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
