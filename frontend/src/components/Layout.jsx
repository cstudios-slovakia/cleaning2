import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, BedDouble, ClipboardList, Users, LogOut, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { CONFIG } from '../config';
import PwaInstallPrompt from './PwaInstallPrompt';
import { usePushNotifications } from '../lib/usePushNotifications';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', path: '/properties', icon: Building2 },
  { name: 'Rooms', path: '/rooms', icon: BedDouble },
  { name: 'Assignments', path: '/assignments', icon: ClipboardList },
  { name: 'Users', path: '/users', icon: Users },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, systemName } = useTranslation();

  usePushNotifications(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let pageTitle = systemName || 'Cleaning System';
    if (location.pathname.startsWith('/dashboard')) pageTitle = t('nav.dashboard');
    else if (location.pathname.startsWith('/properties')) pageTitle = t('nav.properties');
    else if (location.pathname.startsWith('/rooms')) pageTitle = t('nav.rooms');
    else if (location.pathname.startsWith('/assignments')) pageTitle = t('nav.assignments');
    else if (location.pathname.startsWith('/users')) pageTitle = t('nav.users');
    else if (location.pathname.startsWith('/settings')) pageTitle = t('nav.settings');

    document.title = `${pageTitle} - ${systemName || 'Cleaning System'}`;
  }, [location.pathname, t, systemName]);

  const navItems = user?.role === 'cleaner'
    ? ALL_NAV_ITEMS.filter(item => ['Rooms', 'Assignments'].includes(item.name))
    : ALL_NAV_ITEMS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-24 bg-white border-r border-slate-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)] transition-all z-10">
        <div className="py-8 flex flex-col items-center">
          <Link to="/dashboard" className="w-12 h-12 bg-white border-2 border-slate-900 rounded-2xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform active:scale-95 shadow-sm">
            <span className="text-slate-900 font-black text-lg tracking-tighter">CS</span>
          </Link>
        </div>
        
        <nav className="flex-1 flex flex-col items-center py-4 space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 group",
                  isActive 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
                title={t(`nav.${item.name.toLowerCase()}`)}
              >
                <Icon size={24} strokeWidth={2} />
                {isActive && (
                   <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full -ml-[1px]" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="py-6 flex flex-col items-center space-y-4 border-t border-slate-50">
          <Link 
            to="/settings"
            className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
            title={t('nav.settings')}
          >
            <Settings size={22} />
          </Link>
          <button 
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            title={t('nav.logout')}
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {systemName || t('login.title')}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">v{CONFIG.VERSION}</p>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/settings" className="text-slate-400 hover:text-slate-600 transition-colors">
              <Settings size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || (user?.role === 'cleaner' ? t('login.cleaner_tab') : 'Admin')}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{user?.role ? (user.role === 'cleaner' ? t('login.cleaner_tab') : 'Manager') : 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-slate-200">
                {user?.name?.charAt(0) || 'E'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 space-y-1 transition-colors duration-200",
                  isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn("p-1.5 rounded-xl transition-all duration-300", isActive && "bg-primary-50")}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{t(`nav.${item.name.toLowerCase()}`)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <PwaInstallPrompt />
    </div>
  );
}
