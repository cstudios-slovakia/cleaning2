import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, BedDouble, ClipboardList, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Rooms', path: '/rooms', icon: BedDouble },
  { name: 'Assignments', path: '/assignments', icon: ClipboardList },
  { name: 'Users', path: '/users', icon: Users },
];

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-gold-400 bg-clip-text text-transparent">Emerald</h1>
          <p className="text-xs text-emerald-200 uppercase tracking-wider mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-white/20 glass shadow-sm text-gold-400 font-medium" 
                    : "hover:bg-white/10 text-emerald-100 hover:text-white"
                )}
              >
                <Icon size={20} className={isActive ? "text-gold-400" : ""} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 m-4 rounded-xl glass-dark">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen pb-16 md:pb-0">
        {/* Top Header (Mobile) */}
        <header className="md:hidden glass px-4 py-3 sticky top-0 z-10 flex justify-between items-center bg-white/80">
          <h1 className="text-lg font-bold text-emerald-900">Emerald System</h1>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-sm">
            {user.name.charAt(0)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass bg-white/90 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200">
        <div className="flex justify-around items-center px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 space-y-1 transition-colors duration-200",
                  isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
                )}
              >
                <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-emerald-100 text-emerald-700")}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
