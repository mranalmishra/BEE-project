import React from 'react';
import { FileText, Pin, Archive, Trash2, Tag as TagIcon, Palette, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const COLOR_OPTIONS = [
  { name: 'All',     value: 'all',      bg: 'bg-slate-300 dark:bg-slate-600' },
  { name: 'Default', value: '#ffffff',  bg: 'bg-white border border-slate-300 dark:bg-slate-700' },
  { name: 'Sky',     value: '#e0f2fe',  bg: 'bg-sky-300 dark:bg-sky-700' },
  { name: 'Emerald', value: '#dcfce7',  bg: 'bg-emerald-300 dark:bg-emerald-700' },
  { name: 'Amber',   value: '#fef3c7',  bg: 'bg-amber-300 dark:bg-amber-700' },
  { name: 'Rose',    value: '#ffe4e6',  bg: 'bg-rose-300 dark:bg-rose-700' },
  { name: 'Violet',  value: '#f3e8ff',  bg: 'bg-purple-300 dark:bg-purple-700' },
];

export default function Sidebar({ currentTab, setCurrentTab, selectedTag, setSelectedTag, selectedColor, setSelectedColor, tags = [], counts = {}, isOpen, onClose, onOpenProfile }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'all',     label: 'All Notes', icon: FileText, count: counts.all     || 0 },
    { id: 'pinned',  label: 'Pinned',    icon: Pin,      count: counts.pinned  || 0 },
    { id: 'archive', label: 'Archive',   icon: Archive,  count: counts.archived|| 0 },
    { id: 'trash',   label: 'Trash',     icon: Trash2,   count: counts.trash   || 0 },
  ];

  const content = (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 lg:hidden">
        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Menu</span>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Views */}
        <div>
          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Views</p>
          <nav className="space-y-0.5">
            {navItems.map(({ id, label, icon: Icon, count }) => {
              const active = currentTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setCurrentTab(id); onClose?.(); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    {label}
                  </div>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                      active ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Color filter */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Colors
            </p>
            {selectedColor !== 'all' && (
              <button onClick={() => setSelectedColor('all')} className="text-[10px] text-indigo-500 hover:underline">Reset</button>
            )}
          </div>
          <div className="flex items-center gap-2 px-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(selectedColor === c.value ? 'all' : c.value)}
                title={c.name}
                className={`w-5 h-5 rounded-full transition-all ${c.bg} ${
                  selectedColor === c.value
                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                    : 'hover:scale-110 opacity-75 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <TagIcon className="w-3 h-3" /> Tags
            </p>
            {selectedTag && (
              <button onClick={() => setSelectedTag('')} className="text-[10px] text-indigo-500 hover:underline">Clear</button>
            )}
          </div>
          <div className="max-h-44 overflow-y-auto space-y-0.5">
            {tags.length === 0 ? (
              <p className="text-xs text-slate-400 px-2 py-1 italic">No tags yet</p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(selectedTag === tag ? '' : tag); onClose?.(); }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">#{tag}</span>
                  {selectedTag === tag && <span className="text-[9px] font-bold uppercase">Active</span>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer: user + vault badge */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="px-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Data isolated per user</p>
        </div>
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-2xl z-50">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
