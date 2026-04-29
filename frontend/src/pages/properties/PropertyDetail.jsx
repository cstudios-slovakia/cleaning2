import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BedDouble, Plus, Save, Clock } from 'lucide-react';
import Modal from '../../components/Modal';

export default function PropertyDetail() {
  const { id } = useParams();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
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
          theme: 'blue'
        };
      }
    }
    
    return {
      name: 'Emerald Grand',
      scheduleTime: '10:00 AM',
      theme: 'blue'
    };
  });

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem(`emerald_rooms_${id}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: 101, name: 'Room 101' },
      { id: 102, name: 'Lobby' },
    ];
  });

  const [editForm, setEditForm] = useState({ ...propertyData });
  const [newRoomName, setNewRoomName] = useState('');

  // Persist changes
  useEffect(() => {
    localStorage.setItem(`emerald_property_${id}`, JSON.stringify(propertyData));
  }, [propertyData, id]);

  useEffect(() => {
    localStorage.setItem(`emerald_rooms_${id}`, JSON.stringify(rooms));
  }, [rooms, id]);

  const handleUpdateProperty = (e) => {
    e.preventDefault();
    setPropertyData({ ...editForm });
    setIsEditModalOpen(false);
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    const newRoom = {
      id: Date.now(),
      name: newRoomName
    };
    
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    setIsRoomModalOpen(false);
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{propertyData.name}</h2>
            <p className="text-sm text-slate-500">Property details and settings</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditForm({ ...propertyData });
            setIsEditModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
        >
          <Edit2 size={16} />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">General Info</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-slate-900">{propertyData.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Default Schedule Time</p>
                <p className="font-medium text-slate-900">{propertyData.scheduleTime}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Color Theme</p>
                <div className="flex space-x-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 shadow-sm border border-slate-200"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 shadow-sm border border-slate-200"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-0">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2"><BedDouble size={18} className="text-slate-400"/> <span>Rooms</span></h3>
              <button 
                onClick={() => setIsRoomModalOpen(true)}
                className="flex items-center space-x-1 text-sm text-primary-600 font-bold hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} />
                <span>Add Room</span>
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {rooms.map(room => (
                <div key={room.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="font-medium text-slate-700">{room.name}</span>
                  <Link to={`/rooms/${room.id}`} className="text-sm px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Manage</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2"><Users size={16} className="text-slate-400"/> <span>Personnel</span></h3>
            
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Managers</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">JD</div>
                  <span className="text-sm font-medium text-slate-700">John Doe</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cleaners</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">MG</div>
                  <span className="text-sm font-medium text-slate-700">Maria Garcia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">AN</div>
                  <span className="text-sm font-medium text-slate-700">Anna Novak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Property Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Property"
      >
        <form onSubmit={handleUpdateProperty} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Property Name</label>
            <input 
              type="text" 
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Default Schedule Time</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={editForm.scheduleTime}
                onChange={(e) => setEditForm({ ...editForm, scheduleTime: e.target.value })}
                placeholder="e.g. 10:00 AM"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Room Modal */}
      <Modal 
        isOpen={isRoomModalOpen} 
        onClose={() => setIsRoomModalOpen(false)} 
        title="Add New Room"
      >
        <form onSubmit={handleAddRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Room Name / Number</label>
            <input 
              type="text" 
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="e.g. Room 204 or Lobby"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm"
            >
              Add Room
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


