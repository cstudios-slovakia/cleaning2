import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, Users, Settings, AlertTriangle, History } from 'lucide-react';
import { useAssignments } from '../../hooks/useAssignments';

export default function PropertyLogs() {
  const { id } = useParams();
  const [property, setProperty] = useState({ id, name: 'Loading...', theme: '#0ea5e9' });

  useEffect(() => {
    const loadProp = async () => {
      try {
        const { fetchProperties } = await import('../../lib/api');
        const properties = await fetchProperties();
        const p = properties.find(p => p.id.toString() === id.toString());
        if (p) setProperty(p);
      } catch (e) {
        console.error('Failed to load property', e);
        setProperty({ id, name: 'Unknown Property', theme: '#0ea5e9' });
      }
    };
    loadProp();
  }, [id]);

  // Using a simple date input for calendar selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load real logs from assignments API
  const { assignments } = useAssignments();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const allLogs = [];
    
    assignments.forEach(a => {
      // Filter by property name and ensure it's completed
      if (a.property === property.name && a.doneBy) {
        allLogs.push({
          id: a.id,
          date: a.doneAt ? a.doneAt.split(',')[0] : '',
          time: a.doneAt && a.doneAt.includes(',') ? a.doneAt.split(',')[1].trim() : '',
          action: `${a.room} cleaning completed`,
          user: a.doneBy,
          type: 'complete'
        });
      }
    });
    
    // Sort by date/time descending
    allLogs.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    setLogs(allLogs);
  }, [property.name, selectedDate, assignments]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tighter">Property Logs</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{property.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <CalendarIcon size={18} className="text-slate-400 ml-2" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus:ring-0 text-sm font-bold text-slate-700 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
          <History size={18} className="text-slate-400" />
          <span>Cleaning History: {property.name}</span>
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <History size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No cleaning logs found for this property.</p>
            </div>
          ) : (
            logs.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {log.type === 'start' && <Clock size={16} className="text-blue-500" />}
                {log.type === 'check' && <CheckCircle size={16} className="text-green-500" />}
                {log.type === 'complete' && <CheckCircle size={16} className="text-green-500" />}
                {log.type === 'system' && <Settings size={16} className="text-slate-500" />}
                {log.type === 'login' && <Users size={16} className="text-purple-500" />}
                {log.type === 'alert' && <AlertTriangle size={16} className="text-orange-500" />}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {log.date} {log.time}
                  </span>
                </div>
                <p className="text-sm text-slate-600">By {log.user}</p>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
