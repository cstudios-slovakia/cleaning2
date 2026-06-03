import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Check, AlertTriangle, Image as ImageIcon, Plus, X, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { fetchAssignments, saveAssignment, uploadImage, API_BASE_URL } from '../../lib/api';

export default function AssignmentDetail({ assignmentId: propId, isSlideout = false, theme: propTheme, coverImage: propCoverImage, onFinish, onFlashMessage }) {
  const { id: routeId } = useParams();
  const id = propId || routeId;
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Local notes state for onBlur autosave
  const [localNotes, setLocalNotes] = useState('');
  const [localProblemNote, setLocalProblemNote] = useState('');
  const notesFocused = useRef(false);
  const problemNoteFocused = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAssignments();
        const a = data.find(x => x.id && id && x.id.toString() === id.toString());
        if (a) {
          setAssignment(a);
          if (!notesFocused.current) setLocalNotes(a.notes || '');
          if (!problemNoteFocused.current) setLocalProblemNote(a.problemNote || '');
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

  const canEdit = assignment && (!assignment.doneBy || (user && ['admin', 'superadmin', 'subadmin', 'owner', 'manager'].includes(user.role)));

  const toggleTask = async (taskId) => {
    if (!canEdit) return;

    const newTasks = assignment.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    const newAssignment = { ...assignment, tasks: newTasks };
    
    setAssignment(newAssignment);
    
    try {
      await saveAssignment(newAssignment);
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const toggleProblem = async () => {
    if (!canEdit) return;
    const isNowReported = !assignment.problemReported;
    const newAssignment = { ...assignment, problemReported: isNowReported };
    setAssignment(newAssignment);
    try {
      await saveAssignment(newAssignment);
      if (isNowReported) {
        fetch(`${API_BASE_URL}/push_notify.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'problem',
            propertyName: assignment.property,
            roomName: assignment.room
          })
        }).catch(err => console.error('Push notify failed', err));
      }
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const saveNotesOnBlur = async () => {
    notesFocused.current = false;
    if (!assignment) return;
    const newAssignment = { ...assignment, notes: localNotes };
    try {
      await saveAssignment(newAssignment);
    } catch (e) {
      console.error('Notes save failed', e);
    }
  };

  const saveProblemNoteOnBlur = async () => {
    problemNoteFocused.current = false;
    if (!assignment) return;
    const newAssignment = { ...assignment, problemNote: localProblemNote };
    try {
      await saveAssignment(newAssignment);
    } catch (e) {
      console.error('Problem note save failed', e);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const max = 1600;
          if (width > height && width > max) {
            height *= max / width;
            width = max;
          } else if (height > max) {
            width *= max / height;
            height = max;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })), 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    if (!e.target.files.length) return;
    setUploading(true);
    const newImages = [...(assignment.images || [])];
    
    for (const file of e.target.files) {
      const resized = await resizeImage(file);
      try {
         const res = await uploadImage(resized, assignment.room);
         if (res.status === 'success') {
            newImages.push(res.path);
         }
      } catch (err) {
         console.error('Failed to upload image', err);
      }
    }
    const newAssignment = { ...assignment, images: newImages };
    setAssignment(newAssignment);
    await saveAssignment(newAssignment);
    setUploading(false);
  };

  const removeImage = async (index) => {
    if (!canEdit) return;
    const newImages = [...(assignment.images || [])];
    newImages.splice(index, 1);
    const newAssignment = { ...assignment, images: newImages };
    setAssignment(newAssignment);
    await saveAssignment(newAssignment);
  };

  const isAllDone = assignment?.tasks?.every(t => t.done);

  const handleFinish = async () => {
    if (!canEdit) return;
    
    // Strict requirement: all tasks must be checked off in order to close
    if (!isAllDone) {
      return;
    }
    
    const now = new Date();
    const doneAt = now.toISOString();
    
    const newAssignment = { 
      ...assignment, 
      doneBy: user?.name || 'User',
      doneAt: doneAt,
      notes: localNotes,
      problemNote: localProblemNote
    };
    
    setAssignment(newAssignment);
    try {
      await saveAssignment(newAssignment);
      if (onFinish) onFinish(assignment.room);
      if (onFlashMessage) onFlashMessage(t('assignments.was_cleaned'));
    } catch (e) {
      console.error('Finish failed', e);
    }
  };

  if (loading || !assignment) return <div className="p-8 text-center text-slate-500">{t('loading.assignment')}</div>;

  const translateLabel = (label) => {
    if (!label) return '';
    if (label === 'Today') return t('common.today');
    if (label === 'Tomorrow') return t('common.tomorrow');
    if (label === 'Yesterday') return t('common.yesterday');
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
      const d = new Date(label);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
      }
    }
    
    return label;
  };

  // Dynamic Grouping Logic (Task 9)
  const groupedTasks = {};
  (assignment.tasks || []).forEach(task => {
    if (task.title.includes('>')) {
      const parts = task.title.split('>').map(s => s.trim());
      const groupName = parts[0];
      const restTitle = parts.slice(1).join(' > ');
      if (!groupedTasks[groupName]) {
        groupedTasks[groupName] = [];
      }
      groupedTasks[groupName].push({ ...task, displayTitle: restTitle });
    } else {
      if (!groupedTasks['']) {
        groupedTasks[''] = [];
      }
      groupedTasks[''].push({ ...task, displayTitle: task.title });
    }
  });

  return (
    <div className={cn("space-y-6 max-w-2xl mx-auto pb-32", isSlideout ? "p-0" : "p-4 sm:p-6")}>
      {!isSlideout && (
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/properties/1" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t('assignments.title')}</h2>
            <p className="text-sm text-slate-500">{t('assignments.details')}</p>
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
              {t('assignments.scheduled')}: {translateLabel(assignment.date)} {assignment.time}
            </div>
            
            {assignment.doneBy && (
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
                <Check size={16} />
                <span>{t('assignments.completed_by')} <b>{assignment.doneBy}</b> {assignment.doneAt ? `${t('common.at')} ${new Date(assignment.doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Grouped Tasks Checklist */}
        <div className="space-y-4">
          <h4 className="font-black text-slate-800 text-lg">{t('assignments.task_list')}</h4>
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([groupName, tasksList]) => (
              <div key={groupName} className="space-y-3">
                {groupName !== '' && (
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4 pl-1 border-l-2 border-primary-500 pl-2">
                    {groupName}
                  </div>
                )}
                <div className="space-y-2.5">
                  {tasksList.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      disabled={!canEdit}
                      className={cn(
                        "w-full flex items-center space-x-4 p-4 rounded-xl border transition-all text-left",
                        task.done 
                          ? "bg-green-50/40 border-green-200 shadow-none" 
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
                        "font-semibold text-base transition-colors",
                        task.done ? "text-slate-400 line-through" : "text-slate-700"
                      )}>
                        {task.displayTitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Cleaning Notes (Task 3) */}
        <div className="space-y-2 pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-slate-400" size={18} />
            <span className="font-bold text-slate-800">{t('assignments.cleaning_notes')}</span>
          </div>
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onFocus={() => { notesFocused.current = true; }}
            onBlur={saveNotesOnBlur}
            disabled={!canEdit}
            placeholder={t('assignments.notes_placeholder')}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm h-24"
          />
        </div>

        {/* Report Problem (Task 2) */}
        {(canEdit || (assignment.problemReported && String(assignment.problemReported) !== "0" && String(assignment.problemReported) !== "false")) && (
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className={(assignment.problemReported && String(assignment.problemReported) !== "0" && String(assignment.problemReported) !== "false") ? "text-red-500" : "text-slate-400"} size={20} />
                <span className="font-bold text-slate-800">{t('assignments.report_problem')}</span>
              </div>
              {canEdit && (
                <button 
                  onClick={toggleProblem}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    assignment.problemReported ? "bg-red-500" : "bg-slate-200"
                  )}
                >
                  <span 
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      assignment.problemReported ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              )}
            </div>

            {(assignment.problemReported && String(assignment.problemReported) !== "0" && String(assignment.problemReported) !== "false") && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fade-in-up">
                
                {/* Problem Description Note */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <MessageSquare size={14} className="text-red-500" />
                    <span>{t('assignments.describe_problem')}</span>
                  </div>
                  <textarea
                    value={localProblemNote}
                    onChange={(e) => setLocalProblemNote(e.target.value)}
                    onFocus={() => { problemNoteFocused.current = true; }}
                    onBlur={saveProblemNoteOnBlur}
                    disabled={!canEdit}
                    placeholder={t('assignments.problem_placeholder')}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm h-20"
                  />
                </div>

                {((assignment.images && assignment.images.length > 0) || canEdit) && (
                  <>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{t('assignments.upload_images')}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(assignment.images || []).map((imgPath, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-200">
                          <img src={`${API_BASE_URL.replace('/api/public', '')}/api/public/${imgPath}`} alt="Problem" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImage(imgPath)} />
                          {canEdit && (
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity animate-fade-in"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {canEdit && (
                        <label className="relative aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
                          {uploading ? (
                            <span className="text-xs font-bold text-slate-500 animate-pulse">{t('assignments.uploading')}</span>
                          ) : (
                            <>
                              <Plus className="text-slate-400 mb-1" size={24} />
                              <span className="text-xs font-bold text-slate-500">{t('assignments.add_image')}</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            className="hidden" 
                            onChange={handleImageUpload} 
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom bar for the finish button (Task 5) */}
      {canEdit && !assignment.doneBy && (
        <div className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 transition-all",
          !isSlideout && "md:left-20 lg:left-64",
          !isAllDone && "bg-slate-50/90"
        )}>
          {!isAllDone && (
            <div className="max-w-2xl mx-auto mb-3 flex items-start space-x-2 text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200">
              <Circle size={18} className="shrink-0 mt-0.5 text-slate-400" />
              <p className="text-xs font-semibold">
                {t('assignments.all_tasks_required')}
              </p>
            </div>
          )}
          <div className="max-w-2xl mx-auto flex justify-end">
            <button 
              onClick={handleFinish}
              disabled={!isAllDone}
              style={{ backgroundColor: isAllDone ? themeColor : '#cbd5e1' }}
              className={cn(
                "w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-sm transition-all text-center",
                isAllDone ? "hover:opacity-90 cursor-pointer shadow-primary-200" : "cursor-not-allowed text-slate-400 shadow-none border border-slate-200"
              )}
            >
              {t('assignments.finish_cleaning')}
            </button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen flex items-center justify-center animate-fade-in">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors bg-slate-800/50 rounded-full"
            >
              <X size={24} />
            </button>
            <img 
              src={`${API_BASE_URL.replace('/api/public', '')}/api/public/${selectedImage}`} 
              alt="Problem detail" 
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
