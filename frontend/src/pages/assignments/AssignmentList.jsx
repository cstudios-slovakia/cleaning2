import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import Slideout from '../../components/Slideout';
import AssignmentDetail from './AssignmentDetail';

export default function AssignmentList() {
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: true,
    today: true,
    tomorrow: false,
    future: false,
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  // Helper to get property data for the slideout
  const getPropertyData = (propertyName) => {
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const prop = properties.find(p => p.name === propertyName);
    if (prop) return prop;
    
    // Fallback defaults
    if (propertyName === 'Emerald Grand') return { theme: '#0ea5e9', coverImage: null };
    if (propertyName === 'City Center Suite') return { theme: '#10b981', coverImage: null };
    return { theme: '#0ea5e9', coverImage: null };
  };

  const isAssignmentDone = (id) => {
    const saved = localStorage.getItem(`emerald_assignment_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!parsed.doneBy;
    }
    return false;
  };

  const isPropertyArchived = (propertyName) => {
    const propertiesStr = localStorage.getItem('emerald_properties');
    if (!propertiesStr) return false;
    const properties = JSON.parse(propertiesStr);
    return !properties.find(p => p.name === propertyName);
  };

  const getDynamicAssignments = () => {
    const activeIds = JSON.parse(localStorage.getItem('emerald_active_assignment_ids') || '[]');
    return activeIds
      .map(id => JSON.parse(localStorage.getItem(`emerald_assignment_${id}`)))
      .filter(a => a && !isAssignmentDone(a.id) && !isPropertyArchived(a.property));
  };

  const isOverdue = (a) => {
    if (a.date === 'Today' || a.time?.includes('Today')) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const timeMatch = a.time?.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const scheduledMinutes = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
        return scheduledMinutes < currentMinutes;
      }
    }
    return a.date?.includes('Yesterday') || a.time?.includes('Yesterday');
  };

  const dynamicAssignments = getDynamicAssignments();
  
  const allStaticAssignments = [
    { id: 1, room: 'Lobby', property: 'Emerald Grand', time: 'Yesterday 14:00', date: 'Yesterday' },
    { id: 2, room: 'Apt 4A', property: 'City Center Suite', time: 'Today 08:00 (Immediate)', date: 'Today' },
    { id: 3, room: 'Room 101', property: 'Emerald Grand', time: '14:00', date: 'Today' },
    { id: 4, room: 'Room 102', property: 'Emerald Grand', time: '10:00', date: 'Tomorrow' },
    { id: 5, room: 'Apt 4B', property: 'City Center Suite', time: 'Friday 10:00', date: 'Friday' },
  ].filter(a => !isAssignmentDone(a.id) && !isPropertyArchived(a.property));

  const assignments = {
    overdue: [
      ...allStaticAssignments.filter(isOverdue),
      ...dynamicAssignments.filter(isOverdue)
    ],
    today: [
      ...allStaticAssignments.filter(a => a.date === 'Today' && !isOverdue(a)),
      ...dynamicAssignments.filter(a => a.date === 'Today' && !isOverdue(a))
    ],
    tomorrow: [
      ...allStaticAssignments.filter(a => a.date.includes('Tomorrow')),
      ...dynamicAssignments.filter(a => a.date.includes('Tomorrow'))
    ],
    future: [
      ...allStaticAssignments.filter(a => a.date !== 'Today' && !a.date.includes('Tomorrow') && a.date !== 'Yesterday' && !isOverdue(a)),
      ...dynamicAssignments.filter(a => a.date !== 'Today' && !a.date.includes('Tomorrow') && !isOverdue(a))
    ]
  };

  const GroupHeader = ({ id, title, count, colorClass, icon: Icon }) => (
    <button 
      onClick={() => toggleGroup(id)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
    >
      <div className="flex items-center space-x-3">
        {expandedGroups[id] ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
        <div className={cn("p-1.5 rounded-lg text-white", colorClass)}>
          <Icon size={16} />
        </div>
        <span className="font-bold text-slate-800">{title}</span>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cleaning Assignments</h2>
          <p className="text-sm text-slate-500 mt-1">Track and manage task completion.</p>
        </div>
      </div>

      <div className="card">
        {/* Overdue */}
        <GroupHeader id="overdue" title="Overdue" count={assignments.overdue.length} colorClass="bg-orange-500" icon={AlertTriangle} />
        {expandedGroups.overdue && (
          <div className="bg-orange-50/50 divide-y divide-slate-100">
            {assignments.overdue.map(a => (
              <button 
                key={a.id} 
                onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                className="w-full text-left block p-4 pl-12 hover:bg-orange-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900">{a.room}</p>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getPropertyData(a.property).theme}15`,
                        color: getPropertyData(a.property).theme,
                        borderColor: `${getPropertyData(a.property).theme}30`
                      }}
                    >
                      {a.property}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">{a.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Today */}
        <GroupHeader id="today" title="Today" count={assignments.today.length} colorClass="bg-blue-500" icon={Clock} />
        {expandedGroups.today && (
          <div className="bg-blue-50/50 divide-y divide-slate-100">
            {assignments.today.map(a => (
              <button 
                key={a.id} 
                onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                className="w-full text-left block p-4 pl-12 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900">{a.room}</p>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getPropertyData(a.property).theme}15`,
                        color: getPropertyData(a.property).theme,
                        borderColor: `${getPropertyData(a.property).theme}30`
                      }}
                    >
                      {a.property}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">{a.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tomorrow */}
        <GroupHeader id="tomorrow" title="Tomorrow" count={assignments.tomorrow.length} colorClass="bg-slate-400" icon={Clock} />
        {expandedGroups.tomorrow && (
          <div className="divide-y divide-slate-100">
            {assignments.tomorrow.map(a => (
              <button 
                key={a.id} 
                onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                className="w-full text-left block p-4 pl-12 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900">{a.room}</p>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getPropertyData(a.property).theme}15`,
                        color: getPropertyData(a.property).theme,
                        borderColor: `${getPropertyData(a.property).theme}30`
                      }}
                    >
                      {a.property}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">{a.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Future */}
        <GroupHeader id="future" title="Future" count={assignments.future.length} colorClass="bg-slate-300" icon={Clock} />
        {expandedGroups.future && (
          <div className="divide-y divide-slate-100">
            {assignments.future.map(a => (
              <button 
                key={a.id} 
                onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                className="w-full text-left block p-4 pl-12 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-slate-900">{a.room}</p>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${getPropertyData(a.property).theme}15`,
                        color: getPropertyData(a.property).theme,
                        borderColor: `${getPropertyData(a.property).theme}30`
                      }}
                    >
                      {a.property}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">{a.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Slideout 
        isOpen={isSlideoutOpen} 
        onClose={() => setIsSlideoutOpen(false)} 
        title="Cleaning Assignment"
        width="max-w-2xl"
      >
        {selectedAssignment && (
          <AssignmentDetail 
            assignmentId={selectedAssignment.id} 
            isSlideout={true} 
            theme={getPropertyData(selectedAssignment.property).theme}
            coverImage={getPropertyData(selectedAssignment.property).coverImage}
          />
        )}
      </Slideout>
    </div>
  );
}
