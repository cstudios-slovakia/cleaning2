import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Plus, Search, Building2, Calendar, Zap, CheckCircle2, Copy, Save, X, Archive, RotateCcw, History } from 'lucide-react';
import { cn } from '../../lib/utils';
import Modal from '../../components/Modal';
import Slideout from '../../components/Slideout';
import RoomDetail from './RoomDetail';

export default function RoomList() {
  const [groupedRooms, setGroupedRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addingToPropertyId, setAddingToPropertyId] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  
  const [isRoomSlideoutOpen, setIsRoomSlideoutOpen] = useState(false);
  const [roomForSlideout, setRoomForSlideout] = useState(null);

  const [archivedRoomBackup, setArchivedRoomBackup] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(0);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = () => {
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const groups = {};

    properties.forEach(prop => {
      const fullData = JSON.parse(localStorage.getItem(`emerald_property_${prop.id}`) || '{}');
      const theme = fullData.theme || '#0ea5e9';
      const rooms = JSON.parse(localStorage.getItem(`emerald_rooms_${prop.id}`) || '[]');
      
      groups[prop.name] = {
        id: prop.id,
        theme: theme,
        rooms: rooms.map(r => ({
          ...r,
          property: prop.name,
          propertyId: prop.id,
          // Mock last cleaned for now if not present
          lastCleaned: r.lastCleaned || 'Never'
        }))
      };
    });

    setGroupedRooms(groups);
    setLoading(false);
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

  const createAssignment = (room, date, time) => {
    const newId = Date.now().toString();
    const newAssignment = {
      id: newId,
      property: room.property,
      room: room.name,
      date: date,
      time: time,
      doneBy: null,
      doneAt: null,
      tasks: [
        { id: 1, title: 'Make bed', done: false },
        { id: 2, title: 'Clean bathroom', done: false },
        { id: 3, title: 'Vacuum floors', done: false },
        { id: 4, title: 'Empty trash', done: false },
      ]
    };

    localStorage.setItem(`emerald_assignment_${newId}`, JSON.stringify(newAssignment));
    
    // Track this new assignment ID globally
    const activeIds = JSON.parse(localStorage.getItem('emerald_active_assignment_ids') || '[]');
    localStorage.setItem('emerald_active_assignment_ids', JSON.stringify([...activeIds, newId]));
    
    setSuccessMessage(`Cleaning assigned for ${room.name}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleExpressCleaning = (room) => {
    createAssignment(room, 'Today', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const handleOpenAssignModal = (room) => {
    setSelectedRoom(room);
    setIsAssignModalOpen(true);
  };

  const handleAssignCleaning = (e) => {
    e.preventDefault();
    if (!assignDate) return;
    
    // Format date string
    const dateObj = new Date(assignDate);
    const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    
    createAssignment(selectedRoom, dateStr, '10:00 AM');
    setIsAssignModalOpen(false);
    setAssignDate('');
  };

  const handleSaveRoom = (propertyId) => {
    if (!newRoomName.trim()) return;

    const existingRooms = JSON.parse(localStorage.getItem(`emerald_rooms_${propertyId}`) || '[]');
    const newRoom = {
      id: Date.now(),
      name: newRoomName.trim(),
      lastCleaned: 'Never'
    };

    // Initialize the room data entry with empty tasks
    localStorage.setItem(`emerald_room_${newRoom.id}`, JSON.stringify({
      id: newRoom.id,
      name: newRoom.name,
      property: Object.keys(groupedRooms).find(name => groupedRooms[name].id === propertyId),
      intervalDays: 0,
      tasks: []
    }));

    localStorage.setItem(`emerald_rooms_${propertyId}`, JSON.stringify([...existingRooms, newRoom]));
    
    // Update property summary count
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, rooms: (p.rooms || 0) + 1 } : p
    );
    localStorage.setItem('emerald_properties', JSON.stringify(updatedProperties));

    setNewRoomName('');
    setAddingToPropertyId(null);
    loadRooms();
    
    setSuccessMessage(`Room "${newRoom.name}" added successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCloneRoom = (propertyId, roomToClone) => {
    const existingRooms = JSON.parse(localStorage.getItem(`emerald_rooms_${propertyId}`) || '[]');
    const clonedRoom = {
      ...roomToClone,
      id: Date.now(),
      name: `${roomToClone.name} (Copy)`,
      lastCleaned: 'Never'
    };

    localStorage.setItem(`emerald_rooms_${propertyId}`, JSON.stringify([...existingRooms, clonedRoom]));
    
    // Update property summary count
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, rooms: (p.rooms || 0) + 1 } : p
    );
    localStorage.setItem('emerald_properties', JSON.stringify(updatedProperties));

    loadRooms();
    setSuccessMessage(`Room "${clonedRoom.name}" cloned successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancelAdd = () => {
    setAddingToPropertyId(null);
    setNewRoomName('');
  };

  const handleOpenRoomSlideout = (room) => {
    setRoomForSlideout(room);
    setIsRoomSlideoutOpen(true);
  };

  const handleArchiveRoom = (propertyId, room) => {
    const existingRooms = JSON.parse(localStorage.getItem(`emerald_rooms_${propertyId}`) || '[]');
    const updatedRooms = existingRooms.filter(r => r.id !== room.id);
    localStorage.setItem(`emerald_rooms_${propertyId}`, JSON.stringify(updatedRooms));
    
    // Update property summary count
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, rooms: Math.max(0, (p.rooms || 0) - 1) } : p
    );
    localStorage.setItem('emerald_properties', JSON.stringify(updatedProperties));

    setArchivedRoomBackup({ propertyId, room });
    setUndoCountdown(100);
    loadRooms();
  };

  const handleUndoArchive = () => {
    if (!archivedRoomBackup) return;
    const { propertyId, room } = archivedRoomBackup;
    const existingRooms = JSON.parse(localStorage.getItem(`emerald_rooms_${propertyId}`) || '[]');
    localStorage.setItem(`emerald_rooms_${propertyId}`, JSON.stringify([...existingRooms, room]));
    
    // Update property summary count
    const properties = JSON.parse(localStorage.getItem('emerald_properties') || '[]');
    const updatedProperties = properties.map(p => 
      p.id === propertyId ? { ...p, rooms: (p.rooms || 0) + 1 } : p
    );
    localStorage.setItem('emerald_properties', JSON.stringify(updatedProperties));

    setArchivedRoomBackup(null);
    setUndoCountdown(0);
    loadRooms();
    setSuccessMessage(`Room "${room.name}" restored!`);
    setTimeout(() => setSuccessMessage(''), 3000);
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

  if (loading) return <div className="p-8 text-center text-slate-500">Loading rooms...</div>;

  const totalProperties = Object.keys(groupedRooms).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rooms</h2>
          <p className="text-sm text-slate-500 mt-1">Manage cleaning units and intervals.</p>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {totalProperties === 0 ? (
        <div className="card p-12 text-center">
          <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No properties found</h3>
          <p className="text-slate-500 mb-6">Create a property first to manage its rooms.</p>
          <Link to="/properties" className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors">
            Go to Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([propertyName, group]) => (
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
                    {group.rooms.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/properties/${group.id}`} 
                    className={cn("flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm border",
                      parseInt(group.theme.slice(1, 3), 16) * 0.299 + parseInt(group.theme.slice(3, 5), 16) * 0.587 + parseInt(group.theme.slice(5, 7), 16) * 0.114 >= 160 
                      ? "bg-white text-slate-800 border-slate-200 hover:bg-slate-50" : "bg-white/10 text-white border-white/20 hover:bg-white/20")}
                  >
                    <Building2 size={14} />
                    <span>Manage Property</span>
                  </Link>
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
                    <span>Add Room</span>
                  </button>
                </div>
              </div>
              {group.rooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No rooms added to this property yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Room Name</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm">Last Cleaned</th>
                        <th className="p-4 font-semibold text-slate-600 text-sm text-right">Action</th>
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
                                placeholder="Enter room name..."
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
                          <td className="p-4 text-slate-400 text-xs italic font-medium uppercase tracking-wider">New Room</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleSaveRoom(group.id)}
                                className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm active:scale-95"
                                title="Save Room"
                              >
                                <Save size={16} />
                              </button>
                              <button 
                                onClick={handleCancelAdd}
                                className="p-1.5 bg-white text-slate-500 rounded-lg hover:bg-slate-50 transition-all shadow-sm border border-slate-200 active:scale-95"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {group.rooms.map(room => (
                        <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3 group">
                              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                                <BedDouble size={16} />
                              </div>
                              <span className="font-medium text-slate-800">{room.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-3 group">
                              <span className="text-slate-500 text-sm whitespace-nowrap">{room.lastCleaned}</span>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleExpressCleaning(room)}
                                  className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-orange-50 rounded hover:bg-orange-100 transition-colors border border-orange-100"
                                  title="Express Cleaning (Immediately)"
                                >
                                  <Zap size={10} />
                                  <span>Express</span>
                                </button>
                                <button 
                                  onClick={() => handleOpenAssignModal(room)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors border border-blue-100"
                                  title="Assign Cleaning Date"
                                >
                                  <Calendar size={10} />
                                  <span>Assign</span>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleOpenRoomSlideout(room)}
                                className="flex items-center space-x-1 text-slate-600 hover:text-slate-800 font-bold text-[10px] uppercase tracking-wider px-2 py-1 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                                title="Cleaning Log"
                              >
                                <History size={12} />
                                <span className="hidden sm:inline">Log</span>
                              </button>
                              <button 
                                onClick={() => handleOpenRoomSlideout(room)}
                                className="text-primary-600 hover:text-primary-800 font-bold text-[10px] uppercase tracking-wider px-2 py-1 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors border border-primary-100"
                              >
                                Manage
                              </button>
                              <button 
                                onClick={() => handleCloneRoom(group.id, room)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Clone Room"
                              >
                                <Copy size={16} />
                              </button>
                              <button 
                                onClick={() => handleArchiveRoom(group.id, room)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Archive Room"
                              >
                                <Archive size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
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
                <p className="text-sm font-bold">Room archived</p>
                <p className="text-xs text-slate-400 font-medium">{archivedRoomBackup.room.name}</p>
              </div>
            </div>
            <button 
              onClick={handleUndoArchive}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all font-bold text-xs active:scale-95 shadow-lg shadow-primary-900/20"
            >
              <RotateCcw size={14} />
              <span>UNDO</span>
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
        title={`Assign Cleaning: ${selectedRoom?.name}`}
      >
        <form onSubmit={handleAssignCleaning} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Target Date</label>
            <input 
              type="date" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              value={assignDate}
              onChange={(e) => setAssignDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Room Detail Slideout */}
      <Slideout 
        isOpen={isRoomSlideoutOpen} 
        onClose={() => setIsRoomSlideoutOpen(false)}
        title="Room Management"
      >
        {roomForSlideout && (
          <RoomDetail 
            roomId={roomForSlideout.id} 
            isSlideout={true} 
            propertyName={roomForSlideout.property}
          />
        )}
      </Slideout>
    </div>
  );
}
