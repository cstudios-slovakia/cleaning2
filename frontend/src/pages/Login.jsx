import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../lib/api';

function Login() {
  const { t, systemName } = useTranslation();
  const [activeTab, setActiveTab] = useState('manager'); // 'manager' or 'cleaner'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const users = await fetchUsers();
      let foundUser = null;

      if (activeTab === 'manager') {
        foundUser = users.find(u => (u.email === email || u.username === email || u.name === email) && u.password === password && ['admin', 'subadmin', 'manager', 'owner'].includes(u.role));
        if (foundUser && foundUser.status === 'inactive') {
          setError(t('login.errors.deactivated'));
          setLoading(false);
          return;
        }
        if (!foundUser) {
          setError(t('login.errors.invalid_manager'));
          setLoading(false);
          return;
        }
      } else {
        foundUser = users.find(u => (u.username === username || u.name === username || u.email === username) && (u.username === pin || u.password === pin) && u.role === 'cleaner');
        if (foundUser && foundUser.status === 'inactive') {
          setError(t('login.errors.deactivated'));
          setLoading(false);
          return;
        }
        if (!foundUser) {
          setError(t('login.errors.invalid_cleaner'));
          setLoading(false);
          return;
        }
      }

      login({ ...foundUser, name: foundUser.name || foundUser.username || foundUser.email });
      navigate(activeTab === 'manager' ? '/dashboard' : '/assignments');
    } catch (err) {
      setError(t('login.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-primary-600 p-8 text-center text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">{systemName}</h1>
          <p className="text-primary-100">{t('login.subtitle')}</p>
        </div>
        
        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'manager' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('manager')}
            >
              {t('login.manager_tab')}
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'cleaner' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setActiveTab('cleaner')}
            >
              {t('login.cleaner_tab')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'manager' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.email')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="manager@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.password')}</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.username')}</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder={t('login.username_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('login.pin')}</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    pattern="\d{4}"
                    title={t('login.pin_help')}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all tracking-[1em] font-mono text-center"
                    placeholder="••••"
                  />
                </div>
              </>
            )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? t('login.signing_in') : t('login.submit')}
              </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
