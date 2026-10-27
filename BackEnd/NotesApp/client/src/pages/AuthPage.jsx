import React, { useState } from 'react';
import { BookOpen, Lock, Mail, User, ArrowRight, ShieldCheck, Sun, Moon, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (!name.trim()) return setError('Please enter your full name');
      if (password.length < 6) return setError('Password must be at least 6 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setMode('login');
    setEmail('demo@example.com');
    setPassword('password123');
    setError('');
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  const inputClass = "w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            Private<span className="text-indigo-600 dark:text-indigo-400">Notes</span>
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login' ? 'Sign in to your private vault' : 'Get your own isolated workspace'}
              </p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Tab switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {['login', 'register'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      mode === m
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Demo button */}
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                Try demo account instantly
              </button>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" required placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type={showConfirmPassword ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                JWT + bcrypt
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Per-user isolation
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
            MERN Stack · React 18 · Express · JWT · MongoDB
          </p>
        </div>
      </div>
    </div>
  );
}
