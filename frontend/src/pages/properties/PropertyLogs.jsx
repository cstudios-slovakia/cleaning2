import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, Users, Settings, AlertTriangle, History } from 'lucide-react';

export default function PropertyLogs() {
  const { id } = useParams();
  
  // Basic mock property data
  const property = {
    id,
    name: id === '1' ? 'Emerald Grand' : 'City Center Suite',
    theme: id === '1' ? '#0ea5e9' : '#10b981'
  };

  // Using a simple date input for calendar selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock logs
  const logs = [
    { id: 1, date: 'Today', time: '10:15 AM', action: 'Lobby cleaning started', user: 'Maria Garcia', type: 'start' },
    { id: 2, date: 'Today', time: '09:45 AM', action: 'Room 101 inspection passed', user: 'John Doe', type: 'check' },
    { id: 3, date: 'Today', time: '08:30 AM', action: 'New schedule generated', user: 'System', type: 'system' },
    { id: 4, date: 'Yesterday', time: '16:00 PM', action: 'All cleanings completed', user: 'System', type: 'complete' },
    { id: 5, date: 'Yesterday', time: '14:30 PM', action: 'Room 102 cleaning finished', user: 'Anna Novak', type: 'complete' },
    { id: 6, date: 'Yesterday', time: '09:00 AM', action: 'Cleaning staff checked in', user: 'Maria Garcia, Anna Novak', type: 'login' },
    { id: 7, date: 'Oct 24', time: '11:20 AM', action: 'Room 105 maintenance requested', user: 'John Doe', type: 'alert' },
    { id: 8, date: 'Oct 24', time: '10:00 AM', action: 'Schedule updated', user: 'Sarah Smith', type: 'system' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Property Logs</h2>
            <p className="text-sm text-slate-500">{property.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <CalendarIcon size={18} className="text-slate-400 ml-2" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none focus:ring-0 text-sm font-medium text-slate-700 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2 border-b border-slate-100 pb-4">
          <History size={18} className="text-slate-400" />
          <span>Latest 30 Logs from {selectedDate}</span>
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {log.type === 'start' && <Clock size={16} className="text-blue-500" />}
                {log.type === 'check' && <CheckCircle size={16} className="text-emerald-500" />}
                {log.type === 'complete' && <CheckCircle size={16} className="text-emerald-500" />}
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
          ))}
        </div>
      </div>
    </div>
  );
}
