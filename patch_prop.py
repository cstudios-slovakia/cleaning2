import re

with open('frontend/src/pages/properties/PropertyDetail.jsx', 'r') as f:
    content = f.read()

# Update handleAssignCleaning
old_assign = """      const roomData = await fetchRoomDetails(room.id);
      const tasks = roomData?.tasks || [];

      const newId = Date.now().toString();
      const newAssignment = {
        id: newId,
        property: propertyData.name,
        room: room.name,
        date: new Date(assignDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
        time: '10:00 AM',
        doneBy: null,
        doneAt: null,
        tasks: tasks.length > 0 
          ? tasks.map(t => ({ title: t.title, done: false })) 
          : [{ title: 'The room is cleaned', done: false }]
      };"""

new_assign = """      const roomData = await fetchRoomDetails(room.id);
      const quickCleanSet = (roomData?.taskSets || []).find(ts => ts.isQuickClean) || (roomData?.taskSets || [])[0];
      const tasksToAssign = quickCleanSet?.tasks?.length > 0 
        ? quickCleanSet.tasks.map(t => ({ title: t.title || t.text, done: false })) 
        : [{ title: 'The room is cleaned', done: false }];

      const newId = Date.now().toString();
      const newAssignment = {
        id: newId,
        property: propertyData.name,
        room: room.name,
        date: new Date(assignDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
        time: '10:00 AM',
        doneBy: null,
        doneAt: null,
        task_set_id: quickCleanSet?.id || null,
        tasks: tasksToAssign
      };"""

content = content.replace(old_assign, new_assign)

# Update handleExpressCleaning
old_express = """        const roomData = await fetchRoomDetails(room.id);
        const tasks = roomData?.tasks || [];

        const newId = Date.now().toString();
        const newAssignment = {
          id: newId,
          property: propertyData.name,
          room: room.name,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doneBy: null,
          doneAt: null,
          tasks: tasks.length > 0 
            ? tasks.map(t => ({ title: t.title, done: false })) 
            : [{ title: 'The room is cleaned', done: false }]
        };"""

new_express = """        const roomData = await fetchRoomDetails(room.id);
        const quickCleanSet = (roomData?.taskSets || []).find(ts => ts.isQuickClean) || (roomData?.taskSets || [])[0];
        const tasksToAssign = quickCleanSet?.tasks?.length > 0 
          ? quickCleanSet.tasks.map(t => ({ title: t.title || t.text, done: false })) 
          : [{ title: 'The room is cleaned', done: false }];

        const newId = Date.now().toString();
        const newAssignment = {
          id: newId,
          property: propertyData.name,
          room: room.name,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doneBy: null,
          doneAt: null,
          task_set_id: quickCleanSet?.id || null,
          tasks: tasksToAssign
        };"""

content = content.replace(old_express, new_express)

with open('frontend/src/pages/properties/PropertyDetail.jsx', 'w') as f:
    f.write(content)
