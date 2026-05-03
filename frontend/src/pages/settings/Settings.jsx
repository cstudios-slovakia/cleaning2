import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation, LANGUAGES } from '../../contexts/I18nContext';
import { Globe, User, Save, Shield } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { t, currentLang, systemLang, userLang, changeUserLanguage, changeSystemLanguage } = useTranslation();
  
  const [selectedUserLang, setSelectedUserLang] = useState(userLang || '');
  const [selectedSysLang, setSelectedSysLang] = useState(systemLang);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = () => {
    changeUserLanguage(selectedUserLang === '' ? null : selectedUserLang);
    if (user?.role === 'admin' || user?.role === 'manager') {
      changeSystemLanguage(selectedSysLang);
    }
    setSuccessMsg(t('common.success'));
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('settings.title')}</h1>
        <p className="text-slate-500 font-medium mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Preferences */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('settings.profile')}</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.user_language')}</label>
              <select 
                value={selectedUserLang}
                onChange={(e) => setSelectedUserLang(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="">{t('settings.default')} ({systemLang})</option>
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            
            {user?.role === 'cleaner' && (
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.pin')}</label>
                <input 
                  type="password"
                  disabled
                  value="****"
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500"
                />
                <p className="text-xs text-slate-400 mt-2">Contact admin to change your PIN.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Settings (Admin only) */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">System Preferences</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center space-x-2">
                  <Shield size={14} className="text-orange-500" />
                  <span>{t('settings.system_language')}</span>
                </label>
                <select 
                  value={selectedSysLang}
                  onChange={(e) => setSelectedSysLang(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-medium"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">{t('settings.system_language_help')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-md shadow-primary-200 transition-all active:scale-95"
        >
          <Save size={18} />
          <span>{t('common.save')}</span>
        </button>
      </div>

      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="font-bold">{successMsg}</span>
        </div>
      )}
    </div>
  );
}
