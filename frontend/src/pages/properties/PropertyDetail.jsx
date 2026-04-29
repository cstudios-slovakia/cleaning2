import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BedDouble, Plus, Save, Clock, X, Trash2, Copy, Archive, History, CheckCircle, Settings, AlertTriangle } from 'lucide-react';
import Slideout from '../../components/Slideout';
import RoomDetail from '../rooms/RoomDetail';
import AssignmentDetail from '../assignments/AssignmentDetail';

const AVAILABLE_USERS = [
  { id: 'u1', name: 'John Doe', role: 'manager' },
  { id: 'u2', name: 'Sarah Smith', role: 'manager' },
  { id: 'u3', name: 'Mike Johnson', role: 'manager' },
  { id: 'u4', name: 'Maria Garcia', role: 'cleaner' },
  { id: 'u5', name: 'Anna Novak', role: 'cleaner' },
  { id: 'u6', name: 'David Chen', role: 'cleaner' },
  { id: 'u7', name: 'Elena Rodriguez', role: 'cleaner' },
];

export default function PropertyDetail() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutRoomId, setSlideoutRoomId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [isAssignmentSlideoutOpen, setIsAssignmentSlideoutOpen] = useState(false);
  
  // Local state for property data
  const [propertyData, setPropertyData] = useState(() => {
    const saved = localStorage.getItem(`emerald_property_${id}`);
    if (saved) return JSON.parse(saved);
    
    const savedList = localStorage.getItem('emerald_properties');
    if (savedList) {
      const properties = JSON.parse(savedList);
      const prop = properties.find(p => p.id.toString() === id.toString());
      if (prop) {
        return {
          name: prop.name,
          scheduleTime: '10:00 AM',
          theme: '#0ea5e9',
          coverImage: '',
          logo: ''
        };
      }
    }
    
    return {
      name: 'Emerald Grand',
      scheduleTime: '10:00 AM',
      theme: '#0ea5e9',
      coverImage: '',
      logo: ''
    };
  });

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem(`emerald_rooms_${id}`);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [managers, setManagers] = useState(() => {
    const saved = localStorage.getItem(`emerald_managers_${id}`);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [cleaners, setCleaners] = useState(() => {
    const saved = localStorage.getItem(`emerald_cleaners_${id}`);
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [editForm, setEditForm] = useState({ ...propertyData });
  const [editRooms, setEditRooms] = useState([...rooms]);
  const [editManagers, setEditManagers] = useState([...managers]);
  const [editCleaners, setEditCleaners] = useState([...cleaners]);

  // Persist changes
  useEffect(() => {
    localStorage.setItem(`emerald_property_${id}`, JSON.stringify(propertyData));
  }, [propertyData, id]);

  useEffect(() => {
    localStorage.setItem(`emerald_rooms_${id}`, JSON.stringify(rooms));
  }, [rooms, id]);

  useEffect(() => {
    localStorage.setItem(`emerald_managers_${id}`, JSON.stringify(managers));
  }, [managers, id]);

  useEffect(() => {
    localStorage.setItem(`emerald_cleaners_${id}`, JSON.stringify(cleaners));
  }, [cleaners, id]);

  const handleUpdateProperty = () => {
    const updatedData = { ...editForm };
    setPropertyData(updatedData);
    
    // Update global list for PropertyList view
    const savedList = localStorage.getItem('emerald_properties');
    let properties = savedList ? JSON.parse(savedList) : [];
    
    const index = properties.findIndex(p => p.id.toString() === id.toString());
    const propertySummary = {
      id: properties[index]?.id || (isNaN(id) ? id : Number(id)),
      name: updatedData.name,
      logo: updatedData.logo,
      coverImage: updatedData.coverImage,
      rooms: editRooms.filter(r => r.name.trim() !== '').length,
      managers: editManagers.filter(m => m.name.trim() !== '').length
    };

    if (index !== -1) {
      properties[index] = propertySummary;
    } else {
      properties.push(propertySummary);
    }
    localStorage.setItem('emerald_properties', JSON.stringify(properties));

    // Save rooms from edit state as well
    setRooms([...editRooms].filter(r => r.name.trim() !== ''));
    setManagers([...editManagers].filter(m => m.name.trim() !== ''));
    setCleaners([...editCleaners].filter(c => c.name.trim() !== ''));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...propertyData });
    setEditRooms([...rooms]);
    setEditManagers([...managers]);
    setEditCleaners([...cleaners]);
    setIsEditing(false);
  };

  const handleAddRoomInline = () => {
    setEditRooms([...editRooms, { id: Date.now(), name: '' }]);
  };

  const handleRoomChange = (roomId, newName) => {
    setEditRooms(editRooms.map(r => r.id === roomId ? { ...r, name: newName } : r));
  };

  const handleRoomDelete = (roomId) => {
    setEditRooms(editRooms.filter(r => r.id !== roomId));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  const handleAddManagerInline = () => {
    setEditManagers([...editManagers, { id: Date.now(), name: '', initials: '?' }]);
  };

  const handleManagerChange = (id, newName) => {
    setEditManagers(editManagers.map(m => m.id === id ? { ...m, name: newName, initials: getInitials(newName) } : m));
  };

  const handleManagerDelete = (id) => {
    setEditManagers(editManagers.filter(m => m.id !== id));
  };

  const handleAddCleanerInline = () => {
    setEditCleaners([...editCleaners, { id: Date.now(), name: '', initials: '?' }]);
  };

  const handleCleanerChange = (id, newName) => {
    setEditCleaners(editCleaners.map(c => c.id === id ? { ...c, name: newName, initials: getInitials(newName) } : c));
  };

  const handleCleanerDelete = (id) => {
    setEditCleaners(editCleaners.filter(c => c.id !== id));
  };

  const handleCloneRoom = (room) => {
    const newRoom = { ...room, id: Date.now(), name: `${room.name} (Copy)` };
    setRooms([...rooms, newRoom]);
    // Also clone the room details if they exist
    const savedRoomDetails = localStorage.getItem(`emerald_room_${room.id}`);
    if (savedRoomDetails) {
      const clonedDetails = JSON.parse(savedRoomDetails);
      clonedDetails.name = newRoom.name;
      localStorage.setItem(`emerald_room_${newRoom.id}`, JSON.stringify(clonedDetails));
    }
  };

  const handleArchiveRoom = (roomId) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEditForm(prev => ({ ...prev, [field]: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Section with Cover Image - ONLY VISIBLE DURING EDITING */}
      {isEditing && editForm.coverImage && (
        <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg mb-6 group">
          <img 
            src={editForm.coverImage} 
            alt="Property Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
            <div className="flex items-center space-x-4">
              {editForm.logo && (
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl p-2 flex-shrink-0">
                  <img src={editForm.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">{editForm.name}</h1>
                <p className="text-slate-200 font-medium">Editing Property</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div className="flex items-center space-x-3">
            {propertyData.logo && !isEditing && (
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-slate-100 p-1">
                <img src={propertyData.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
                  placeholder="Property Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-800">{propertyData.name}</h2>
              )}
              <p className="text-sm text-slate-500">Property details and assignments</p>
            </div>
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
                onClick={handleUpdateProperty}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
              >
                <Save size={16} />
                <span className="hidden sm:inline">Save Changes</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setEditForm({ ...propertyData });
                setEditRooms([...rooms]);
                setIsEditing(true);
              }}
              className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
            >
              <Edit2 size={16} />
              <span>Edit Property</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">General Info</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Default Schedule Time</p>
                {isEditing ? (
                  <div className="relative">
                    <Clock size={16} className="absolute left-2.5 top-2 text-slate-400" />
                    <input 
                      type="text" 
                      value={editForm.scheduleTime}
                      onChange={(e) => setEditForm({ ...editForm, scheduleTime: e.target.value })}
                      className="w-full font-medium text-slate-900 bg-white border border-slate-200 rounded-lg pl-8 pr-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                ) : (
                  <p className="font-medium text-slate-900">{propertyData.scheduleTime}</p>
                )}
              </div>
              
              {isEditing && (
                <>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Color Theme</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-3">
                        <input 
                          type="color" 
                          value={editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}
                          onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                          className="h-8 w-16 cursor-pointer rounded border border-slate-200 p-0 shadow-sm bg-white"
                        />
                        <span className="text-sm font-medium text-slate-500 uppercase">{editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Property Logo</p>
                    <div className="flex items-center space-x-4 mt-2">
                      {editForm.logo && (
                        <img src={editForm.logo} alt="Logo Preview" className="w-12 h-12 object-contain bg-slate-50 border border-slate-200 rounded-lg" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cover Image</p>
                    <div className="space-y-3 mt-2">
                      {editForm.coverImage && (
                        <img src={editForm.coverImage} alt="Cover Preview" className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-100" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'coverImage')}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {!isEditing && (
            <div className="card">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <CheckCircle size={18} className="text-slate-400"/> 
                  <span>Cleaning Assignments</span>
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {String(propertyData.id) === '1' ? (
                  <>
                    <div className="p-4 bg-orange-50/50">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Overdue</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setSelectedAssignmentId('1'); setIsAssignmentSlideoutOpen(true); }}
                          className="w-full flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm hover:bg-orange-50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-bold text-slate-800">Lobby</p>
                            <p className="text-xs text-slate-500">Scheduled: Yesterday 10:00 AM</p>
                          </div>
                          <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg uppercase">Overdue</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50/50">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Today</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setSelectedAssignmentId('3'); setIsAssignmentSlideoutOpen(true); }}
                          className="w-full flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-bold text-slate-800">Room 101</p>
                            <p className="text-xs text-slate-500">Scheduled: 10:00 AM</p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg uppercase">Due</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming</p>
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setSelectedAssignmentId('4'); setIsAssignmentSlideoutOpen(true); }}
                          className="w-full flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div>
                            <p className="font-bold text-slate-700">Room 102</p>
                            <p className="text-xs text-slate-500">Scheduled: Tomorrow 10:00 AM</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No active cleaning assignments for this property.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2"><BedDouble size={18} className="text-slate-400"/> <span>Rooms Management</span></h3>
              {isEditing && (
                <button 
                  onClick={handleAddRoomInline}
                  className="flex items-center space-x-1 text-sm text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Room</span>
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {isEditing ? (
                editRooms.map(room => (
                  <div key={room.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <input 
                      type="text" 
                      value={room.name}
                      onChange={(e) => handleRoomChange(room.id, e.target.value)}
                      placeholder="Room Name (e.g. Room 101)"
                      className="flex-1 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 mr-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus={room.name === ''}
                    />
                    <button 
                      onClick={() => handleRoomDelete(room.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                rooms.map(room => (
                  <div key={room.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-slate-700">{room.name}</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleCloneRoom(room)} className="text-slate-400 hover:text-primary-600 transition-colors" title="Clone">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => handleArchiveRoom(room.id)} className="text-slate-400 hover:text-amber-600 transition-colors" title="Archive">
                        <Archive size={16} />
                      </button>
                      <button 
                        onClick={() => { setSlideoutRoomId(room.id); setIsSlideoutOpen(true); }}
                        className="text-sm px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!isEditing && rooms.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No rooms added yet. Click Edit Property to add rooms.
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <History size={16} className="text-slate-400"/> 
                <span>Property Logs</span>
              </h3>
              <div className="space-y-4">
                {[
                  { time: '10:15 AM', action: 'Lobby cleaning started', user: 'Maria Garcia' },
                  { time: '09:45 AM', action: 'Room 101 inspection passed', user: 'John Doe' },
                  { time: '08:30 AM', action: 'New schedule generated', user: 'System' }
                ].map((log, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                    <div>
                      <p className="text-slate-700 font-medium">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.time} • {log.user}</p>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="text-sm text-primary-600 font-bold hover:underline w-full text-left"
                >
                  View full history →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-slate-400"/> 
                <span>Personnel</span>
              </div>
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Managers</p>
                {isEditing && (
                  <button 
                    onClick={handleAddManagerInline}
                    className="flex items-center space-x-1 text-xs text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {isEditing ? (
                  editManagers.map(manager => (
                    <div key={manager.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {manager.initials}
                      </div>
                      <select 
                        value={manager.name}
                        onChange={(e) => handleManagerChange(manager.id, e.target.value)}
                        className="flex-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Manager...</option>
                        {AVAILABLE_USERS.filter(u => u.role === 'manager').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleManagerDelete(manager.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  managers.map(manager => (
                    <div key={manager.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                        {manager.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{manager.name}</span>
                    </div>
                  ))
                )}
                {!isEditing && managers.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No managers assigned</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cleaners</p>
                {isEditing && (
                  <button 
                    onClick={handleAddCleanerInline}
                    className="flex items-center space-x-1 text-xs text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {isEditing ? (
                  editCleaners.map(cleaner => (
                    <div key={cleaner.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {cleaner.initials}
                      </div>
                      <select 
                        value={cleaner.name}
                        onChange={(e) => handleCleanerChange(cleaner.id, e.target.value)}
                        className="flex-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select Cleaner...</option>
                        {AVAILABLE_USERS.filter(u => u.role === 'cleaner').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleCleanerDelete(cleaner.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  cleaners.map(cleaner => (
                    <div key={cleaner.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                        {cleaner.initials}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{cleaner.name}</span>
                    </div>
                  ))
                )}
                {!isEditing && cleaners.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No cleaners assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Slideout 
        isOpen={isSlideoutOpen} 
        onClose={() => {
          setIsSlideoutOpen(false);
          // Optional: Delay setting to null to allow close animation to finish smoothly
          setTimeout(() => setSlideoutRoomId(null), 300);
        }} 
        title="Manage Room"
        width="max-w-4xl"
      >
        {slideoutRoomId && (
          <RoomDetail 
            roomId={slideoutRoomId} 
            isSlideout={true} 
            propertyName={propertyData.name} 
          />
        )}
      </Slideout>

      <Slideout 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        title="Full Property Logs"
        width="max-w-2xl"
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800">Log History</h4>
            <span className="text-sm text-slate-500">Showing last 30 days</span>
          </div>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {[
              { date: 'Today', time: '10:15 AM', action: 'Lobby cleaning started', user: 'Maria Garcia', type: 'start' },
              { date: 'Today', time: '09:45 AM', action: 'Room 101 inspection passed', user: 'John Doe', type: 'check' },
              { date: 'Today', time: '08:30 AM', action: 'New schedule generated', user: 'System', type: 'system' },
              { date: 'Yesterday', time: '16:00 PM', action: 'All cleanings completed', user: 'System', type: 'complete' },
              { date: 'Yesterday', time: '14:30 PM', action: 'Room 102 cleaning finished', user: 'Anna Novak', type: 'complete' },
              { date: 'Yesterday', time: '09:00 AM', action: 'Cleaning staff checked in', user: 'Maria Garcia, Anna Novak', type: 'login' },
              { date: 'Oct 24', time: '11:20 AM', action: 'Room 105 maintenance requested', user: 'John Doe', type: 'alert' },
              { date: 'Oct 24', time: '10:00 AM', action: 'Schedule updated', user: 'Sarah Smith', type: 'system' },
            ].map((log, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {log.type === 'start' && <Clock size={16} className="text-blue-500" />}
                  {log.type === 'check' && <CheckCircle size={16} className="text-emerald-500" />}
                  {log.type === 'complete' && <CheckCircle size={16} className="text-emerald-500" />}
                  {log.type === 'system' && <Settings size={16} className="text-slate-500" />}
                  {log.type === 'login' && <Users size={16} className="text-purple-500" />}
                  {log.type === 'alert' && <AlertTriangle size={16} className="text-orange-500" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{log.date} {log.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">By {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slideout>

      <Slideout 
        isOpen={isAssignmentSlideoutOpen} 
        onClose={() => setIsAssignmentSlideoutOpen(false)} 
        title="Cleaning Assignment"
        width="max-w-2xl"
      >
        {selectedAssignmentId && (
          <AssignmentDetail 
            assignmentId={selectedAssignmentId} 
            isSlideout={true} 
            theme={propertyData.theme}
            coverImage={propertyData.coverImage}
          />
        )}
      </Slideout>
    </div>
  );
}



