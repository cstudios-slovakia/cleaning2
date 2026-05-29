import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Archive, Building2, History } from 'lucide-react';
import Modal from '../../components/Modal';
import { fetchProperties, saveProperty, deleteProperty, saveRoom } from '../../lib/api';
import { useTranslation } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

export default function PropertyList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [quickRoomsText, setQuickRoomsText] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await fetchProperties();
      
      const filteredProperties = user?.role === 'manager'
        ? data.filter(p => p.managers?.some(m => m.name === user.name))
        : data;
        
      setProperties(filteredProperties);
    } catch (e) {
      console.error('Failed to load properties', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    const propId = Date.now().toString();
    const newProp = {
      id: propId,
      name: newPropName,
      scheduleTime: '10:00 AM',
      theme: '#0ea5e9',
      coverImage: null,
      logo: null
    };

    try {
      await saveProperty(newProp);

      // Parse and Save Quick Rooms & Tasks
      if (quickRoomsText.trim()) {
        const lines = quickRoomsText.split('\n');
        const roomsMap = {};

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const parts = trimmed.split('>').map(p => p.trim());
          if (parts.length === 1) {
            const roomName = parts[0];
            if (!roomsMap[roomName]) roomsMap[roomName] = ['Clean room'];
          } else if (parts.length === 2) {
            const roomName = parts[0];
            const tasks = parts[1].split('+').map(t => t.trim()).filter(Boolean);
            if (!roomsMap[roomName]) roomsMap[roomName] = [];
            roomsMap[roomName].push(...tasks);
          } else if (parts.length >= 3) {
            const roomName = parts[0];
            const groupName = parts[1];
            const tasks = parts[2].split('+').map(t => t.trim()).filter(Boolean);
            if (!roomsMap[roomName]) roomsMap[roomName] = [];
            // Prefix tasks with the group name to satisfy grouped tasks
            const groupedTasks = tasks.map(t => `${groupName} > ${t}`);
            roomsMap[roomName].push(...groupedTasks);
          }
        }

        // Save each room sequentially
        for (const [roomName, tasksList] of Object.entries(roomsMap)) {
          const roomId = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const roomObj = {
            id: roomId,
            property_id: propId,
            name: roomName,
            intervalDays: 0,
            lastCleaned: 'Never',
            taskSets: [
              {
                id: `ts_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                title: 'Quick Clean',
                intervalDays: 0,
                isOnce: false,
                isQuickClean: true,
                tasks: tasksList.map((taskText, idx) => ({
                  id: `t_${Date.now()}_${idx}`,
                  text: taskText
                }))
              }
            ]
          };

          await saveRoom(roomObj);
        }
      }

      await loadProperties();
      setNewPropName('');
      setQuickRoomsText('');
      setIsModalOpen(false);
    } catch (e) {
      console.error('Failed to add property & quick rooms', e);
    }
  };

  const handleDelete = async (prop) => {
    if (window.confirm(t('properties.archive_confirm', { name: prop.name }))) {
      try {
        await deleteProperty(prop.id);
        await loadProperties();
      } catch (e) {
        console.error('Failed to delete property', e);
      }
    }
  };

  const isSuperOrOwner = user && ['admin', 'superadmin', 'subadmin', 'owner'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('properties.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('properties.subtitle')}</p>
        </div>
        {isSuperOrOwner && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} />
            <span>{t('properties.new_property')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(properties || []).map(prop => (
          <div key={prop.id} className="card hover:shadow-md transition-shadow group overflow-hidden flex flex-col">
            <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
              {prop.coverImage ? (
                <img src={prop.coverImage} alt={prop.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 font-bold text-lg">{prop.name.charAt(0)}</span>
              )}
              
              {prop.logo && (
                <div className="absolute bottom-2 left-2 w-10 h-10 bg-white rounded-lg shadow-md p-1 z-10">
                  <img src={prop.logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              
              {isSuperOrOwner && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(prop);
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-white rounded-lg shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                  title={t('properties.archive_tooltip')}
                >
                  <Archive size={16} />
                </button>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-800">{prop.name}</h3>
              <div className="flex space-x-4 mt-2 mb-4 text-sm text-slate-500">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{prop.rooms}</span>
                  <span className="text-xs uppercase tracking-wider">{t('properties.rooms_count')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">{prop.managers ? prop.managers.length : 0}</span>
                  <span className="text-xs uppercase tracking-wider">{t('properties.managers_count')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/properties/${prop.id}/logs`}
                  style={{ backgroundColor: prop.theme || '#0ea5e9' }}
                  className="flex items-center justify-center text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                  title={t('properties.logs_tooltip')}
                >
                  <History size={18} />
                </Link>
                <Link 
                  to={`/properties/${prop.id}`} 
                  className="flex-1 text-center bg-slate-50 hover:bg-slate-100 text-primary-600 font-medium px-4 py-2 rounded-xl transition-colors border border-slate-200"
                >
                  {t('properties.manage_property')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={t('properties.add_property')}
      >
        <form onSubmit={handleAddProperty} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('properties.property_name')}</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                placeholder={t('properties.property_name_placeholder')}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Quick Add Rooms & Tasks</label>
            <textarea
              value={quickRoomsText}
              onChange={(e) => setQuickRoomsText(e.target.value)}
              placeholder="Format:&#10;Room 101 > Kitchen > Clean counters + check trash&#10;Room 101 > Bed > Change sheets&#10;Room 102 > Vacuum floor&#10;Lobby"
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-xs h-32"
            />
            <p className="text-[10px] text-slate-400 mt-1">One room definition per line. Use `&gt;` to group tasks and `+` to separate multiple tasks on a line.</p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={() => {
                setNewPropName('');
                setQuickRoomsText('');
                setIsModalOpen(false);
              }}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm"
            >
              {t('properties.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
