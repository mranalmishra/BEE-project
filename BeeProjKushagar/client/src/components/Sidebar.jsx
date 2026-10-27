import React from 'react';
import { 
  FileText, 
  Pin, 
  Archive, 
  Trash2, 
  Tag as TagIcon, 
  Palette, 
  ShieldCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const COLOR_OPTIONS = [
  { name: 'All', value: 'all', bg: 'bg-slate-300 dark:bg-slate-700' },
  { name: 'Default', value: '#ffffff', bg: 'bg-white border border-slate-300 dark:bg-slate-800' },
  { name: 'Sky', value: '#e0f2fe', bg: 'bg-sky-200 dark:bg-sky-900/60' },
  { name: 'Emerald', value: '#dcfce7', bg: 'bg-emerald-200 dark:bg-emerald-900/60' },
  { name: 'Amber', value: '#fef3c7', bg: 'bg-amber-200 dark:bg-amber-900/60' },
  { name: 'Rose', value: '#ffe4e6', bg: 'bg-rose-200 dark:bg-rose-900/60' },
  { name: 'Violet', value: '#f3e8ff', bg: 'bg-purple-200 dark:bg-purple-900/60' }
];

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  selectedTag, 
  setSelectedTag, 
  selectedColor, 
  setSelectedColor, 
  tags = [], 
  counts = {}, 
  isOpen, 
  onClose,
  onOpenProfile
}) {
  const { user } = useAuth();

  const navItems = [
    { id: 'all', label: 'All Notes', icon: FileText, count: counts.all || 0 },
    { id: 'pinned', label: 'Pinned', icon: Pin, count: counts.pinned || 0 },
    { id: 'archive', label: 'Archive', icon: Archive, count: counts.archived || 0 },
    { id: 'trash', label: 'Trash', icon: Trash2, count: counts.trash || 0 },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-slate-100 font-['Outfit']">Navigation</span>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Views */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Views
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive 
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Color Palette Filter */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Color Filter
            </p>
            {selectedColor !== 'all' && (
              <button 
                onClick={() => setSelectedColor('all')} 
                className="text-[11px] text-indigo-500 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(selectedColor === c.value ? 'all' : c.value)}
                className={`w-6 h-6 rounded-full transition-transform ${c.bg} ${
                  selectedColor === c.value 
                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-sm' 
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" /> Tags
            </p>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag('')} 
                className="text-[11px] text-indigo-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 px-1">
            {tags.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1 italic">
                No tags yet. Add tags when editing notes!
              </p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? '' : tag);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">#{tag}</span>
                  {selectedTag === tag && <span className="text-[10px] uppercase font-bold">Active</span>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Info: Per-User Isolation & Current User */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vault Data Isolated</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Your notes are cryptographically scoped to your user ID.
          </p>
        </div>

        {/* Profile Card */}
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user?.name || 'My Profile'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md shrink-0 transition-colors">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
