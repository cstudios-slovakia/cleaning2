import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BedDouble, Plus } from 'lucide-react';
import Modal from '../../components/Modal';

export default function PropertyDetail() {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [rooms, setRooms] = useState([
    { id: 101, name: 'Room 101' },
    { id: 102, name: 'Lobby' },
  ]);

  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    const newRoom = {
      id: Date.now(),
      name: newRoomName
    };
    
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Emerald Grand</h2>
            <p className="text-sm text-slate-500">Property details and settings</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm">
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
                <p className="font-medium text-slate-900">Emerald Grand</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Default Schedule Time</p>
                <p className="font-medium text-slate-900">10:00 AM</p>
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
                onClick={() => setIsModalOpen(true)}
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
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
              onClick={() => setIsModalOpen(false)}
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

