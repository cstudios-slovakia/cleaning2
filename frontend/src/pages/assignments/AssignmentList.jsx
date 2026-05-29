import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn, isToday as isTodayHelper, isYesterday as isYesterdayHelper, isTomorrow as isTomorrowHelper } from '../../lib/utils';
import Slideout from '../../components/Slideout';
import AssignmentDetail from './AssignmentDetail';
import { fetchAssignments, fetchProperties } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';

export default function AssignmentList() {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState({
    overdue: true,
    today: true,
    tomorrow: false,
    future: false,
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [dbAssignments, setDbAssignments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [flashMessage, setFlashMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFlashMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);
      } catch (e) {
        console.error('Failed to load properties', e);
      } finally {
        setLoadingProps(false);
      }
    };
    loadProperties();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAssignments();
        // Only show active assignments
        setDbAssignments(data.filter(a => !a.doneBy));
      } catch (e) {
        console.error('Failed to fetch assignments', e);
      }
    };
    load();
    const interval = setInterval(load, 3000); // Poll every 3 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const getPropertyData = (propertyName) => {
    const prop = properties.find(p => p.name === propertyName);
    if (prop) return prop;
    return { theme: '#0ea5e9', coverImage: null };
  };

  const isToday = (a) => isTodayHelper(a?.date) || String(a?.time || '').includes('Today');
  
  const isTomorrow = (a) => isTomorrowHelper(a?.date) || String(a?.time || '').includes('Tomorrow');
  
  const isYesterday = (a) => isYesterdayHelper(a?.date) || String(a?.time || '').includes('Yesterday');

  const isOverdue = (a) => {
    if (!a) return false;
    if (isToday(a)) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const timeMatch = String(a.time || '').match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const scheduledMinutes = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
        return scheduledMinutes < currentMinutes;
      }
    }
    return isYesterday(a);
  };

  const filteredAssignments = (dbAssignments || []).filter(a => {
    if (['admin', 'superadmin', 'subadmin', 'owner'].includes(user?.role)) return true;
    const prop = (properties || []).find(p => p.name === a.property);
    if (!prop) return false;
    
    if (user?.role === 'cleaner') {
      return prop?.cleaners?.some(c => c.name === user.name || c.id === user.id);
    }
    
    if (user?.role === 'manager') {
      return prop?.managers?.some(m => m.name === user.name || m.id === user.id);
    }
    
    return true;
  });

  const overdueList = filteredAssignments.filter(isOverdue);
  const todayList = filteredAssignments.filter(a => isToday(a) && !isOverdue(a));
  const tomorrowList = filteredAssignments.filter(a => isTomorrow(a) && !isOverdue(a));
  const futureList = filteredAssignments.filter(a => !isToday(a) && !isTomorrow(a) && !isYesterday(a) && !isOverdue(a));

  const translateLabel = (label) => {
    if (!label) return '';
    if (label === 'Today') return t('common.today');
    if (label === 'Tomorrow') return t('common.tomorrow');
    if (label === 'Yesterday') return t('common.yesterday');
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
      const d = new Date(label);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
      }
    }
    
    return label;
  };

  const GroupHeader = ({ id, title, count, colorClass, icon: Icon }) => (
    <button 
      onClick={() => toggleGroup(id)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100 animate-fade-in"
    >
      <div className="flex items-center space-x-3">
        {expandedGroups[id] ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
        <div className={cn("p-1.5 rounded-lg text-white", colorClass)}>
          <Icon size={16} />
        </div>
        <span className="font-bold text-slate-800">{title}</span>
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
      </div>
    </button>
  );

  const isCleanerRole = user?.role === 'cleaner';

  // For cleaner, combine overdue and today
  const cleanerListMerged = [...overdueList.map(a => ({ ...a, isOverdueFlag: true })), ...todayList];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isCleanerRole ? "My Assignments" : t('assignments.title')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isCleanerRole ? "Today's scheduled cleaning checklist" : t('assignments.details')}
          </p>
        </div>
      </div>

      {isCleanerRole ? (
        /* Flat Cleaner View */
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-white">
            <h3 className="font-black text-sm uppercase tracking-wider">Today's Task List</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {cleanerListMerged.map(a => {
              const propData = getPropertyData(a.property);
              return (
                <button 
                  key={a.id} 
                  onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                  className={cn(
                    "w-full text-left block p-5 hover:bg-slate-50 transition-colors border-l-4 relative",
                    a.isOverdueFlag 
                      ? "border-l-orange-500 bg-orange-50/20 hover:bg-orange-50/50" 
                      : "border-l-transparent bg-white"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start space-y-1.5">
                      <div className="flex items-center space-x-2">
                        {a.isOverdueFlag && <AlertTriangle size={16} className="text-orange-500 animate-pulse shrink-0" />}
                        <p className="font-black text-lg text-slate-800">{a.room}</p>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${propData.theme}15`,
                          color: propData.theme,
                          borderColor: `${propData.theme}30`
                        }}
                      >
                        {a.property}
                      </span>
                    </div>
                    <div className="text-right">
                      {a.isOverdueFlag ? (
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1">
                          Overdue ({translateLabel(a.time)})
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {translateLabel(a.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {cleanerListMerged.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <p className="text-4xl mb-4">🎉</p>
                <h4 className="font-black text-lg text-slate-800">No Assignments Today!</h4>
                <p className="text-sm text-slate-400 mt-1">Enjoy your day or check with your manager.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsible Manager View */
        <div className="card">
          {/* Overdue */}
          <GroupHeader id="overdue" title={t('assignments.overdue')} count={overdueList.length} colorClass="bg-orange-500" icon={AlertTriangle} />
          {expandedGroups.overdue && (
            <div className="bg-orange-50/50 divide-y divide-slate-100">
              {overdueList.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                  className="w-full text-left block p-4 pl-12 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900">{a.room}</p>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getPropertyData(a.property).theme}15`,
                          color: getPropertyData(a.property).theme,
                          borderColor: `${getPropertyData(a.property).theme}30`
                        }}
                      >
                        {a.property}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">{translateLabel(a.time)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Today */}
          <GroupHeader id="today" title={t('assignments.today')} count={todayList.length} colorClass="bg-blue-600" icon={Clock} />
          {expandedGroups.today && (
            <div className="divide-y divide-slate-100">
              {todayList.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                  className="w-full text-left block p-4 pl-12 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900">{a.room}</p>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getPropertyData(a.property).theme}15`,
                          color: getPropertyData(a.property).theme,
                          borderColor: `${getPropertyData(a.property).theme}30`
                        }}
                      >
                        {a.property}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">{translateLabel(a.time)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tomorrow */}
          <GroupHeader id="tomorrow" title={t('assignments.tomorrow')} count={tomorrowList.length} colorClass="bg-slate-500" icon={Clock} />
          {expandedGroups.tomorrow && (
            <div className="divide-y divide-slate-100">
              {tomorrowList.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                  className="w-full text-left block p-4 pl-12 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900">{a.room}</p>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getPropertyData(a.property).theme}15`,
                          color: getPropertyData(a.property).theme,
                          borderColor: `${getPropertyData(a.property).theme}30`
                        }}
                      >
                        {a.property}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{translateLabel(a.time)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Future */}
          <GroupHeader id="future" title={t('assignments.future')} count={futureList.length} colorClass="bg-slate-400" icon={CheckCircle} />
          {expandedGroups.future && (
            <div className="divide-y divide-slate-100">
              {futureList.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => { setSelectedAssignment(a); setIsSlideoutOpen(true); }}
                  className="w-full text-left block p-4 pl-12 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-slate-900">{a.room}</p>
                      </div>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                        style={{
                          backgroundColor: `${getPropertyData(a.property).theme}15`,
                          color: getPropertyData(a.property).theme,
                          borderColor: `${getPropertyData(a.property).theme}30`
                        }}
                      >
                        {a.property}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-slate-500">{translateLabel(a.date)}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{translateLabel(a.time)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Slideout 
        isOpen={isSlideoutOpen} 
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedAssignment?.room}
      >
        {selectedAssignment && (
          <AssignmentDetail 
            assignmentId={selectedAssignment.id} 
            isSlideout={true}
            theme={getPropertyData(selectedAssignment.property).theme}
            coverImage={getPropertyData(selectedAssignment.property).coverImage}
            onClose={() => setIsSlideoutOpen(false)}
            onFlashMessage={(msg) => {
              setFlashMessage(msg);
              setIsSlideoutOpen(false);
            }}
          />
        )}
      </Slideout>

      {flashMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-slate-700">
            <CheckCircle className="text-green-400" size={20} />
            <span className="font-bold">{flashMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
