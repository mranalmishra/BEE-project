import React, { useState } from 'react';
import { X, User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";

function Alert({ msg }) {
  if (!msg) return null;
  const ok = msg.type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${ok ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'}`}>
      {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg.text}
    </div>
  );
}

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword } = useAuth();
  const [tab, setTab] = useState('profile');

  const [name, setName]           = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]         = useState(null);

  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [pwdMsg, setPwdMsg]           = useState(null);

  if (!isOpen) return null;

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg(null);
    try {
      await updateProfile(name, avatarUrl);
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally { setProfileLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) return setPwdMsg({ type: 'error', text: 'Passwords do not match' });
    setPwdLoading(true); setPwdMsg(null);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally { setPwdLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Account Settings</span>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
          {[['profile', User, 'Profile'], ['security', Lock, 'Security']].map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 py-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-all ${tab === id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'profile' ? (
            <form onSubmit={handleProfile} className="space-y-4">
              <Alert msg={profileMsg} />

              {/* Avatar */}
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400 shadow" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow">
                    {name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Quick presets</p>
                  <div className="flex gap-1.5">
                    {PRESET_AVATARS.map((url, i) => (
                      <button key={i} type="button" onClick={() => setAvatarUrl(url)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${avatarUrl === url ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-700'}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={user?.email || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Avatar URL</label>
                <input type="url" placeholder="https://example.com/avatar.jpg" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className={inputClass} />
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={profileLoading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all disabled:opacity-50">
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePassword} className="space-y-4">
              <Alert msg={pwdMsg} />

              {[['Current Password', currentPwd, setCurrentPwd], ['New Password', newPwd, setNewPwd], ['Confirm New Password', confirmPwd, setConfirmPwd]].map(([label, val, setter]) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input type="password" placeholder="••••••••" value={val} onChange={(e) => setter(e.target.value)} required minLength={label === 'Current Password' ? 1 : 6} className={inputClass} />
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={pwdLoading} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all disabled:opacity-50">
                  {pwdLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
