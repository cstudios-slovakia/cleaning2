import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AssignmentDetail() {
  const { id } = useParams();
  
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
      <div className="flex items-center space-x-4 mb-4">
        <Link to="/assignments" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assignment View</h2>
          <p className="text-sm text-slate-500">Check off tasks to complete.</p>
        </div>
      </div>

      <div className="card p-6 md:p-8 space-y-8">
        <div className="text-center space-y-2 border-b border-slate-100 pb-8">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Emerald Grand</p>
          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">Room 101</h3>
          <div className="inline-block bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mt-3">
            Overdue: Yesterday 14:00
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-lg">Task List</h4>
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full flex items-center space-x-4 p-4 rounded-xl border transition-all text-left",
                  task.done 
                    ? "bg-green-50/50 border-green-200" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
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
      <div className="fixed bottom-0 left-0 right-0 md:left-20 lg:left-64 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button 
            className={cn(
              "w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white shadow-sm transition-all",
              isAllDone 
                ? "bg-primary-600 hover:bg-primary-700" 
                : "bg-slate-300 cursor-not-allowed"
            )}
            disabled={!isAllDone}
          >
            Mark as Finished
          </button>
        </div>
      </div>
    </div>
  );
}
