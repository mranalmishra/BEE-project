import React, { useState } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Plus, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  LayoutGrid, 
  List, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onNewNote, 
  onOpenProfile, 
  onToggleSidebar, 
  viewMode, 
  setViewMode 
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent font-['Outfit']">
                PrivateNotes
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                Vault
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search notes by title, markdown, or tag... (Esc to clear)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500/40 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Note Button */}
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full ring-2 ring-transparent hover:ring-indigo-500/30 transition-all focus:outline-none"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    Account Profile
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
