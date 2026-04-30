import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle2, History, Edit2, Save, X, Plus, Trash2, GripVertical } from 'lucide-react';
import Slideout from '../../components/Slideout';
import AssignmentDetail from '../assignments/AssignmentDetail';
import { fetchRoomDetails, saveRoom } from '../../lib/api';
import { useAssignments } from '../../hooks/useAssignments';

export default function RoomDetail({ roomId, isSlideout, propertyName, roomName, initialTab = 'settings' }) {
  const { id: paramId } = useParams();
  const id = roomId || paramId;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  const [roomData, setRoomData] = useState({
    name: roomName || 'Room 101',
    property: propertyName || 'Emerald Grand',
    intervalDays: 0,
    tasks: []
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
          // Normalize tasks structure from API
          const normalizedTasks = (data.tasks || []).map(t => ({
            id: t.id,
            text: t.title, // Maps DB 'title' to frontend 'text'
            position: t.position
          }));
          setRoomData({ ...data, tasks: normalizedTasks });
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
      // Map frontend 'text' back to DB 'title'
      const dbTasks = newData.tasks.map((t, i) => ({ title: t.text, position: i }));
      await saveRoom({ ...newData, tasks: dbTasks });
      setRoomData(newData);
    } catch (e) {
      console.error('Failed to save room', e);
    }
  };

  const handleUpdateRoom = () => {
    persistRoomData({ ...editForm });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...roomData });
    setIsEditing(false);
  };

  const handleTaskChange = (taskId, newText) => {
    setEditForm({
      ...editForm,
      tasks: editForm.tasks.map(t => t.id === taskId ? { ...t, text: newText } : t)
    });
  };

  const handleTaskDelete = (taskId) => {
    setEditForm({
      ...editForm,
      tasks: editForm.tasks.filter(t => t.id !== taskId)
    });
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newTasks = [...editForm.tasks];
    const draggedItem = newTasks[draggedIndex];
    newTasks.splice(draggedIndex, 1);
    newTasks.splice(index, 0, draggedItem);
    
    setEditForm({ ...editForm, tasks: newTasks });
    setDraggedIndex(null);
  };

  const handleAddTask = () => {
    setEditForm({
      ...editForm,
      tasks: [...editForm.tasks, { id: Date.now().toString(), text: 'New Task' }]
    });
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
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{roomData.property}</span>
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
                <span className="hidden sm:inline">Cancel</span>
              </button>
              <button 
                onClick={handleUpdateRoom}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
              >
                <Save size={16} />
                <span className="hidden sm:inline">Save Changes</span>
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
                <span className="hidden sm:inline">Edit Room</span>
              </button>
              <button className="flex items-center space-x-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors shadow-sm font-medium">
                <Zap size={16} />
                <span className="hidden sm:inline">Express Clean</span>
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
          Room Settings
        </button>
        <button 
          onClick={() => setActiveTab('log')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'log' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Cleaning Log
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
                <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Next Assignment</p>
                <div className="flex items-center space-x-2 mt-2">
                  {roomData.intervalDays > 0 ? (
                    <>
                      <Clock size={20} className="text-orange-400"/> 
                      <span className="font-bold text-xl">Today, 14:00</span>
                    </>
                  ) : (
                    <span className="font-bold text-lg text-slate-400">Not scheduled</span>
                  )}
                </div>
              </div>
              <div className="card p-5 flex flex-col justify-center">
                <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1">Auto Interval (Days)</p>
                {isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input 
                      type="number" 
                      min="0"
                      value={editForm.intervalDays}
                      onChange={(e) => setEditForm({ ...editForm, intervalDays: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg text-slate-800"
                    />
                    <span className="text-slate-500 font-medium">days (0 to disable)</span>
                  </div>
                ) : (
                  <p className="font-bold text-xl text-slate-800">
                    {roomData.intervalDays > 0 ? `Every ${roomData.intervalDays} days` : 'Disabled'}
                  </p>
                )}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Task List Template</h3>
                {isEditing && (
                  <button onClick={handleAddTask} className="flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
              <div className="p-5">
                {isEditing ? (
                  <ul className="space-y-3">
                    {editForm.tasks.map((task, index) => (
                      <li 
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`flex items-center space-x-3 p-3 bg-white border rounded-xl transition-all ${draggedIndex === index ? 'opacity-50 border-primary-300' : 'border-slate-200'}`}
                      >
                        <div className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
                          <GripVertical size={20} />
                        </div>
                        <input 
                          type="text"
                          value={task.text}
                          onChange={(e) => handleTaskChange(task.id, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-700 bg-slate-50/50"
                        />
                        <button onClick={() => handleTaskDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </li>
                    ))}
                    {editForm.tasks.length === 0 && (
                      <li className="text-slate-500 text-sm italic">No tasks assigned to this room template.</li>
                    )}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    {roomData.tasks.map((task) => (
                      <li key={task.id} className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl">
                        <CheckCircle2 size={18} className="text-slate-300" />
                        <span className="font-medium text-slate-700">{task.text}</span>
                      </li>
                    ))}
                    {roomData.tasks.length === 0 && (
                      <li className="text-slate-500 text-sm italic">No tasks assigned to this room template.</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Full Cleaning Log</h3>
          </div>
          <div className="p-5">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
              {completedAssignments.length === 0 ? (
                <p className="text-slate-500 italic text-sm pl-8">No cleaning history recorded yet.</p>
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
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-green-500 text-white shadow-sm z-10 shrink-0 mt-1 group-hover:scale-110 transition-transform"></div>
                      <div className="flex-1 -mt-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{a.doneBy}</div>
                            <time className="text-xs font-medium text-slate-500">{a.doneAt}</time>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                              {percentage}% Done
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{totalTasks} tasks checklist</p>
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
        title="Assignment Details"
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


