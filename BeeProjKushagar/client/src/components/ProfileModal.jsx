import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword } = useAuth();
  const [tab, setTab] = useState('profile'); // 'profile' or 'security'

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(name, avatarUrl);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      setPwdLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 font-['Outfit']">
              Account Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 gap-4">
          <button
            onClick={() => setTab('profile')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              tab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Details
          </button>

          <button
            onClick={() => setTab('security')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              tab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security & Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-sm border ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  {profileMsg.text}
                </div>
              )}

              {/* Avatar Preview & Preset picker */}
              <div className="flex items-center gap-4 pb-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Quick Avatar Presets:
                  </p>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                          avatarUrl === url ? 'border-indigo-600 scale-105' : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Custom Avatar Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {profileLoading ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {pwdMsg && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 text-sm border ${
                    pwdMsg.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {pwdMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  {pwdMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {pwdLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
