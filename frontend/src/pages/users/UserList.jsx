import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, ShieldAlert, Trash2, X, Save, Building } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchUsers, saveUser, deleteUser, fetchProperties } from '../../lib/api';
import Modal from '../../components/Modal';
import { useTranslation } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

export default function UserList() {
  const [activeTab, setActiveTab] = useState('cleaners');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLang } = useTranslation();
  const { user } = useAuth();

  const formatLastSeen = (lastActive) => {
    if (!lastActive || lastActive === 'Never' || lastActive === 'Nikdy') {
      return t('rooms.never');
    }
    try {
      const d = new Date(lastActive);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString(currentLang === 'sk' ? 'sk-SK' : 'en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch(e) {}
    return lastActive;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, propsData] = await Promise.all([
        fetchUsers(),
        fetchProperties()
      ]);
      setUsers(usersData);
      setProperties(propsData);
    } catch (e) {
      console.error('Failed to load users & properties', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cleaners = (users || []).filter(u => u.role === 'cleaner');
  const managers = (users || []).filter(u => u.role !== 'cleaner');
  const activeUsers = activeTab === 'cleaners' ? cleaners : managers;

  const handleOpenModal = (selectedUser = null) => {
    if (selectedUser) {
      setEditUser({ 
        ...selectedUser,
        propertyIds: selectedUser.propertyIds || []
      });
    } else {
      setEditUser({
        id: '',
        name: '',
        username: '',
        email: '',
        password: '',
        role: activeTab === 'cleaners' ? 'cleaner' : 'manager',
        status: 'active',
        language: 'en',
        propertyIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser.name.trim()) return;

    // Validation: Cleaners must have at least one assigned property
    if (editUser.role === 'cleaner' && (!editUser.propertyIds || editUser.propertyIds.length === 0)) {
      alert("Cleaner must be assigned to at least one property!");
      return;
    }

    try {
      await saveUser({
        ...editUser,
        id: editUser.id || Date.now().toString(),
        lastActive: editUser.lastActive || 'Never'
      });
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('users.delete_confirm'))) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const togglePropertyAssignment = (propId) => {
    const currentProps = editUser.propertyIds || [];
    if (currentProps.includes(propId)) {
      setEditUser({
        ...editUser,
        propertyIds: currentProps.filter(id => id !== propId)
      });
    } else {
      setEditUser({
        ...editUser,
        propertyIds: [...currentProps, propId]
      });
    }
  };

  // Helper to render property badges
  const renderPropertyBadges = (u) => {
    const userPropIds = u.propertyIds || [];
    if (userPropIds.length === 0) {
      return <span className="text-xs text-slate-400 italic">Unassigned</span>;
    }
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {userPropIds.map(pId => {
          const prop = properties.find(p => p.id.toString() === pId.toString());
          if (!prop) return null;
          return (
            <span 
              key={pId} 
              className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${prop.theme || '#0ea5e9'}10`,
                color: prop.theme || '#0ea5e9',
                borderColor: `${prop.theme || '#0ea5e9'}30`
              }}
            >
              {prop.name}
            </span>
          );
        })}
      </div>
    );
  };

  const isSuperOrAdmin = user && ['admin', 'superadmin', 'subadmin', 'owner'].includes(user.role);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('users.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('users.subtitle')}</p>
        </div>
        {isSuperOrAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">{t('users.add_user')}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      {isSuperOrAdmin && (
        <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('cleaners')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'cleaners' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t('users.cleaners_tab')}
          </button>
          <button
            onClick={() => setActiveTab('managers')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === 'managers' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t('users.managers_tab')}
          </button>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">{t('users.loading')}</div>
          ) : activeUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">{t('users.no_users')}</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 text-sm">{t('users.name_identifiers')}</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Assigned Properties</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">{t('users.status_role')}</th>
                  {isSuperOrAdmin && <th className="p-4 font-semibold text-slate-600 text-sm text-right">{t('users.actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-sm text-slate-500">
                            {u.role === 'cleaner' ? t('users.pin_label', { pin: u.username || '?' }) : u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {renderPropertyBadges(u)}
                    </td>
                    <td className="p-4">
                      {u.role === 'cleaner' ? (
                        <div className="flex flex-col space-y-1">
                          <span className={cn(
                            "inline-flex w-fit px-2 py-0.5 rounded-md text-xs font-bold border",
                            u.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {u.status === 'active' ? t('users.active') : t('users.inactive')}
                          </span>
                          <span className="text-xs text-slate-400">{t('users.last_seen', { at: formatLastSeen(u.lastActive) })}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            {['admin', 'subadmin'].includes(u.role) && <ShieldAlert size={14} className="text-blue-600"/>}
                            <span className={cn(
                              "font-bold text-xs uppercase px-2 py-0.5 rounded-md border",
                              u.role === 'admin' ? "bg-red-50 text-red-700 border-red-200" :
                              u.role === 'subadmin' ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-slate-50 text-slate-700 border-slate-200"
                            )}>
                              {u.role === 'admin' ? 'Superadmin' : u.role === 'subadmin' ? 'Admin' : 'Manager'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{t('users.last_seen', { at: formatLastSeen(u.lastActive) })}</span>
                        </div>
                      )}
                    </td>
                    {isSuperOrAdmin && (
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenModal(u)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {editUser && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editUser.id ? t('users.edit_user') : t('users.add_user')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {t('users.full_name')}
                </label>
                <input 
                  type="text" 
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.role')}</label>
                <select 
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value, propertyIds: e.target.value === 'admin' ? [] : (editUser.propertyIds || [])})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={user?.role === 'manager'}
                >
                  <option value="cleaner">{t('users.cleaners_tab').slice(0, -1)}</option>
                  {['admin', 'superadmin', 'subadmin', 'owner'].includes(user?.role) && (
                    <>
                      <option value="manager">{t('users.managers_tab').split(' ')[0]}</option>
                      <option value="subadmin">Admin</option>
                      <option value="admin">Superadmin</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.language')}</label>
                <select 
                  value={editUser.language || 'en'}
                  onChange={(e) => setEditUser({...editUser, language: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="sk">Slovenčina</option>
                  <option value="hu">Magyar</option>
                </select>
              </div>

              {/* Property Assignments (Not applicable to Superadmin who sees everything) */}
              {editUser.role !== 'admin' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1">
                    <Building size={16} className="text-slate-400" />
                    <span>Assigned Properties {editUser.role === 'cleaner' && <span className="text-red-500">*</span>}</span>
                  </label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                    {properties.map(prop => {
                      const isChecked = (editUser.propertyIds || []).includes(prop.id);
                      return (
                        <label key={prop.id} className="flex items-center space-x-3 cursor-pointer text-sm py-0.5">
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => togglePropertyAssignment(prop.id)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                          />
                          <span className="font-semibold text-slate-700">{prop.name}</span>
                        </label>
                      );
                    })}
                    {properties.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No properties created yet.</p>
                    )}
                  </div>
                  {editUser.role === 'cleaner' && (
                    <p className="text-[10px] text-slate-400 mt-1">Cleaners must have at least one property assigned to view tasks.</p>
                  )}
                </div>
              )}

              {editUser.role === 'cleaner' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.username')}</label>
                    <input 
                      type="text" 
                      value={editUser.username}
                      onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="cleaner_login"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.pin')}</label>
                    <input 
                      type="password" 
                      value={editUser.password}
                      onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={t('login.pin_help')}
                      maxLength={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.email')}</label>
                    <input 
                      type="email" 
                      value={editUser.email}
                      onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. name@cleaner.sk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.password')}</label>
                    <input 
                      type="password" 
                      value={editUser.password || ''}
                      onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('users.status')}</label>
                <select 
                  value={editUser.status}
                  onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">{t('users.active')}</option>
                  <option value="inactive">{t('users.inactive')}</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm"
                >
                  <Save size={18} />
                  <span>{t('users.save_user')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
