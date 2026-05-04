import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, ShieldAlert, Trash2, X, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchUsers, saveUser, deleteUser } from '../../lib/api';
import Modal from '../../components/Modal';

export default function UserList() {
  const [activeTab, setActiveTab] = useState('cleaners');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const cleaners = users.filter(u => u.role === 'cleaner');
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
  const activeUsers = activeTab === 'cleaners' ? cleaners : managers;

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditUser({ ...user });
    } else {
      setEditUser({
        id: '',
        name: '',
        username: '',
        email: '',
        password: '',
        role: activeTab === 'cleaners' ? 'cleaner' : 'manager',
        status: 'active',
        language: 'en'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUser.name.trim()) return;

    try {
      await saveUser({
        ...editUser,
        id: editUser.id || Date.now().toString(),
        lastActive: editUser.lastActive || 'Never'
      });
      setIsModalOpen(false);
      loadUsers();
    } catch (e) {
      console.error('Failed to save user', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage personnel, roles and statuses.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors"
        >
          <UserPlus size={18} />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('cleaners')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
            activeTab === 'cleaners' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Cleaners
        </button>
        <button
          onClick={() => setActiveTab('managers')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
            activeTab === 'managers' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Managers & Admins
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading users...</div>
          ) : activeUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No users found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Name / Identifiers</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm">Status / Role</th>
                  <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">
                            {user.role === 'cleaner' ? `PIN: ${user.username || '?'}` : user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.role === 'cleaner' ? (
                        <div className="flex flex-col space-y-1">
                          <span className={cn(
                            "inline-flex w-fit px-2 py-0.5 rounded-md text-xs font-bold border",
                            user.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {user.status}
                          </span>
                          <span className="text-xs text-slate-400">Last seen: {user.lastActive}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          {user.role === 'admin' && <ShieldAlert size={14} className="text-blue-600"/>}
                          <span className={cn(
                            "font-medium text-sm capitalize px-2 py-0.5 rounded-md border",
                            user.role === 'admin' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"
                          )}>
                            {user.role}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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
                {editUser.id ? 'Edit User' : 'Add User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select 
                  value={editUser.role}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="cleaner">Cleaner</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Language</label>
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

              {editUser.role === 'cleaner' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={editUser.username}
                      onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="cleaner_login"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">PIN</label>
                    <input 
                      type="password" 
                      value={editUser.password}
                      onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="4 digit PIN"
                      maxLength={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editUser.email}
                      onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. name@cleaner.sk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select 
                  value={editUser.status}
                  onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-xl hover:bg-primary-700 font-medium transition-colors shadow-sm"
                >
                  <Save size={18} />
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
