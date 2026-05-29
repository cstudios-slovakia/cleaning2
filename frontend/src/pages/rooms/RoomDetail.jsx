import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle2, History, Edit2, Save, X, Plus, Trash2, GripVertical, ClipboardList, ExternalLink } from 'lucide-react';
import Slideout from '../../components/Slideout';
import AssignmentDetail from '../assignments/AssignmentDetail';
import { fetchRoomDetails, saveRoom } from '../../lib/api';
import { useAssignments } from '../../hooks/useAssignments';
import { useTranslation } from '../../contexts/I18nContext';
import { cn } from '../../lib/utils';

export default function RoomDetail({ roomId, isSlideout, propertyName, roomName, initialTab = 'settings' }) {
  const { t } = useTranslation();
  const { id: paramId } = useParams();
  const id = roomId || paramId;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [bulkInputs, setBulkInputs] = useState({});
  
  const [roomData, setRoomData] = useState({
    name: roomName || 'Room 101',
    property: propertyName || 'Grand Hotel',
    intervalDays: 0,
    taskSets: []
  });

  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isAssignmentSlideoutOpen, setIsAssignmentSlideoutOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { assignments } = useAssignments();

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await fetchRoomDetails(id);
        if (data) {
          const normalizedTaskSets = (data.taskSets || []).map(ts => ({
            id: ts.id,
            title: ts.title,
            intervalDays: ts.intervalDays,
            isOnce: ts.isOnce,
            isQuickClean: ts.isQuickClean,
            tasks: (ts.tasks || []).map(t => ({ id: t.id, text: t.title, position: t.position }))
          }));
          setRoomData({ ...data, taskSets: normalizedTaskSets });
        } else if (roomName || propertyName) {
          setRoomData(prev => ({ ...prev, name: roomName || prev.name, property: propertyName || prev.property }));
        }
        setIsLoaded(true);
      } catch (e) {
        console.error('Failed to load room', e);
        setIsLoaded(true);
      }
    };
    if (id) loadRoom();
  }, [id, roomName, propertyName]);

  useEffect(() => {
    if (!isLoaded || !roomData.name) return;
    const logs = assignments.filter(a => a.room === roomData.name && a.property === roomData.property && a.doneBy);
    logs.sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt));
    setCompletedAssignments(logs);
  }, [assignments, roomData.name, roomData.property, isLoaded]);

  const [editForm, setEditForm] = useState({ ...roomData });

  useEffect(() => {
    if (isLoaded) setEditForm({ ...roomData });
  }, [roomData, isLoaded]);

  const persistRoomData = async (newData) => {
    try {
      const dbTaskSets = newData.taskSets.map((ts, i) => ({
        ...ts,
        position: i,
        tasks: ts.tasks.map((t, j) => ({ title: t.text, position: j }))
      }));
      await saveRoom({ ...newData, taskSets: dbTaskSets });
      setRoomData(newData);
    } catch (e) {
      console.error('Failed to save room', e);
    }
  };

  const handleUpdateRoom = () => {
    persistRoomData({ ...editForm });
    setIsEditing(false);
  };

  const handleExpressCleaning = async () => {
    const newId = Date.now().toString();
    const quickCleanSet = roomData.taskSets.find(ts => ts.isQuickClean) || roomData.taskSets[0];
    const tasksToAssign = quickCleanSet?.tasks?.length > 0 
      ? quickCleanSet.tasks.map(t => ({ title: t.text, done: false })) 
      : [{ title: t('assignments.was_cleaned'), done: false }];
      
    const newAssignment = {
      id: newId,
      property: roomData.property,
      room: roomData.name,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doneBy: null,
      doneAt: null,
      task_set_id: quickCleanSet?.id || null,
      tasks: tasksToAssign
    };
    
    try {
      const { saveAssignment, sendPushNotification } = await import('../../lib/api');
      await saveAssignment(newAssignment);
      // We don't have propertyId directly here, but we can try to fetch it or pass it.
      // For now, if we don't have it, we skip the push, or we find it.
      // Wait, Room object has property_id! Let's check roomData.property_id
      if (roomData.property_id) {
          await sendPushNotification('flash', roomData.property_id);
      }
      
      setSuccessMessage(`Express cleaning started for ${roomData.name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to start express cleaning', err);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ ...roomData });
    setIsEditing(false);
  };

  const handleTaskSetChange = (tsId, field, value) => {
    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.map(ts => ts.id === tsId ? { ...ts, [field]: value } : ts)
    });
  };

  const handleTaskSetDelete = (tsId) => {
    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.filter(ts => ts.id !== tsId)
    });
  };

  const handleAddTaskSet = () => {
    setEditForm({
      ...editForm,
      taskSets: [...editForm.taskSets, { id: Date.now().toString(), title: 'New Task Set', intervalDays: 0, isOnce: false, isQuickClean: false, tasks: [] }]
    });
  };

  const handleCloneTaskSet = (ts) => {
    setEditForm({
      ...editForm,
      taskSets: [...editForm.taskSets, { ...ts, id: Date.now().toString(), title: ts.title + ' (Copy)' }]
    });
  };

  const handleTaskChange = (tsId, taskId, newText) => {
    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.map(ts => {
        if (ts.id === tsId) {
          return { ...ts, tasks: ts.tasks.map(t => t.id === taskId ? { ...t, text: newText } : t) };
        }
        return ts;
      })
    });
  };

  const handleTaskDelete = (tsId, taskId) => {
    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.map(ts => {
        if (ts.id === tsId) {
          return { ...ts, tasks: ts.tasks.filter(t => t.id !== taskId) };
        }
        return ts;
      })
    });
  };

  const handleAddTask = (tsId) => {
    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.map(ts => {
        if (ts.id === tsId) {
          return { ...ts, tasks: [...ts.tasks, { id: Date.now().toString(), text: 'New Task' }] };
        }
        return ts;
      })
    });
  };

  const handleBulkAddTasks = (tsId) => {
    const text = bulkInputs[tsId] || '';
    if (!text.trim()) return;

    const newTasksList = text.split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        id: `${Date.now()}_bulk_${idx}_${Math.random().toString(36).substr(2, 4)}`,
        text: line
      }));

    setEditForm({
      ...editForm,
      taskSets: editForm.taskSets.map(ts => {
        if (ts.id === tsId) {
          return { ...ts, tasks: [...ts.tasks, ...newTasksList] };
        }
        return ts;
      })
    });

    setBulkInputs({
      ...bulkInputs,
      [tsId]: ''
    });
  };

  const handleDragStart = (index, type) => {
    setDraggedIndex({ index, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropTaskSet = (e, index) => {
    e.preventDefault();
    if (!draggedIndex || draggedIndex.type !== 'taskSet' || draggedIndex.index === index) return;
    
    const newTaskSets = [...editForm.taskSets];
    const draggedItem = newTaskSets[draggedIndex.index];
    newTaskSets.splice(draggedIndex.index, 1);
    newTaskSets.splice(index, 0, draggedItem);
    
    setEditForm({ ...editForm, taskSets: newTaskSets });
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          {!isSlideout && (
            <Link to="/rooms" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
              <ArrowLeft size={18} className="text-slate-600" />
            </Link>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{t('rooms.management_title')}{roomData.property}</span>
              {isSlideout && (
                <Link 
                  to={`/rooms/${id}`} 
                  className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                  title="Open full page"
                >
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
            {isEditing ? (
              <input 
                type="text" 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <h2 className="text-2xl font-bold text-slate-800">{roomData.name}</h2>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
              >
                <X size={16} />
                <span className="hidden sm:inline">{t('common.cancel')}</span>
              </button>
              <button 
                onClick={handleUpdateRoom}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
              >
                <Save size={16} />
                <span className="hidden sm:inline">{t('common.save')}</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  setEditForm({ ...roomData });
                  setIsEditing(true);
                }}
                className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
              >
                <Edit2 size={16} />
                <span className="hidden sm:inline">{t('common.edit')}</span>
              </button>
              <button 
                onClick={handleExpressCleaning}
                className="flex items-center space-x-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors shadow-sm font-medium"
              >
                <Zap size={16} />
                <span className="hidden sm:inline">{t('dashboard.express_clean')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'settings' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          {t('rooms.tabs.settings')}
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'log' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          {t('rooms.tabs.log')}
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
                <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">{t('rooms.next_assignment')}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-bold text-lg">{t('rooms.not_scheduled')}</span>
                </div>
              </div>
              <div className="card p-5 bg-white border border-slate-100">
                <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Task Sets</p>
                <div className="flex items-center space-x-2 mt-2">
                  <ClipboardList className="text-slate-300" size={20} />
                  <span className="font-bold text-lg text-slate-700">
                    {roomData.taskSets.length} Sets Configured
                  </span>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <History size={18} className="text-slate-400" />
                  <span>{t('rooms.task_template') || 'Task Sets'}</span>
                </h3>
                {isEditing && (
                  <button onClick={handleAddTaskSet} className="flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} />
                    <span>Add Task Set</span>
                  </button>
                )}
              </div>
              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-6">
                    {editForm.taskSets.map((ts, index) => (
                      <div 
                        key={ts.id}
                        draggable
                        onDragStart={() => handleDragStart(index, 'taskSet')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropTaskSet(e, index)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`bg-white border rounded-xl p-4 transition-all ${draggedIndex?.index === index && draggedIndex?.type === 'taskSet' ? 'opacity-50 border-primary-300' : 'border-slate-200'}`}
                      >
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
                              <GripVertical size={20} />
                            </div>
                            <input 
                              type="text"
                              value={ts.title}
                              onChange={(e) => handleTaskSetChange(ts.id, 'title', e.target.value)}
                              placeholder="Task Set Title (e.g. Daily Clean)"
                              className="font-bold text-lg px-2 py-1 flex-1 border-b border-transparent focus:border-primary-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleCloneTaskSet(ts)} className="text-slate-500 hover:text-primary-600 p-1 bg-slate-100 rounded text-xs font-bold">Clone</button>
                            <button onClick={() => handleTaskSetDelete(ts.id)} className="text-slate-400 hover:text-red-500 p-1">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-4 text-sm bg-slate-50 p-2 rounded-lg">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <span className="font-medium text-slate-600">Interval (days):</span>
                            <input type="number" min="0" value={ts.intervalDays} onChange={(e) => handleTaskSetChange(ts.id, 'intervalDays', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded" />
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={ts.isOnce} onChange={(e) => handleTaskSetChange(ts.id, 'isOnce', e.target.checked)} className="rounded border-slate-300 text-primary-600" />
                            <span className="font-medium text-slate-600">Just Once</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={ts.isQuickClean} onChange={(e) => handleTaskSetChange(ts.id, 'isQuickClean', e.target.checked)} className="rounded border-slate-300 text-primary-600" />
                            <span className="font-medium text-slate-600">Is Quick Clean</span>
                          </label>
                        </div>
                        <ul className="space-y-2">
                          {ts.tasks.map((task) => (
                            <li key={task.id} className="flex items-center space-x-3 bg-white border border-slate-100 p-2 rounded-lg">
                              <input 
                                type="text"
                                value={task.text}
                                onChange={(e) => handleTaskChange(ts.id, task.id, e.target.value)}
                                className="flex-1 px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                              />
                              <button onClick={() => handleTaskDelete(ts.id, task.id)} className="p-1 text-slate-400 hover:text-red-500">
                                <X size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleAddTask(ts.id)} className="mt-3 flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg w-full justify-center">
                          <Plus size={14} />
                          <span>Add Task to Set</span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                          💡 Tip: Use <b>Group &gt; Task</b> format (e.g. <i>Kitchen &gt; Clean counter</i>) to group tasks visually!
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ Quick Bulk Add Tasks (one per line)</label>
                          <textarea
                            value={bulkInputs[ts.id] || ''}
                            onChange={(e) => setBulkInputs({ ...bulkInputs, [ts.id]: e.target.value })}
                            placeholder="Kitchen > Clean counters&#10;Kitchen > Empty trash&#10;Vacuum floors"
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-xs h-20"
                          />
                          <button 
                            type="button"
                            onClick={() => handleBulkAddTasks(ts.id)}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 justify-center w-full border border-primary-200"
                          >
                            <Plus size={12} />
                            <span>Bulk Add Tasks to Set</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {editForm.taskSets.length === 0 && (
                      <div className="text-slate-500 text-sm italic text-center py-4">No task sets created.</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {roomData.taskSets.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <ClipboardList className="mx-auto text-slate-200 mb-2" size={40} />
                        <p className="text-sm text-slate-500 font-medium">No task sets</p>
                      </div>
                    ) : (
                      roomData.taskSets.map((ts) => {
                        const groupedTasks = {};
                        (ts.tasks || []).forEach(task => {
                          if (task.text.includes('>')) {
                            const parts = task.text.split('>').map(s => s.trim());
                            const groupName = parts[0];
                            const restTitle = parts.slice(1).join(' > ');
                            if (!groupedTasks[groupName]) {
                              groupedTasks[groupName] = [];
                            }
                            groupedTasks[groupName].push({ ...task, displayText: restTitle });
                          } else {
                            if (!groupedTasks['']) {
                              groupedTasks[''] = [];
                            }
                            groupedTasks[''].push({ ...task, displayText: task.text });
                          }
                        });

                        return (
                          <div key={ts.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                              <span className="font-bold text-slate-700">{ts.title}</span>
                              <div className="flex gap-2 text-xs font-bold">
                                {ts.isQuickClean && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Quick Clean</span>}
                                {ts.isOnce ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Once</span> : <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Every {ts.intervalDays} days</span>}
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              {Object.entries(groupedTasks).map(([groupName, tasksList]) => (
                                <div key={groupName} className="space-y-2">
                                  {groupName !== '' && (
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-primary-500">
                                      {groupName}
                                    </div>
                                  )}
                                  <ul className="space-y-2">
                                    {tasksList.map((task) => (
                                      <li key={task.id} className="flex items-center space-x-3 text-sm pl-2">
                                        <CheckCircle2 size={16} className="text-slate-300 shrink-0" />
                                        <span className="font-medium text-slate-600">{task.displayText}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">{t('rooms.full_log')}</h3>
          </div>
          <div className="p-5">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
              {completedAssignments.length === 0 ? (
                <p className="text-slate-500 italic text-sm pl-8">{t('rooms.no_history')}</p>
              ) : (
                completedAssignments.map(a => {
                  const completedTasks = a.tasks ? a.tasks.filter(t => t.done).length : 0;
                  const totalTasks = a.tasks ? a.tasks.length : 0;
                  const percentage = totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 100;
                  
                  return (
                    <div 
                      key={a.id} 
                      className="relative flex items-start space-x-4 cursor-pointer group p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedLogId(a.id);
                        setIsAssignmentSlideoutOpen(true);
                      }}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full border-2 border-white text-white shadow-sm z-10 shrink-0 mt-1 group-hover:scale-110 transition-transform",
                        a.problemReported ? "bg-red-500" : (percentage < 100 ? "bg-orange-500" : "bg-green-500")
                      )}></div>
                      <div className="flex-1 -mt-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{a.doneBy}</div>
                            <time className="text-xs font-medium text-slate-500">{a.doneAt}</time>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                              {percentage}% {t('rooms.done_suffix')}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{totalTasks} {t('rooms.tasks_checklist')}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <Slideout 
        isOpen={isAssignmentSlideoutOpen} 
        onClose={() => setIsAssignmentSlideoutOpen(false)}
        title={t('assignments.title')}
      >
        {selectedLogId && (
          <AssignmentDetail 
            assignmentId={selectedLogId} 
            isSlideout={true} 
            theme="#0ea5e9"
          />
        )}
      </Slideout>
    </div>
  );
}


