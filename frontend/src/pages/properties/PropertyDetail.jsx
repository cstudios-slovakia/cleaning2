import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BedDouble, Plus, Save, Clock, X, Trash2, Copy, Archive } from 'lucide-react';
import Slideout from '../../components/Slideout';
import RoomDetail from '../rooms/RoomDetail';

export default function PropertyDetail() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutRoomId, setSlideoutRoomId] = useState(null);
  
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
          coverImage: ''
        };
      }
    }
    
    return {
      name: 'Emerald Grand',
      scheduleTime: '10:00 AM',
      theme: '#0ea5e9',
      coverImage: ''
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
    setPropertyData({ ...editForm });
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
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
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
            <p className="text-sm text-slate-500">Property details and settings</p>
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
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="font-medium text-slate-900">{propertyData.name}</p>
                )}
              </div>
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
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Color Theme</p>
                <div className="mt-2">
                  {isEditing ? (
                    <div className="flex items-center space-x-3">
                      <input 
                        type="color" 
                        value={editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}
                        onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                        className="h-8 w-16 cursor-pointer rounded border border-slate-200 p-0 shadow-sm bg-white"
                      />
                      <span className="text-sm font-medium text-slate-500 uppercase">{editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full shadow-sm border border-slate-200" 
                        style={{ backgroundColor: propertyData.theme.startsWith('#') ? propertyData.theme : '#0ea5e9' }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700 uppercase">{propertyData.theme.startsWith('#') ? propertyData.theme : '#0ea5e9'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cover Image URL</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editForm.coverImage || ''}
                    onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                    className="w-full font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  propertyData.coverImage ? (
                    <div className="mt-2">
                      <img src={propertyData.coverImage} alt="Cover" className="w-full h-32 object-cover rounded-xl shadow-sm border border-slate-100" />
                    </div>
                  ) : (
                    <p className="font-medium text-slate-500 italic text-sm mt-1">No cover image set</p>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2"><BedDouble size={18} className="text-slate-400"/> <span>Rooms</span></h3>
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
                      <input 
                        type="text" 
                        value={manager.name}
                        onChange={(e) => handleManagerChange(manager.id, e.target.value)}
                        placeholder="Manager Name"
                        className="flex-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus={manager.name === ''}
                      />
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
                      <input 
                        type="text" 
                        value={cleaner.name}
                        onChange={(e) => handleCleanerChange(cleaner.id, e.target.value)}
                        placeholder="Cleaner Name"
                        className="flex-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus={cleaner.name === ''}
                      />
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
    </div>
  );
}



