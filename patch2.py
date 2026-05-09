import re

with open('frontend/src/pages/rooms/RoomDetail.jsx', 'r') as f:
    content = f.read()

# Replace handlers
old_handlers = """  const handleTaskChange = (taskId, newText) => {
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
  };"""

new_handlers = """  const handleTaskSetChange = (tsId, field, value) => {
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
  };"""

content = content.replace(old_handlers, new_handlers)

# Replace UI
old_ui_start = """            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <History size={18} className="text-slate-400" />
                  <span>{t('rooms.task_template')}</span>
                </h3>
                {isEditing && (
                  <button onClick={handleAddTask} className="flex items-center space-x-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1.5 rounded-lg transition-colors">
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                )}
              </div>"""

new_ui_start = """            <div className="card overflow-hidden">
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
              </div>"""
content = content.replace(old_ui_start, new_ui_start)

# We need a regex or split for the rest of the UI replacement.
# Let's just use simple python string manipulation.

ui_body_old = """              <div className="p-5">
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
                    {roomData.tasks.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <ClipboardList className="mx-auto text-slate-200 mb-2" size={40} />
                        <p className="text-sm text-slate-500 font-medium">{t('rooms.no_template_tasks')}</p>
                      </div>
                    ) : (
                      roomData.tasks.map((task) => (
                        <li key={task.id} className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl">
                          <CheckCircle2 size={18} className="text-slate-300" />
                          <span className="font-medium text-slate-700">{task.text}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>"""

ui_body_new = """              <div className="p-5">
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
                      roomData.taskSets.map((ts) => (
                        <div key={ts.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                            <span className="font-bold text-slate-700">{ts.title}</span>
                            <div className="flex gap-2 text-xs font-bold">
                              {ts.isQuickClean && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Quick Clean</span>}
                              {ts.isOnce ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Once</span> : <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Every {ts.intervalDays} days</span>}
                            </div>
                          </div>
                          <ul className="p-3 space-y-2">
                            {ts.tasks.map((task) => (
                              <li key={task.id} className="flex items-center space-x-3 text-sm">
                                <CheckCircle2 size={16} className="text-slate-300" />
                                <span className="font-medium text-slate-600">{task.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>"""

content = content.replace(ui_body_old, ui_body_new)

# Remove the old global intervalDays input field since intervalDays is now per taskSet
# Actually the room data still has an intervalDays field which might be used as default, but let's hide it or remove it from the UI so it doesn't conflict.
old_interval = """              <div className="card p-5 bg-white border border-slate-100">
                <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">{t('rooms.auto_interval')}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="text-slate-300" size={20} />
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number"
                        min="0"
                        value={editForm.intervalDays}
                        onChange={(e) => setEditForm({ ...editForm, intervalDays: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('common.days')}</span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-slate-700">
                      {roomData.intervalDays > 0 ? `${roomData.intervalDays} ${t('common.days')}` : t('rooms.disabled')}
                    </span>
                  )}
                </div>
              </div>"""

new_interval = """              <div className="card p-5 bg-white border border-slate-100">
                <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Task Sets</p>
                <div className="flex items-center space-x-2 mt-2">
                  <ClipboardList className="text-slate-300" size={20} />
                  <span className="font-bold text-lg text-slate-700">
                    {roomData.taskSets.length} Sets Configured
                  </span>
                </div>
              </div>"""
content = content.replace(old_interval, new_interval)

with open('frontend/src/pages/rooms/RoomDetail.jsx', 'w') as f:
    f.write(content)
