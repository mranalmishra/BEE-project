import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { BookOpen } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-bounce">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Unlocking your private vault...
        </p>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
