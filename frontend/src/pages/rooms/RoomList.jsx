import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Plus, Search, Building2, Calendar, Zap, CheckCircle2, Copy, Save, X, Archive, RotateCcw, History, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import Modal from '../../components/Modal';
import Slideout from '../../components/Slideout';
import RoomDetail from './RoomDetail';
import { saveAssignment, fetchProperties, fetchRooms, saveRoom, fetchRoomDetails, API_BASE_URL } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';

export default function RoomList() {
  const { t } = useTranslation();
  const [groupedRooms, setGroupedRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addingToPropertyId, setAddingToPropertyId] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  
  const [isRoomSlideoutOpen, setIsRoomSlideoutOpen] = useState(false);
  const [roomForSlideout, setRoomForSlideout] = useState(null);
  const [slideoutTab, setSlideoutTab] = useState('settings');

  const [archivedRoomBackup, setArchivedRoomBackup] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const [selectedRoomTaskSets, setSelectedRoomTaskSets] = useState([]);
  const [selectedTaskSetId, setSelectedTaskSetId] = useState('');
  const [loadingTaskSets, setLoadingTaskSets] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const properties = await fetchProperties();
      const rooms = await fetchRooms();
      
      let filteredProperties = properties;
      if (user?.role === 'cleaner') {
        filteredProperties = properties.filter(p => p.cleaners?.some(c => c.name === user.name));
      } else if (user?.role === 'manager') {
        filteredProperties = properties.filter(p => p.managers?.some(m => m.name === user.name));
      }

      const groups = {};
      filteredProperties.forEach(prop => {
        groups[prop.name] = {
          id: prop.id,
          theme: prop.theme || '#0ea5e9',
          rooms: rooms.filter(r => r.property_id.toString() === prop.id.toString()).map(r => ({
            ...r,
            property: prop.name,
            propertyId: prop.id,
            lastCleaned: (r.lastCleaned === 'Never' || !r.lastCleaned) ? t('rooms.never') : r.lastCleaned
          }))
        };
      });
      setGroupedRooms(groups);
    } catch (e) {
      console.error('Failed to load rooms', e);
    } finally {
      setLoading(false);
    }
  };

  const getContrastColor = (hex) => {
    if (!hex || hex === 'transparent') return 'text-slate-800';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 160) ? 'text-slate-900' : 'text-white';
  };

  const getSecondaryTextColor = (hex) => {
    if (!hex || hex === 'transparent') return 'text-slate-500';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 160) ? 'text-slate-600' : 'text-white/70';
  };

  const createAssignment = async (room, date, time, taskSetId = null, tasksInput = null) => {
    try {
      let tasks = [];
      let finalTaskSetId = taskSetId;
      if (tasksInput !== null) {
        tasks = tasksInput;
      } else {
        const roomData = await fetchRoomDetails(room.id);
        const sets = roomData?.taskSets || [];
        const defaultSet = sets.find(ts => ts.isQuickClean) || sets[0];
        tasks = defaultSet?.tasks || [];
        finalTaskSetId = defaultSet?.id || null;
      }

      const newId = Date.now().toString();
      const newAssignment = {
        id: newId,
        property: room.property,
        room: room.name,
        date: date,
        time: time,
        doneBy: null,
        doneAt: null,
        task_set_id: finalTaskSetId,
        tasks: tasks.length > 0
          ? tasks.map(t => ({ title: t.text || t.title, done: false }))
          : [{ title: t('assignments.was_cleaned'), done: false }]
      };

      await saveAssignment(newAssignment);
      setSuccessMessage(t('rooms.cleaning_assigned', { room: room.name }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to create assignment', e);
    }
  };

  const handleExpressCleaning = (room) => {
    createAssignment(room, 'Today', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleOpenAssignModal = async (room) => {
    setSelectedRoom(room);
    setIsAssignModalOpen(true);
    setLoadingTaskSets(true);
    try {
      const details = await fetchRoomDetails(room.id);
      const sets = details?.taskSets || [];
      setSelectedRoomTaskSets(sets);
      if (sets.length > 0) {
        setSelectedTaskSetId(sets[0].id);
      } else {
        setSelectedTaskSetId('');
      }
    } catch (e) {
      console.error('Failed to load room task sets', e);
    } finally {
      setLoadingTaskSets(false);
    }
  };

  const handleAssignCleaning = (e) => {
    e.preventDefault();
    if (!assignDate) return;
    
    const chosenSet = selectedRoomTaskSets.find(ts => ts.id === selectedTaskSetId);
    const tasks = chosenSet?.tasks || [];

    createAssignment(selectedRoom, assignDate, '10:00 AM', selectedTaskSetId || null, tasks.length > 0 ? tasks : null);
    setIsAssignModalOpen(false);
    setAssignDate('');
    setSelectedRoomTaskSets([]);
    setSelectedTaskSetId('');
  };

  const handleSaveRoom = async (propertyId) => {
    if (!newRoomName.trim()) return;

    const newRoom = {
      id: Date.now().toString(),
      property_id: propertyId,
      name: newRoomName.trim(),
      lastCleaned: t('rooms.never'),
      intervalDays: 0,
      tasks: []
    };

    try {
      await saveRoom(newRoom);
      setNewRoomName('');
      setAddingToPropertyId(null);
      await loadRooms();
      setSuccessMessage(t('rooms.room_added', { room: newRoom.name }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to save room', e);
    }
  };

  const handleCloneRoom = async (propertyId, roomToClone) => {
    try {
      // Fetch full details to get tasks
      const { fetchRoomDetails } = await import('../../lib/api');
      const details = await fetchRoomDetails(roomToClone.id);
      
      const clonedRoom = {
        ...roomToClone,
        id: Date.now().toString(),
        property_id: propertyId,
        name: `${roomToClone.name} (Copy)`,
        lastCleaned: 'Never',
        tasks: details?.tasks || []
      };

      await saveRoom(clonedRoom);
      await loadRooms();
      setSuccessMessage(t('rooms.room_cloned', { room: clonedRoom.name }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to clone room', e);
    }
  };

  const handleCancelAdd = () => {
    setAddingToPropertyId(null);
    setNewRoomName('');
  };

  const handleOpenRoomSlideout = (room, tab = 'settings') => {
    setRoomForSlideout(room);
    setSlideoutTab(tab);
    setIsRoomSlideoutOpen(true);
  };

  const handleToggleOccupancy = async (room, isOccupied) => {
    const nextOccupied = isOccupied ? 1 : 0;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let nextOccupiedUntil = room.occupied_until || null;
    if (nextOccupied === 1) {
      if (nextOccupiedUntil && nextOccupiedUntil <= todayStr) {
        nextOccupiedUntil = null;
      }
    } else {
      nextOccupiedUntil = null;
    }

    const updatedRoom = {
      id: room.id,
      property_id: room.property_id || room.propertyId,
      name: room.name,
      intervalDays: room.intervalDays || 0,
      lastCleaned: room.lastCleaned || 'Never',
      is_occupied: nextOccupied,
      occupied_until: nextOccupiedUntil
    };
    setGroupedRooms(prev => {
      const propertyGroup = prev[room.property];
      if (!propertyGroup) return prev;
      return {
        ...prev,
        [room.property]: {
          ...propertyGroup,
          rooms: propertyGroup.rooms.map(r => r.id === room.id ? { ...r, is_occupied: nextOccupied, occupied_until: nextOccupiedUntil } : r)
        }
      };
    });
    try {
      await saveRoom(updatedRoom);
    } catch (e) {
      console.error('Failed to update room occupancy', e);
      loadRooms();
    }
  };

  const handleUpdateOccupancyDate = async (room, occupiedUntil) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let nextOccupied = Number(room.is_occupied);
    let nextOccupiedUntil = occupiedUntil || null;

    if (occupiedUntil) {
      if (occupiedUntil <= todayStr) {
        nextOccupied = 0;
        nextOccupiedUntil = null;
      } else {
        nextOccupied = 1;
      }
    }

    const updatedRoom = {
      id: room.id,
      property_id: room.property_id || room.propertyId,
      name: room.name,
      intervalDays: room.intervalDays || 0,
      lastCleaned: room.lastCleaned || 'Never',
      is_occupied: nextOccupied,
      occupied_until: nextOccupiedUntil
    };
    setGroupedRooms(prev => {
      const propertyGroup = prev[room.property];
      if (!propertyGroup) return prev;
      return {
        ...prev,
        [room.property]: {
          ...propertyGroup,
          rooms: propertyGroup.rooms.map(r => r.id === room.id ? { ...r, is_occupied: nextOccupied, occupied_until: nextOccupiedUntil } : r)
        }
      };
    });
    try {
      await saveRoom(updatedRoom);
    } catch (e) {
      console.error('Failed to update room occupied until date', e);
      loadRooms();
    }
  };

  const handleAutoAssign = async (propertyId) => {
    setAutoAssigning(propertyId);
    try {
      const res = await fetch(`${API_BASE_URL}/auto_assign.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(`Auto-assigned ${data.assignments_created} due cleanings!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        loadRooms();
      } else {
        throw new Error('Failed to auto-assign');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to auto-assign cleanings.');
    } finally {
      setAutoAssigning(null);
    }
  };

  // Drag and Drop for Rooms
  const [draggedRoomId, setDraggedRoomId] = useState(null);
  const [draggedRoomProperty, setDraggedRoomProperty] = useState(null);
  const [draggedRoomIndex, setDraggedRoomIndex] = useState(-1);
  const [dragOverRoomId, setDragOverRoomId] = useState(null);

  const handleDragStartRoom = (e, roomId, propertyName, idx) => {
    setDraggedRoomId(roomId);
    setDraggedRoomProperty(propertyName);
    setDraggedRoomIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverRoom = (e, roomId, propertyName) => {
    e.preventDefault();
    if (draggedRoomProperty !== propertyName) return; // Only allow drag and drop within the same property
    if (draggedRoomId === roomId) return;
    setDragOverRoomId(roomId);
  };

  const handleDragEndRoom = () => {
    setDraggedRoomId(null);
    setDraggedRoomProperty(null);
    setDraggedRoomIndex(-1);
    setDragOverRoomId(null);
  };

  const handleDropRoom = async (e, targetRoomId, propertyName) => {
    e.preventDefault();
    if (draggedRoomProperty !== propertyName || draggedRoomId === targetRoomId) {
      handleDragEndRoom();
      return;
    }

    const roomsList = [...groupedRooms[propertyName].rooms];
    const draggedIdx = roomsList.findIndex(r => r.id === draggedRoomId);
    const targetIdx = roomsList.findIndex(r => r.id === targetRoomId);

    if (draggedIdx === -1 || targetIdx === -1) {
      handleDragEndRoom();
      return;
    }

    // Reorder
    const [draggedRoom] = roomsList.splice(draggedIdx, 1);
    roomsList.splice(targetIdx, 0, draggedRoom);

    // Build position map
    const positions = {};
    roomsList.forEach((r, idx) => {
      positions[r.id] = idx;
    });

    // Optimistically update frontend state
    setGroupedRooms(prev => ({
      ...prev,
      [propertyName]: {
        ...prev[propertyName],
        rooms: prev[propertyName].rooms.map(r => ({
          ...r,
          position: positions[r.id] !== undefined ? positions[r.id] : r.position
        })).sort((a, b) => a.position - b.position)
      }
    }));

    handleDragEndRoom();

    // Persist to database
    try {
      const res = await fetch(`${API_BASE_URL}/rooms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions })
      });
      if (!res.ok) throw new Error('Failed to save room order');
    } catch (err) {
      console.error('Error saving room order', err);
      loadRooms();
    }
  };

  const handleArchiveRoom = async (propertyId, room) => {
    try {
      const { deleteRoom } = await import('../../lib/api');
      await deleteRoom(room.id);
      setArchivedRoomBackup({ propertyId, room });
      setUndoCountdown(100);
      await loadRooms();
    } catch (e) {
      console.error('Failed to archive room', e);
    }
  };

  const handleUndoArchive = async () => {
    if (!archivedRoomBackup) return;
    const { propertyId, room } = archivedRoomBackup;
    
    try {
      await saveRoom({
        id: room.id,
        property_id: propertyId,
        name: room.name,
        intervalDays: room.intervalDays || 0,
        lastCleaned: room.lastCleaned || 'Never',
        tasks: room.tasks || []
      });
      setArchivedRoomBackup(null);
      setUndoCountdown(0);
      await loadRooms();
      setSuccessMessage(t('rooms.room_restored', { room: room.name }));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to restore room', e);
    }
  };

  useEffect(() => {
    if (undoCountdown > 0) {
      const timer = setInterval(() => {
        setUndoCountdown(prev => {
          if (prev <= 1) {
            setArchivedRoomBackup(null);
            return 0;
          }
          return prev - 1;
        });
      }, 100); // 10s = 100 * 100ms
      return () => clearInterval(timer);
    }
  }, [undoCountdown]);

  if (loading) return <div className="p-8 text-center text-slate-500">{t('rooms.loading')}</div>;

  const totalProperties = Object.keys(groupedRooms).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white text-primary-600 rounded-2xl shadow-sm border border-slate-100">
            <BedDouble size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('rooms.title')}</h1>
            <p className="text-slate-500 font-medium mt-1">{t('rooms.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-500" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('rooms.search_placeholder')}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm font-medium"
        />
      </div>

      {totalProperties === 0 ? (
        <div className="card p-12 text-center">
          <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{t('rooms.no_properties')}</h3>
          <p className="text-slate-500 mb-6">{t('rooms.create_property_first')}</p>
          <Link to="/properties" className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors">
            {t('rooms.go_to_properties')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([propertyName, group]) => {
            const filteredRooms = group.rooms.filter(room => 
              room.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            if (searchQuery && filteredRooms.length === 0) return null;

            return (
            <div key={propertyName} className="card overflow-hidden">
              <div 
                className={cn("p-4 border-b flex items-center justify-between", getContrastColor(group.theme))}
                style={{ backgroundColor: group.theme, borderColor: `${group.theme}20` }}
              >
                <div className="flex items-center space-x-2">
                  <Building2 size={18} className={getSecondaryTextColor(group.theme)}/>
                  <h3 className="font-bold">{propertyName}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold ml-2", 
                    parseInt(group.theme.slice(1, 3), 16) * 0.299 + parseInt(group.theme.slice(3, 5), 16) * 0.587 + parseInt(group.theme.slice(5, 7), 16) * 0.114 >= 160 
                    ? "bg-black/10 text-slate-800" : "bg-white/20 text-white")}>
                    {filteredRooms.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.role !== 'cleaner' && (
                    <Link 
                      to={`/properties`}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-bold text-xs uppercase tracking-wider px-3 py-1.5 bg-primary-50 rounded-lg transition-colors"
                    >
                      <Building2 size={14} />
                      <span>{t('rooms.manage_property')}</span>
                    </Link>
                  )}
                  {user?.role !== 'cleaner' && (
                    <button 
                      onClick={() => handleAutoAssign(group.id)}
                      disabled={autoAssigning === group.id}
                      className={cn("flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border",
                        parseInt(group.theme.slice(1, 3), 16) * 0.299 + parseInt(group.theme.slice(3, 5), 16) * 0.587 + parseInt(group.theme.slice(5, 7), 16) * 0.114 >= 160 
                        ? "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200" : "bg-white/10 text-white border-white/20 hover:bg-white/20",
                        autoAssigning === group.id ? "opacity-50 pointer-events-none" : ""
                      )}
                      title="Auto Assign all due/overdue cleanings according to scheduled intervals"
                    >
                      <Zap size={14} className={autoAssigning === group.id ? "animate-spin" : ""} />
                      <span>Auto Assign</span>
                    </button>
                  )}
                  {user?.role !== 'cleaner' && (
                    <button 
                      onClick={() => {
                        setAddingToPropertyId(group.id);
                        setNewRoomName('');
                      }}
                      className={cn("flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border",
                        parseInt(group.theme.slice(1, 3), 16) * 0.299 + parseInt(group.theme.slice(3, 5), 16) * 0.587 + parseInt(group.theme.slice(5, 7), 16) * 0.114 >= 160 
                        ? "bg-primary-600 text-white border-primary-700 hover:bg-primary-700" : "bg-white text-slate-900 border-white hover:bg-slate-50")}
                    >
                      <Plus size={14} />
                      <span>{t('rooms.add_room')}</span>
                    </button>
                  )}
                </div>
              </div>
              {filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  {t('rooms.no_rooms')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="p-4 font-semibold text-slate-600 text-sm">{t('rooms.room_name')}</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm">{t('rooms.last_cleaned')}</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Occupancy / Service</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm text-right">{t('rooms.action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {addingToPropertyId === group.id && (
                        <tr className="bg-primary-50/30">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white text-primary-500 rounded-lg shadow-sm border border-primary-100">
                                <BedDouble size={16} />
                              </div>
                              <input 
                                autoFocus
                                type="text"
                                placeholder={t('rooms.enter_name_placeholder')}
                                className="bg-white border border-primary-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-xs transition-all"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRoom(group.id);
                                  if (e.key === 'Escape') handleCancelAdd();
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-4 text-slate-400 text-xs italic font-medium uppercase tracking-wider">{t('rooms.new_room')}</td>
                          <td className="p-4"></td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleSaveRoom(group.id)}
                                className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm active:scale-95"
                                title={t('rooms.save_room')}
                              >
                                <Save size={16} />
                              </button>
                              <button 
                                onClick={handleCancelAdd}
                                className="p-1.5 bg-white text-slate-500 rounded-lg hover:bg-slate-50 transition-all shadow-sm border border-slate-200 active:scale-95"
                                title={t('common.cancel')}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {filteredRooms.map((room, index) => {
                        const isDragged = draggedRoomId === room.id;
                        const isDragOver = dragOverRoomId === room.id;

                        return (
                          <React.Fragment key={room.id}>
                            {/* Visual empty placeholder above if dragging up */}
                            {isDragOver && draggedRoomIndex > index && (
                              <tr className="bg-slate-100/30 border-2 border-dashed border-slate-200 h-[64px] transition-all">
                                <td colSpan="4" className="p-4 text-center text-xs text-slate-400 font-medium italic">Move here</td>
                              </tr>
                            )}

                            <tr 
                              draggable={user?.role !== 'cleaner'}
                              onDragStart={(e) => handleDragStartRoom(e, room.id, propertyName, index)}
                              onDragOver={(e) => handleDragOverRoom(e, room.id, propertyName)}
                              onDrop={(e) => handleDropRoom(e, room.id, propertyName)}
                              onDragEnd={handleDragEndRoom}
                              onDoubleClick={() => handleOpenRoomSlideout(room, 'settings')}
                              className={cn(
                                "hover:bg-slate-50 transition-colors cursor-grab active:cursor-grabbing select-none",
                                isDragged ? "opacity-30 bg-slate-50/50" : ""
                              )}
                            >
                              <td className="p-4">
                                <div className="flex items-center space-x-3 group">
                                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                                    <BedDouble size={16} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-800">{room.name}</span>
                                    {room.taskSets && room.taskSets.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {room.taskSets.map(ts => (
                                          <span 
                                            key={ts.id} 
                                            className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200"
                                            title={`${ts.taskCount} subtasks${ts.intervalDays > 0 && !ts.is_once && !ts.isOnce ? `, auto interval: every ${ts.intervalDays} days` : ''}`}
                                          >
                                            {ts.title} ({ts.taskCount}){ts.intervalDays > 0 && !ts.is_once && !ts.isOnce ? ` • A: ${ts.intervalDays} ${ts.intervalDays === 1 ? 'day' : 'days'}` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-3 group">
                                  <span className="text-slate-500 text-sm whitespace-nowrap">{room.lastCleaned}</span>
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => handleExpressCleaning(room)}
                                      className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-orange-50 rounded hover:bg-orange-100 transition-colors border border-orange-100"
                                      title={t('rooms.express_tooltip')}
                                    >
                                      <Zap size={10} />
                                      <span>{t('rooms.express')}</span>
                                    </button>
                                    <button 
                                      onClick={() => handleOpenAssignModal(room)}
                                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors border border-blue-100"
                                      title={t('rooms.assign_tooltip')}
                                    >
                                      <Calendar size={10} />
                                      <span>{t('rooms.assign')}</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                                  {/* Lightswitch Toggle Switch */}
                                  <label 
                                    className="relative inline-flex items-center cursor-pointer select-none"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={Number(room.is_occupied) === 1}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleToggleOccupancy(room, e.target.checked);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                  </label>

                                  {/* Date Input right from lightswitch */}
                                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                      type="date"
                                      value={room.occupied_until || ''}
                                      disabled={Number(room.is_occupied) === 0}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleUpdateOccupancyDate(room, e.target.value);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "text-xs font-medium px-2.5 py-1 rounded-lg border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500",
                                        Number(room.is_occupied) === 1 
                                          ? "bg-white border-slate-200 text-slate-700" 
                                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                      )}
                                      title="Occupied Until Date (automatically turns off occupancy when date arrives)"
                                    />
                                  </div>

                                  {/* Status Badge */}
                                  <span className={cn(
                                    "inline-flex items-center space-x-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap",
                                    Number(room.is_occupied) === 1 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                      : "bg-amber-50 text-amber-800 border border-amber-300"
                                  )}>
                                    {Number(room.is_occupied) === 1 ? (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span>Occupied</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        <span>Service Mode</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button 
                                    onClick={() => handleOpenRoomSlideout(room, 'log')}
                                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-800 font-bold text-[10px] uppercase tracking-wider px-2 py-1 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                                    title={t('tooltips.cleaning_log')}
                                  >
                                    <History size={12} />
                                    <span className="hidden sm:inline">{t('rooms.tabs.log')}</span>
                                  </button>
                                  <button 
                                    onClick={() => handleOpenRoomSlideout(room, 'settings')}
                                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 font-bold text-[10px] uppercase tracking-wider px-2 py-1 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors border border-primary-100 shadow-sm"
                                  >
                                    <Settings size={12} />
                                    <span className="hidden sm:inline">{t('rooms.manage')}</span>
                                  </button>
                                  <button 
                                    onClick={() => handleCloneRoom(group.id, room)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    title={t('rooms.clone_room')}
                                  >
                                    <Copy size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleArchiveRoom(group.id, room)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t('rooms.archive_room')}
                                  >
                                    <Archive size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Visual empty placeholder below if dragging down */}
                            {isDragOver && draggedRoomIndex < index && (
                              <tr className="bg-slate-100/30 border-2 border-dashed border-slate-200 h-[64px] transition-all">
                                <td colSpan="3" className="p-4 text-center text-xs text-slate-400 font-medium italic">Move here</td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* Undo Notification */}
      {archivedRoomBackup && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-1 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col min-w-[320px] animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Archive size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold">{t('rooms.room_archived')}</p>
                <p className="text-xs text-slate-400 font-medium">{archivedRoomBackup.room.name}</p>
              </div>
            </div>
            <button 
              onClick={handleUndoArchive}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-bold text-xs active:scale-95 shadow-lg shadow-primary-900/20"
            >
              <RotateCcw size={14} />
              <span>{t('rooms.undo')}</span>
            </button>
          </div>
          <div className="h-1.5 bg-slate-800 w-full">
            <div 
              className="h-full bg-primary-500 transition-all duration-100 ease-linear"
              style={{ width: `${undoCountdown}%` }}
            />
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={20} />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Assign Date Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title={t('rooms.assign_cleaning_title', { room: selectedRoom?.name })}
      >
        <form onSubmit={handleAssignCleaning} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('rooms.target_date')}</label>
            <input 
              type="date" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              value={assignDate}
              onChange={(e) => setAssignDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {loadingTaskSets ? (
            <div className="text-xs text-slate-400 font-medium">Loading checklist options...</div>
          ) : (
            selectedRoomTaskSets.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Checklist Set</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  value={selectedTaskSetId}
                  onChange={(e) => setSelectedTaskSetId(e.target.value)}
                >
                  {selectedRoomTaskSets.map(ts => (
                    <option key={ts.id} value={ts.id}>
                      {ts.title} {ts.isQuickClean ? '(Quick Clean)' : ''} ({ts.tasks?.length || 0} subtasks)
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95"
            >
              {t('rooms.confirm_assignment')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Room Detail Slideout */}
      <Slideout 
        isOpen={isRoomSlideoutOpen} 
        onClose={() => setIsRoomSlideoutOpen(false)}
        title={roomForSlideout ? t('rooms.management_title') + roomForSlideout.name : t('rooms.title')}
      >
        {roomForSlideout && (
          <RoomDetail 
            key={roomForSlideout.id}
            roomId={roomForSlideout.id} 
            isSlideout={true} 
            propertyName={roomForSlideout.property}
            roomName={roomForSlideout.name}
            initialTab={slideoutTab}
          />
        )}
      </Slideout>
    </div>
  );
}
