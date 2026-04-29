import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

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

  const assignments = {
    overdue: [
      { id: 1, room: 'Lobby', property: 'Emerald Grand', time: 'Yesterday 14:00' },
      { id: 2, room: 'Apt 4A', property: 'City Center Suite', time: 'Today 08:00 (Immediate)' },
    ],
    today: [
      { id: 3, room: 'Room 101', property: 'Emerald Grand', time: '14:00' },
    ],
    tomorrow: [
      { id: 4, room: 'Room 102', property: 'Emerald Grand', time: '10:00' },
    ],
    future: [
      { id: 5, room: 'Apt 4B', property: 'City Center Suite', time: 'Friday 10:00' },
    ]
  };

  const GroupHeader = ({ id, title, count, color, icon: Icon }) => (
    <button 
      onClick={() => toggleGroup(id)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
    >
      <div className="flex items-center space-x-3">
        {expandedGroups[id] ? <ChevronDown size={20} className="text-gray-400"/> : <ChevronRight size={20} className="text-gray-400"/>}
        <div className={cn("p-1.5 rounded-lg text-white", color)}>
          <Icon size={18} />
        </div>
        <span className="font-bold text-gray-800">{title}</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Cleaning Assignments</h2>
      </div>

      <div className="glass bg-white rounded-3xl overflow-hidden shadow-sm">
        {/* Overdue */}
        <GroupHeader id="overdue" title="Overdue" count={assignments.overdue.length} color="bg-orange-500" icon={AlertTriangle} />
        {expandedGroups.overdue && (
          <div className="bg-orange-50/30 divide-y divide-gray-100/50">
            {assignments.overdue.map(a => (
              <Link key={a.id} to={`/assignments/${a.id}`} className="block p-4 pl-12 hover:bg-orange-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{a.room}</p>
                    <p className="text-sm text-gray-500">{a.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">{a.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Today */}
        <GroupHeader id="today" title="Today" count={assignments.today.length} color="bg-blue-500" icon={Clock} />
        {expandedGroups.today && (
          <div className="bg-blue-50/30 divide-y divide-gray-100/50">
            {assignments.today.map(a => (
              <Link key={a.id} to={`/assignments/${a.id}`} className="block p-4 pl-12 hover:bg-blue-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{a.room}</p>
                    <p className="text-sm text-gray-500">{a.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{a.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tomorrow */}
        <GroupHeader id="tomorrow" title="Tomorrow" count={assignments.tomorrow.length} color="bg-gray-400" icon={Clock} />
        {expandedGroups.tomorrow && (
          <div className="bg-gray-50/50 divide-y divide-gray-100/50">
            {assignments.tomorrow.map(a => (
              <Link key={a.id} to={`/assignments/${a.id}`} className="block p-4 pl-12 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{a.room}</p>
                    <p className="text-sm text-gray-500">{a.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">{a.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Future */}
        <GroupHeader id="future" title="Future" count={assignments.future.length} color="bg-gray-300" icon={Clock} />
        {expandedGroups.future && (
          <div className="bg-gray-50/50 divide-y divide-gray-100/50">
            {assignments.future.map(a => (
              <Link key={a.id} to={`/assignments/${a.id}`} className="block p-4 pl-12 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{a.room}</p>
                    <p className="text-sm text-gray-500">{a.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">{a.time}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
