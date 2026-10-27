import React, { useState } from 'react';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Moon,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setMode('login');
    setEmail('demo@example.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Navbar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-['Outfit']">
            PrivateNotes
          </span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:scale-105 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-['Outfit']">
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Vault'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {mode === 'login'
                ? 'Sign in to access your encrypted, private notes workspace'
                : 'Join PrivateNotes and get your own isolated user workspace'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Quick Demo Login Pill */}
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full mb-5 py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Click for 1-Click Demo Account (Alex Rivera)</span>
          </button>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Features Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              JWT Auth & bcrypt
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Per-User Isolation
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        Full-Stack MERN Architecture • React 18, Vite, Express, JWT, Mongoose Ready
      </div>
    </div>
  );
}
