import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(() => {
    const saved = localStorage.getItem(`emerald_assignment_${id}`);
    if (saved) return JSON.parse(saved);
    
    return {
      id: id,
      property: 'Emerald Grand',
      room: 'Room 101',
      date: 'Today',
      time: '14:00',
      doneBy: null,
      doneAt: null,
      tasks: [
        { id: 1, title: 'Make bed', done: false },
        { id: 2, title: 'Clean bathroom', done: false },
        { id: 3, title: 'Vacuum floors', done: false },
        { id: 4, title: 'Empty trash', done: false },
      ]
    };
  });

  // if the done by value is set, only admins, owners and managers can edit the assigment
  const canEdit = !assignment.doneBy || (user && ['admin', 'owner', 'manager'].includes(user.role));

  const toggleTask = (taskId) => {
    if (!canEdit) return;

    const newTasks = assignment.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    const newAssignment = { ...assignment, tasks: newTasks };
    setAssignment(newAssignment);
    localStorage.setItem(`emerald_assignment_${id}`, JSON.stringify(newAssignment));
  };

  const handleFinish = () => {
    if (!canEdit) return;
    
    const now = new Date();
    const doneAt = now.toLocaleString();
    
    const newAssignment = { 
      ...assignment, 
      doneBy: user.name,
      doneAt: doneAt
    };
    
    setAssignment(newAssignment);
    localStorage.setItem(`emerald_assignment_${id}`, JSON.stringify(newAssignment));
  };

  const isAllDone = assignment.tasks.every(t => t.done);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      <div className="flex items-center space-x-4 mb-4">
        <Link to="/properties/1" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cleaning Assignment</h2>
          <p className="text-sm text-slate-500">Task details and status.</p>
        </div>
      </div>

      <div className="card p-6 md:p-8 space-y-8">
        <div className="text-center space-y-2 border-b border-slate-100 pb-8">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{assignment.property}</p>
          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{assignment.room}</h3>
          
          <div className="flex flex-col items-center mt-4 space-y-3">
            <div className="inline-block bg-primary-50 border border-primary-200 text-primary-700 px-3 py-1 rounded-full text-sm font-bold">
              Scheduled: {assignment.date} {assignment.time}
            </div>
            
            {assignment.doneBy && (
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                <Check size={16} />
                <span>Completed by <b>{assignment.doneBy}</b> at {assignment.doneAt}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-lg">Task List</h4>
          <div className="space-y-3">
            {assignment.tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                disabled={!canEdit}
                className={cn(
                  "w-full flex items-center space-x-4 p-4 rounded-xl border transition-all text-left",
                  task.done 
                    ? "bg-green-50/50 border-green-200" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm",
                  !canEdit && "opacity-70 cursor-not-allowed"
                )}
              >
                {task.done ? (
                  <CheckCircle size={24} className="text-green-500 shrink-0" />
                ) : (
                  <Circle size={24} className="text-slate-300 shrink-0" />
                )}
                <span className={cn(
                  "font-medium text-lg transition-colors",
                  task.done ? "text-slate-400 line-through" : "text-slate-700"
                )}>
                  {task.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar for the finish button */}
      {canEdit && !assignment.doneBy && (
        <div className="fixed bottom-0 left-0 right-0 md:left-20 lg:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
          <div className="max-w-2xl mx-auto flex justify-end">
            <button 
              onClick={handleFinish}
              className={cn(
                "w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white shadow-sm transition-all bg-primary-600 hover:bg-primary-700"
              )}
            >
              Finish Cleaning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
