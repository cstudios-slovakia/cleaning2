import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation, LANGUAGES } from '../../contexts/I18nContext';
import { Globe, User, Save, Shield, Key } from 'lucide-react';
import { saveUser } from '../../lib/api';

export default function Settings() {
  const { user } = useAuth();
  const { t, currentLang, systemLang, userLang, changeUserLanguage, changeSystemLanguage, systemName, changeSystemName } = useTranslation();
  
  const [selectedUserLang, setSelectedUserLang] = useState(userLang || '');
  const [selectedSysLang, setSelectedSysLang] = useState(systemLang);
  const [sysName, setSysName] = useState(systemName || '');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async () => {
    setPasswordError('');
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError(t('settings.errors.password_mismatch'));
        return;
      }
      try {
        // Save user's new password/pin
        await saveUser({ ...user, password: newPassword });
      } catch (err) {
        setPasswordError(t('settings.errors.save_failed'));
        return;
      }
    }

    changeUserLanguage(selectedUserLang === '' ? null : selectedUserLang);
    if (user?.role === 'admin' || user?.role === 'manager') {
      changeSystemLanguage(selectedSysLang);
      if (sysName.trim()) {
        changeSystemName(sysName.trim());
      }
    }
    setNewPassword('');
    setConfirmPassword('');
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
            
            {user?.role === 'cleaner' ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Key size={16} />
                  <span>{t('settings.update_pin')}</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.new_pin')}</label>
                    <input 
                      type="password"
                      maxLength={4}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="****"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.confirm_pin')}</label>
                    <input 
                      type="password"
                      maxLength={4}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="****"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                {passwordError && <p className="text-sm text-red-500 font-bold">{passwordError}</p>}
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Key size={16} />
                  <span>{t('settings.update_password')}</span>
                </h3>
                {user?.id === 'admin_0' ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium text-center">
                      The main admin password can only be changed in the system configuration file.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.new_password')}</label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">{t('settings.confirm_password')}</label>
                        <input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    {passwordError && <p className="text-sm text-red-500 font-bold">{passwordError}</p>}
                  </>
                )}
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
              <h2 className="text-lg font-bold text-slate-800">{t('settings.system_preferences')}</h2>
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

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider flex items-center space-x-2">
                  <Shield size={14} className="text-orange-500" />
                  <span>System Name</span>
                </label>
                <input 
                  type="text"
                  value={sysName}
                  onChange={(e) => setSysName(e.target.value)}
                  placeholder="e.g. Emerald Cleaning"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-medium"
                />
                <p className="text-xs text-slate-500 mt-2">The global name displayed across the system</p>
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
