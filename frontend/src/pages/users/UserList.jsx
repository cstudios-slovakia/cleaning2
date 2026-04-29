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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 shadow-md">
          <UserPlus size={18} />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('cleaners')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
            activeTab === 'cleaners' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Cleaners
        </button>
        <button
          onClick={() => setActiveTab('managers')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
            activeTab === 'managers' ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Managers & Admins
        </button>
      </div>

      <div className="glass bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name / Identifiers</th>
              <th className="p-4 font-semibold text-gray-600">Status / Role</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users[activeTab].map(user => (
              <tr key={user.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'cleaners' ? `@${user.username}` : user.email}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  {activeTab === 'cleaners' ? (
                    <div className="flex flex-col space-y-1">
                      <span className={cn(
                        "inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-bold",
                        user.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {user.status}
                      </span>
                      <span className="text-xs text-gray-400">Last seen: {user.lastActive}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      {user.role === 'admin' && <ShieldAlert size={14} className="text-gold-500"/>}
                      <span className={cn(
                        "font-medium text-sm capitalize",
                        user.role === 'admin' ? "text-gold-600" : "text-blue-600"
                      )}>
                        {user.role}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
