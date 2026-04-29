import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle2, History, Edit2, Save, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function RoomDetail() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for room data
  const [roomData, setRoomData] = useState(() => {
    const saved = localStorage.getItem(`emerald_room_${id}`);
    if (saved) return JSON.parse(saved);
    return {
      name: 'Room 101',
      property: 'Emerald Grand',
      intervalDays: 2, // numerical input
      tasks: [
        { id: '1', text: 'Make bed' },
        { id: '2', text: 'Clean bathroom' },
        { id: '3', text: 'Vacuum floors' },
        { id: '4', text: 'Empty trash' }
      ]
    };
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...roomData });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(`emerald_room_${id}`, JSON.stringify(roomData));
  }, [roomData, id]);

  const handleUpdateRoom = () => {
    setRoomData({ ...editForm });
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(editForm.tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setEditForm({ ...editForm, tasks: items });
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
          <Link to="/rooms" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
              <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Next Assignment</p>
              <div className="flex items-center space-x-2 mt-2">
                <Clock size={20} className="text-orange-400"/> 
                <span className="font-bold text-xl">Today, 14:00</span>
              </div>
            </div>
            <div className="card p-5 flex flex-col justify-center">
              <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1">Auto Interval (Days)</p>
              {isEditing ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input 
                    type="number" 
                    min="1"
                    value={editForm.intervalDays}
                    onChange={(e) => setEditForm({ ...editForm, intervalDays: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg text-slate-800"
                  />
                  <span className="text-slate-500 font-medium">days</span>
                </div>
              ) : (
                <p className="font-bold text-xl text-slate-800">Every {roomData.intervalDays} days</p>
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
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="tasks">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {editForm.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <li 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center space-x-3 p-3 bg-white border rounded-xl transition-all ${snapshot.isDragging ? 'shadow-xl border-primary-500 ring-2 ring-primary-500/10 z-50 scale-[1.02]' : 'border-slate-200'}`}
                              >
                                <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
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
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
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

        <div className="space-y-6">
          <div className="card">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Cleaning Log</h3>
            </div>
            <div className="p-5">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
                <div className="relative flex items-start space-x-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-green-500 text-white shadow-sm z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="font-bold text-slate-800 text-sm">Maria G.</div>
                    <time className="text-xs font-medium text-slate-500">Yesterday, 14:30</time>
                  </div>
                </div>
                <div className="relative flex items-start space-x-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-300 text-white shadow-sm z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="font-bold text-slate-600 text-sm">Anna N.</div>
                    <time className="text-xs font-medium text-slate-400">3 days ago, 11:15</time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


