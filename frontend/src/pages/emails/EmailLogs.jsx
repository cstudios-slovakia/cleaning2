import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/I18nContext';
import { Mail, Eye, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function EmailLogs() {
  const { user } = useAuth();
  const { t, currentLang } = useTranslation();
  
  // Outbound Email Logs States
  const [sentEmails, setSentEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const isSystemAdmin = user && ['admin', 'superadmin', 'subadmin', 'owner'].includes(user.role);

  const fetchEmails = async () => {
    if (!isSystemAdmin) return;
    setLoadingEmails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/emails.php`);
      if (res.ok) {
        const data = await res.json();
        setSentEmails(data);
      }
    } catch (e) {
      console.error('Failed to fetch emails', e);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleViewEmail = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/emails.php?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEmail(data);
      }
    } catch (e) {
      console.error('Failed to fetch email detail', e);
    }
  };

  useEffect(() => {
    if (isSystemAdmin) {
      fetchEmails();
    }
  }, [isSystemAdmin]);

  if (!isSystemAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-bold">{t('emails.unauthorized')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('emails.title')}</h1>
        <p className="text-slate-500 font-medium mt-1">{t('emails.subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('emails.op_log')}</h2>
              <p className="text-xs text-slate-400 font-medium">{t('emails.verify_desc')}</p>
            </div>
          </div>
          <button
            onClick={fetchEmails}
            disabled={loadingEmails}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingEmails ? "animate-spin" : ""} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'all', label: t('emails.all_emails') },
            { id: 'success', label: t('emails.sent') },
            { id: 'failed', label: t('emails.failed') }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Logs List */}
        {loadingEmails ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-400">{t('emails.loading')}</p>
          </div>
        ) : sentEmails.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Mail className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-sm font-semibold text-slate-500">{t('emails.no_emails')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('emails.sent_reports_appear')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">{t('emails.sent_date')}</th>
                  <th className="py-4 px-6">{t('emails.property')}</th>
                  <th className="py-4 px-6">{t('emails.recipients')}</th>
                  <th className="py-4 px-6">{t('emails.subject')}</th>
                  <th className="py-4 px-6">{t('emails.status')}</th>
                  <th className="py-4 px-6 text-right">{t('emails.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sentEmails
                  .filter(e => statusFilter === 'all' || e.status === statusFilter)
                  .map(email => (
                    <tr key={email.id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700">
                      <td className="py-4 px-6 font-medium whitespace-nowrap">
                        {new Date(email.sent_at).toLocaleString(currentLang === 'sk' ? 'sk-SK' : 'en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">{email.property_name || 'N/A'}</td>
                      <td className="py-4 px-6 max-w-[200px] truncate" title={email.recipient}>
                        {email.recipient}
                      </td>
                      <td className="py-4 px-6 font-medium max-w-[220px] truncate" title={email.subject}>
                        {email.subject}
                      </td>
                      <td className="py-4 px-6">
                        {email.status === 'success' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-100 rounded-full">
                            <CheckCircle2 size={12} />
                            <span>{t('emails.delivered')}</span>
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-full cursor-help"
                            title={email.error_message}
                          >
                            <AlertCircle size={12} />
                            <span>{t('emails.failed')}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleViewEmail(email.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                        >
                          <Eye size={12} />
                          <span>{t('emails.inspect')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Inspector Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedEmail(null)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col z-10">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">{t('emails.inspector_title')}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{t('emails.inspector_subtitle')}</p>
              </div>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-slate-200/50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('emails.subject')}</p>
                  <p className="font-extrabold text-slate-800 mt-1">{selectedEmail.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('emails.sent_date')}</p>
                  <p className="font-bold text-slate-700 mt-1">
                    {new Date(selectedEmail.sent_at).toLocaleString(currentLang === 'sk' ? 'sk-SK' : 'en-US')}
                  </p>
                </div>
                <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('emails.recipients')}</p>
                  <p className="font-medium text-slate-700 mt-1 break-all">{selectedEmail.recipient}</p>
                </div>
                {selectedEmail.status === 'failed' && (
                  <div className="sm:col-span-2 border-t border-red-200 bg-red-50/50 p-3 rounded-xl mt-1">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center space-x-1">
                      <AlertCircle size={14} />
                      <span>{t('emails.smtp_error_details')}</span>
                    </p>
                    <p className="font-mono text-xs text-red-700 mt-1">{selectedEmail.error_message}</p>
                  </div>
                )}
              </div>

              {/* rendered HTML Email Iframe */}
              <div>
                <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">{t('emails.html_output')}</p>
                <iframe
                  srcDoc={selectedEmail.body}
                  title="Email HTML Preview"
                  className="w-full h-[450px] border border-slate-200 rounded-2xl bg-white shadow-inner"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
