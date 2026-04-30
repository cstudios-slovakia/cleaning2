import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAssignments, saveAssignment } from '../../lib/api';

export default function AssignmentDetail({ assignmentId: propId, isSlideout = false, theme: propTheme, coverImage: propCoverImage }) {
  const { id: routeId } = useParams();
  const id = propId || routeId;
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAssignments();
        const a = data.find(x => x.id.toString() === id.toString());
        if (a) {
          // Merge to avoid overriding local optimistic state randomly if possible,
          // but for simple real-time, just set it.
          setAssignment(a);
        }
        setLoading(false);
      } catch (e) {
        console.error('Failed to fetch assignment details', e);
      }
    };
    load();
    const interval = setInterval(load, 3000); // 3 second polling
    return () => clearInterval(interval);
  }, [id]);

  const themeColor = propTheme || '#0ea5e9';

  const canEdit = assignment && (!assignment.doneBy || (user && ['admin', 'owner', 'manager'].includes(user.role)));

  const toggleTask = async (taskId) => {
    if (!canEdit) return;

    const newTasks = assignment.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    const newAssignment = { ...assignment, tasks: newTasks };
    
    // Optimistic update
    setAssignment(newAssignment);
    
    // Save to DB
    try {
      await saveAssignment(newAssignment);
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const handleFinish = async () => {
    if (!canEdit) return;
    
    const now = new Date();
    const doneAt = now.toLocaleString();
    
    const newAssignment = { 
      ...assignment, 
      doneBy: user?.name || 'User',
      doneAt: doneAt
    };
    
    setAssignment(newAssignment);
    try {
      await saveAssignment(newAssignment);
    } catch (e) {
      console.error('Finish failed', e);
    }
  };

  if (loading || !assignment) return <div className="p-8 text-center text-slate-500">Loading assignment...</div>;

  const isAllDone = assignment.tasks.every(t => t.done);

  return (
    <div className={cn("space-y-6 max-w-2xl mx-auto pb-24", isSlideout ? "p-0 pb-32" : "p-4 sm:p-6")}>
      {!isSlideout && (
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/properties/1" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Cleaning Assignment</h2>
            <p className="text-sm text-slate-500">Task details and status.</p>
          </div>
        </div>
      )}

      {isSlideout && propCoverImage && (
        <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
          <img src={propCoverImage} alt="Property" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{assignment.property}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{assignment.room}</h3>
          </div>
        </div>
      )}

      <div className={cn("card p-6 md:p-8 space-y-8", isSlideout && "border-none shadow-none bg-transparent pt-0")}>
        <div className={cn("text-center space-y-2 border-b border-slate-100 pb-8", isSlideout && "text-left border-none pb-4")}>
          {!isSlideout && (
            <>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{assignment.property}</p>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{assignment.room}</h3>
            </>
          )}
          
          <div className={cn("flex flex-col items-center mt-4 space-y-3", isSlideout && "items-start mt-2")}>
            <div 
              className="inline-block px-3 py-1 rounded-full text-sm font-bold border"
              style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}30`, color: themeColor }}
            >
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
        <div className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50",
          !isSlideout && "md:left-20 lg:left-64"
        )}>
          <div className="max-w-2xl mx-auto flex justify-end">
            <button 
              onClick={handleFinish}
              style={{ backgroundColor: themeColor }}
              className="w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white shadow-sm transition-all hover:opacity-90"
            >
              Finish Cleaning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
