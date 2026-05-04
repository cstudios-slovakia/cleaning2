import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BedDouble, Plus, Save, Clock, X, Trash2, Copy, Archive, History, CheckCircle, Settings, AlertTriangle, Calendar, Zap } from 'lucide-react';
import Slideout from '../../components/Slideout';
import Modal from '../../components/Modal';
import RoomDetail from '../rooms/RoomDetail';
import AssignmentDetail from '../assignments/AssignmentDetail';
import { saveAssignment, fetchUsers, fetchRoomDetails } from '../../lib/api';

export default function PropertyDetail() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [slideoutRoomId, setSlideoutRoomId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [isAssignmentSlideoutOpen, setIsAssignmentSlideoutOpen] = useState(false);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const isAssignmentDone = (id) => {
    const saved = localStorage.getItem(`cleaner_assignment_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!parsed.doneBy;
    }
    return false;
  };
  
  const [propertyData, setPropertyData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [managers, setManagers] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState(null);
  const [editRooms, setEditRooms] = useState([]);
  const [editManagers, setEditManagers] = useState([]);
  const [editCleaners, setEditCleaners] = useState([]);
  
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { fetchProperties, fetchRooms, fetchUsers } = await import('../../lib/api');
        
        const [properties, usersData] = await Promise.all([
          fetchProperties(),
          fetchUsers()
        ]);
        
        setAvailableUsers(usersData);
        
        const p = properties.find(x => x.id.toString() === id.toString());
        
        if (p) {
          const completePropertyData = {
            name: 'Unknown Property',
            scheduleTime: '10:00 AM',
            theme: '#0ea5e9',
            coverImage: null,
            logo: null,
            ...p
          };
          setPropertyData(completePropertyData);
          setEditForm(completePropertyData);
          setManagers(p.managers || []);
          setEditManagers(p.managers || []);
          setCleaners(p.cleaners || []);
          setEditCleaners(p.cleaners || []);
        } else {
          const defaultData = { name: 'Unknown Property', scheduleTime: '10:00 AM', theme: '#0ea5e9', coverImage: null, logo: null };
          setPropertyData(defaultData);
          setEditForm(defaultData);
        }

        const roomData = await fetchRooms(id);
        setRooms(roomData);
        setEditRooms(roomData);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load property details', e);
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdateProperty = async () => {
    const updatedData = { 
      ...editForm,
      id,
      managers: editManagers.filter(m => (m.name || '').trim() !== ''),
      cleaners: editCleaners.filter(c => (c.name || '').trim() !== '')
    };
    
    try {
      const { saveProperty, saveRoom, deleteRoom } = await import('../../lib/api');
      await saveProperty(updatedData);
      
      setPropertyData(updatedData);
      setManagers(updatedData.managers);
      setCleaners(updatedData.cleaners);

      // Handle rooms
      const validRooms = editRooms.filter(r => r.name.trim() !== '');
      for (const r of validRooms) {
        await saveRoom({
          id: r.id || Date.now().toString(),
          property_id: id,
          name: r.name,
          intervalDays: r.intervalDays || 0,
          lastCleaned: r.lastCleaned || 'Never'
        });
      }

      // Refresh rooms from server to ensure IDs match
      const { fetchRooms } = await import('../../lib/api');
      const freshRooms = await fetchRooms(id);
      setRooms(freshRooms);
      setEditRooms(freshRooms);

      setIsEditing(false);
      setSuccessMessage('Property updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to update property', e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading property details...</div>;


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
    const savedRoomDetails = localStorage.getItem(`cleaner_room_${room.id}`);
    if (savedRoomDetails) {
      const clonedDetails = JSON.parse(savedRoomDetails);
      clonedDetails.name = newRoom.name;
      localStorage.setItem(`cleaner_room_${newRoom.id}`, JSON.stringify(clonedDetails));
    }
  };

  const handleArchiveRoom = (roomId) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleAssignCleaning = async (e) => {
    e.preventDefault();
    if (!assignDate || !assignRoomId) return;

    const room = rooms.find(r => r.id.toString() === assignRoomId.toString());
    if (!room) return;

    try {
      const roomData = await fetchRoomDetails(room.id);
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
      };

      await saveAssignment(newAssignment);
      setIsAssignModalOpen(false);
      setAssignDate('');
      setAssignRoomId('');
      setSuccessMessage(`Cleaning assigned for ${room.name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to create assignment', err);
    }
  };

  const handleExpressCleaning = async () => {
    if (rooms.length === 0) {
      setSuccessMessage('No rooms available to clean');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    if (rooms.length === 1) {
      const room = rooms[0];
      try {
        const roomData = await fetchRoomDetails(room.id);
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
        };
        
        await saveAssignment(newAssignment);
        
        // Trigger push notification to assigned cleaners
        const { sendPushNotification } = await import('../../lib/api');
        sendPushNotification('flash', id);

        setSuccessMessage(`Express cleaning started for ${room.name}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Failed to start express cleaning', err);
      }
    } else {
      setAssignDate(new Date().toISOString().split('T')[0]);
      setIsAssignModalOpen(true);
    }
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
      {/* Hero Section with Cover Image */}
      {(isEditing ? editForm.coverImage : propertyData.coverImage) && (
        <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg mb-6 group">
          <img 
            src={isEditing ? editForm.coverImage : propertyData.coverImage} 
            alt="Property Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
            <div className="flex items-center space-x-4">
              {(isEditing ? editForm.logo : propertyData.logo) && (
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl p-2 flex-shrink-0">
                  <img src={isEditing ? editForm.logo : propertyData.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">{isEditing ? editForm.name : propertyData.name}</h1>
                <p className="text-slate-200 font-medium">{isEditing ? 'Editing Property' : 'Property Dashboard'}</p>
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
                          value={typeof editForm.theme === 'string' && editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}
                          onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                          className="h-8 w-16 cursor-pointer rounded border border-slate-200 p-0 shadow-sm bg-white"
                        />
                        <span className="text-sm font-medium text-slate-500 uppercase">
                          {typeof editForm.theme === 'string' && editForm.theme.startsWith('#') ? editForm.theme : '#0ea5e9'}
                        </span>
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
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <CheckCircle size={18} className="text-slate-400"/> 
                  <span>Cleaning Assignments</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleExpressCleaning}
                    className="flex items-center space-x-1.5 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-lg uppercase tracking-wider hover:bg-orange-100 transition-colors"
                  >
                    <Zap size={12} />
                    <span>Express</span>
                  </button>
                  <button 
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center space-x-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg uppercase tracking-wider hover:bg-blue-100 transition-colors"
                  >
                    <Calendar size={12} />
                    <span>Assign</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {String(propertyData.id) === '1' ? (
                  <>
                    {!isAssignmentDone('1') && (
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
                    )}
                    {!isAssignmentDone('3') && (
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
                    )}
                    {!isAssignmentDone('4') && (
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
                    )}
                    {(isAssignmentDone('1') && isAssignmentDone('3') && isAssignmentDone('4')) && (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        All cleaning assignments for this property are complete.
                      </div>
                    )}
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
                        {availableUsers.filter(u => u.role === 'manager' || u.role === 'admin').map(u => (
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
                        {availableUsers.filter(u => u.role === 'cleaner').map(u => (
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
                  {log.type === 'check' && <CheckCircle size={16} className="text-green-500" />}
                  {log.type === 'complete' && <CheckCircle size={16} className="text-green-500" />}
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

      {/* Assign Cleaning Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Schedule Cleaning Assignment"
      >
        <form onSubmit={handleAssignCleaning} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Room</label>
              <select 
                required
                value={assignRoomId}
                onChange={(e) => setAssignRoomId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium appearance-none"
              >
                <option value="">Choose a room...</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Date</label>
              <input 
                type="date" 
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
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

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle size={20} />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}
    </div>
  );
}



