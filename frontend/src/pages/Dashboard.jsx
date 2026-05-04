import React, { useState, useEffect } from 'react';
import { RefreshCcw, FileText, CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, parseDateString, isToday, isYesterday } from '../lib/utils';
import { fetchProperties, fetchRooms, saveAssignment, fetchRoomDetails } from '../lib/api';
import { useAssignments } from '../hooks/useAssignments';
import Slideout from '../components/Slideout';
import AssignmentDetail from './assignments/AssignmentDetail';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLogsTab, setActiveLogsTab] = useState('today'); // 'today' or 'logs'
  const [slideoutAssignment, setSlideoutAssignment] = useState(null);
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
    if (!a) return 'ok';
    if (isToday(a.date)) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const timeMatch = String(a.time || '').match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const isPM = String(a.time || '').toLowerCase().includes('pm');
        let hours = parseInt(timeMatch[1]);
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        const scheduledMinutes = hours * 60 + parseInt(timeMatch[2]);
        if (scheduledMinutes < currentMinutes) return 'overdue';
      }
      return 'due';
    } else if (isYesterday(a.date)) {
      return 'overdue';
    }
    return 'ok';
  };

  const handleCreateImmediateAssignment = async (e, property, room) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Create immediate cleaning assignment for ${room.name}?`)) return;

    try {
      setLoading(true);
      // 1. Fetch room tasks
      const roomData = await fetchRoomDetails(room.id); 
      const tasks = roomData?.tasks || [];

      // 2. Create new immediate assignment
      const newAssignment = {
        id: Date.now().toString(),
        property: property.name,
        room: room.name,
        date: 'Today',
        time: 'Immediate',
        doneBy: null,
        doneAt: null,
        tasks: tasks.length > 0 
          ? tasks.map(t => ({ title: t.title, done: false }))
          : [{ title: 'The room is cleaned', done: false }]
      };
      
      await saveAssignment(newAssignment);
      loadData();
    } catch (err) {
      console.error("Failed to create assignment", err);
      alert("Failed to create immediate assignment.");
    } finally {
      setLoading(false);
    }
  };

  const activeAssignments = (assignments || []).filter(a => !a.doneBy);
  
  const pendingTodayOrOverdue = activeAssignments.filter(a => {
    const status = getAssignmentStatus(a);
    return status === 'due' || status === 'overdue';
  });

  // Compute stats
  const activeAssignmentsCount = activeAssignments.length;
  const completedAssignments = (assignments || [])
    .filter(a => a.doneBy && a.doneAt)
    .sort((a, b) => parseDateString(b.doneAt) - parseDateString(a.doneAt));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">{t('dashboard.title')}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.subtitle')}</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Today's Tasks Matrix */}
        <div className="card h-full flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-800 shrink-0">{t('dashboard.tasks_matrix')}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span>{t('dashboard.status.ok')}</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span>{t('dashboard.status.due')}</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span>{t('dashboard.status.overdue')}</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>{t('dashboard.status.immediate')}</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span>{t('dashboard.status.cleaning')}</span></div>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto p-5 pb-8 items-start flex-1">
            {(properties || []).map(p => (
              <div key={p.id} className="min-w-[180px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white shrink-0">
                <div className="bg-slate-50 p-3 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs text-center truncate">{p.name}</h4>
                </div>
                <div className="p-2 space-y-2">
                  {(rooms || []).filter(r => r.property_id === p.id).map(room => {
                    const roomAssignments = (assignments || []).filter(a => !a.doneBy && a.room === room.name && a.property === p.name);
                    
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
                          <button
                            onClick={(e) => handleCreateImmediateAssignment(e, p, room)}
                            className={cn(
                              "absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all opacity-0 group-hover/item:opacity-100",
                              status === 'ok' ? "bg-slate-200 hover:bg-slate-300 text-slate-600" : "bg-white/20 hover:bg-white/40 text-white"
                            )}
                            title="Create Immediate Assignment"
                          >
                            <Zap size={10} fill="currentColor" />
                          </button>
                      </div>
                    );
                  })}
                  {rooms.filter(r => r.property_id === p.id).length === 0 && (
                    <p className="text-center text-slate-400 text-[10px] py-4 italic font-medium">{t('dashboard.no_rooms')}</p>
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
                {t('dashboard.pending_today_tab')}
              </button>
              <button
                onClick={() => setActiveLogsTab('logs')}
                className={cn(
                  "flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-lg transition-all",
                  activeLogsTab === 'logs' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                )}
              >
                {t('dashboard.recent_logs_tab')}
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
                                  <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-md uppercase tracking-wider">{t('dashboard.badge_overdue')}</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-md uppercase tracking-wider">{t('dashboard.badge_due_today')}</span>
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
                    {completedAssignments.slice(0, 50).map((a, i) => {
                      const isAllDone = !a.tasks || a.tasks.every(t => t.done);
                      const dotColor = a.problemReported ? 'bg-red-500' : (!isAllDone ? 'bg-orange-500' : 'bg-green-500');
                      const totalTasks = Math.max(1, (a.tasks || []).length);
                      const doneTasks = (a.tasks || []).filter(t => t.done).length;
                      const percent = Math.round((doneTasks / totalTasks) * 100);
                      
                      return (
                      <button 
                        key={a.id} 
                        className="relative pl-6 block w-full text-left group hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors"
                        onClick={() => setSlideoutAssignment(a)}
                      >
                        {i !== Math.min(completedAssignments.length, 50) - 1 && (
                          <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-100"></div>
                        )}
                        <div className={`absolute left-2.5 top-3.5 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white ${dotColor} shadow-sm z-10`}></div>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="w-full">
                            <p className={cn("font-bold text-sm", a.problemReported ? "text-red-600" : "text-slate-800")}>
                              {a.room} <span className="text-slate-400 font-medium text-[10px] ml-1 uppercase tracking-wider">({a.property})</span>
                            </p>
                            <div className="flex justify-between items-center mt-0.5">
                              <p className="text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">{a.doneBy}</span> completed cleaning
                              </p>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">
                                {parseDateString(a.doneAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                                {parseDateString(a.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            {/* Percentual Bar */}
                            <div className="mt-2.5 flex items-center space-x-3 w-full">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all duration-500", 
                                    a.problemReported ? "bg-red-500" : (percent === 100 ? "bg-green-500" : "bg-orange-500")
                                  )}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <span className="text-[9px] font-extrabold text-slate-400 w-8 text-right">{percent}%</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )})}
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
      {slideoutAssignment && (
        <Slideout
          isOpen={!!slideoutAssignment}
          onClose={() => setSlideoutAssignment(null)}
          title={slideoutAssignment.room}
        >
          <AssignmentDetail
            assignmentId={slideoutAssignment.id}
            isSlideout={true}
            theme={properties.find(p => p.name === slideoutAssignment.property)?.theme || '#0ea5e9'}
            coverImage={properties.find(p => p.name === slideoutAssignment.property)?.coverImage}
            onClose={() => setSlideoutAssignment(null)}
          />
        </Slideout>
      )}
    </div>
  );
}
