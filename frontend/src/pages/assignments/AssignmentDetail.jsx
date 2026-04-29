import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Make bed', done: false },
    { id: 2, title: 'Clean bathroom', done: true },
    { id: 3, title: 'Vacuum floors', done: false },
    { id: 4, title: 'Empty trash', done: false },
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const isAllDone = tasks.every(t => t.done);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      <div className="flex items-center space-x-4">
        <Link to="/assignments" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Assignment Details</h2>
      </div>

      <div className="glass bg-white p-6 rounded-3xl space-y-6">
        <div className="text-center space-y-2 border-b border-gray-100 pb-6">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm">Emerald Grand</p>
          <h3 className="text-4xl font-bold text-gray-900">Room 101</h3>
          <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold mt-2">
            Overdue: Yesterday 14:00
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-gray-700 text-lg px-2">Task List</h4>
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all text-left",
                  task.done 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                )}
              >
                {task.done ? (
                  <CheckCircle size={24} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0"></div>
                )}
                <span className={cn(
                  "font-medium text-lg transition-colors",
                  task.done ? "text-emerald-700 line-through opacity-70" : "text-gray-700"
                )}>
                  {task.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar for the finish button */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 glass bg-white/90 border-t border-gray-200 z-10">
        <div className="max-w-2xl mx-auto">
          <button 
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all",
              isAllDone 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
          >
            Mark Assignment as Finished
          </button>
        </div>
      </div>
    </div>
  );
}
