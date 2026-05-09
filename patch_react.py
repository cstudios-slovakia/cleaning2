import re

with open('frontend/src/pages/rooms/RoomDetail.jsx', 'r') as f:
    content = f.read()

# 1. Update state initialization
content = content.replace('tasks: []', 'taskSets: []')

# 2. Update data normalization
old_normalize = """        if (data) {
          // Normalize tasks structure from API
          const normalizedTasks = (data.tasks || []).map(t => ({
            id: t.id,
            text: t.title, // Maps DB 'title' to frontend 'text'
            position: t.position
          }));
          setRoomData({ ...data, tasks: normalizedTasks });"""

new_normalize = """        if (data) {
          const normalizedTaskSets = (data.taskSets || []).map(ts => ({
            id: ts.id,
            title: ts.title,
            intervalDays: ts.intervalDays,
            isOnce: ts.isOnce,
            isQuickClean: ts.isQuickClean,
            tasks: (ts.tasks || []).map(t => ({ id: t.id, text: t.title, position: t.position }))
          }));
          setRoomData({ ...data, taskSets: normalizedTaskSets });"""

content = content.replace(old_normalize, new_normalize)

# 3. Update persist logic
old_persist = """  const persistRoomData = async (newData) => {
    try {
      // Map frontend 'text' back to DB 'title'
      const dbTasks = newData.tasks.map((t, i) => ({ title: t.text, position: i }));
      await saveRoom({ ...newData, tasks: dbTasks });
      setRoomData(newData);
    } catch (e) {
      console.error('Failed to save room', e);
    }
  };"""

new_persist = """  const persistRoomData = async (newData) => {
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
  };"""

content = content.replace(old_persist, new_persist)

# 4. Update express cleaning
old_express = """  const handleExpressCleaning = async () => {
    const newId = Date.now().toString();
    const newAssignment = {
      id: newId,
      property: roomData.property,
      room: roomData.name,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doneBy: null,
      doneAt: null,
      tasks: roomData.tasks.length > 0 
        ? roomData.tasks.map(t => ({ title: t.text, done: false })) 
        : [{ title: t('assignments.was_cleaned'), done: false }]
    };"""

new_express = """  const handleExpressCleaning = async () => {
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
    };"""

content = content.replace(old_express, new_express)

with open('frontend/src/pages/rooms/RoomDetail.jsx', 'w') as f:
    f.write(content)
