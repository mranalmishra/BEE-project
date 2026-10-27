import React, { useState } from 'react';
import { Search, Moon, Sun, Plus, Menu, X, LogOut, LayoutGrid, List, BookOpen, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ searchQuery, setSearchQuery, onNewNote, onOpenProfile, onToggleSidebar, viewMode, setViewMode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand */}
      <div className="hidden lg:flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          Private<span className="text-indigo-600 dark:text-indigo-400">Notes</span>
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
          className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-lg border border-transparent focus:border-indigo-400 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* New note */}
        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* View toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={viewMode === 'grid' ? 'List view' : 'Grid view'}
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); onOpenProfile(); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-indigo-500" /> Account Settings
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
