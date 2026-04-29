import React, { useState } from 'react';
import { UserPlus, Edit2, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function UserList() {
  const [activeTab, setActiveTab] = useState('cleaners');

  const users = {
    cleaners: [
      { id: 1, name: 'Maria Garcia', username: 'maria', lastActive: '2 hours ago', status: 'active' },
      { id: 2, name: 'Anna Novak', username: 'anna', lastActive: 'Yesterday', status: 'active' },
      { id: 3, name: 'Peter Pan', username: 'peter', lastActive: '1 week ago', status: 'inactive' },
    ],
    managers: [
      { id: 4, name: 'John Doe', email: 'john@emerald.sk', role: 'manager' },
      { id: 5, name: 'Admin User', email: 'admin@emerald.sk', role: 'admin' },
    ]
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage personnel, roles and statuses.</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 shadow-sm font-medium transition-colors">
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
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Name / Identifiers</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status / Role</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users[activeTab].map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          {activeTab === 'cleaners' ? `@${user.username}` : user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {activeTab === 'cleaners' ? (
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
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
