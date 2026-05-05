import React, { useState } from 'react';
import { 
  Database, 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  Server, 
  Database as DbIcon, 
  User, 
  Lock, 
  Globe,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

const Setup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Database Config
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    dbname: 'cleaning_system',
    user: 'root',
    password: '',
    driver: 'mysql'
  });

  // Step 2: System Settings
  const [sysConfig, setSysConfig] = useState({
    systemName: 'Cstudios Cleaner',
    adminEmail: 'admin@cleaner.sk',
    adminPassword: '',
    defaultLanguage: 'sk'
  });

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      // Test DB Connection
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/setup.php?action=test_db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbConfig)
        });
        const data = await res.json();
        if (data.status === 'success') {
          setStep(2);
        } else {
          setError(data.message || 'Failed to connect to database');
        }
      } catch (err) {
        setError('Network error. Check if backend is running.');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!sysConfig.adminPassword) {
        setError('Admin password is required');
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/setup.php?action=install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: dbConfig, sys: sysConfig })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess('Installation successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Installation failed');
      }
    } catch (err) {
      setError('Network error during installation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar */}
        <div className="md:w-80 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white font-black text-xs uppercase tracking-tighter">CS</span>
              </div>
              <h2 className="text-white font-bold tracking-tight">Setup Wizard</h2>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'Database', icon: Database },
                { id: 2, label: 'System Settings', icon: Settings },
                { id: 3, label: 'Finish', icon: CheckCircle2 }
              ].map((s) => (
                <div key={s.id} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step === s.id 
                      ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/30' 
                      : step > s.id 
                        ? 'bg-slate-800 border-slate-800 text-green-400' 
                        : 'border-slate-700 text-slate-500'
                  }`}>
                    {step > s.id ? <CheckCircle2 size={20} /> : <span className={`font-bold ${step === s.id ? 'text-white' : 'text-slate-500'}`}>{s.id}</span>}
                  </div>
                  <span className={`font-bold tracking-tight ${step === s.id ? 'text-white' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cstudios Software</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-16 relative bg-white">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center space-x-3 animate-shake">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Lock size={16} />
              </div>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl flex items-center space-x-3">
              <CheckCircle2 size={16} />
              <p className="text-sm font-bold">{success}</p>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Connect your database</h2>
              <p className="text-slate-500 mb-10 font-medium">Enter your server credentials to initialize the software.</p>

              <div className="grid grid-cols-1 gap-6 mb-12">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Driver</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                    value={dbConfig.driver}
                    onChange={(e) => setDbConfig({...dbConfig, driver: e.target.value})}
                  >
                    <option value="mysql">MySQL / MariaDB</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Server</label>
                    <div className="relative">
                      <Server className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        placeholder="localhost"
                        value={dbConfig.host}
                        onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Port</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="3306"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Database Name</label>
                  <div className="relative">
                    <DbIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                      placeholder="cleaning_db"
                      value={dbConfig.dbname}
                      onChange={(e) => setDbConfig({...dbConfig, dbname: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        placeholder="db_user"
                        value={dbConfig.user}
                        onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="password"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                        placeholder="••••••••"
                        value={dbConfig.password}
                        onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">System Settings</h2>
              <p className="text-slate-500 mb-10 font-medium">Almost there! Set up your global preferences.</p>

              <div className="grid grid-cols-1 gap-6 mb-12">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">System Name</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                      value={sysConfig.systemName}
                      onChange={(e) => setSysConfig({...sysConfig, systemName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Admin Email</label>
                  <input 
                    type="email"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                    value={sysConfig.adminEmail}
                    onChange={(e) => setSysConfig({...sysConfig, adminEmail: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Admin Password</label>
                  <input 
                    type="password"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="Create a strong password"
                    value={sysConfig.adminPassword}
                    onChange={(e) => setSysConfig({...sysConfig, adminPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center flex flex-col items-center justify-center py-10">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-100/50">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Ready to launch!</h2>
              <p className="text-slate-500 mb-12 font-medium max-w-sm">We are ready to initialize your database and create your administrator account.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-auto pt-10 border-t border-slate-50">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                Go Back
              </button>
            ) : (
              <div />
            )}
            
            <button 
              onClick={step === 3 ? handleFinish : handleNext}
              disabled={loading}
              className="group bg-amber-500 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all active:scale-95 flex items-center space-x-3 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{step === 3 ? 'Finalize Installation' : 'Save & Continue'}</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
