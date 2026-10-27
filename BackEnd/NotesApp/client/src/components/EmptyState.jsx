import React from 'react';
import { FileText, Pin, Archive, Trash2, SearchX, Plus } from 'lucide-react';

export default function EmptyState({ currentTab, isFiltered, onNewNote, onClearFilter }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-4">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">No results found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-5">
          No notes match your current search or filters.
        </p>
        <button
          onClick={onClearFilter}
          className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  const configs = {
    all:     { icon: FileText, title: 'No notes yet',      desc: 'Create your first note to get started.',              btn: 'Create note' },
    pinned:  { icon: Pin,      title: 'No pinned notes',   desc: 'Pin important notes to keep them at the top.',        btn: null },
    archive: { icon: Archive,  title: 'Archive is empty',  desc: 'Archived notes will appear here.',                    btn: null },
    trash:   { icon: Trash2,   title: 'Trash is empty',    desc: 'Deleted notes appear here before permanent removal.', btn: null },
  };

  const { icon: Icon, title, desc, btn } = configs[currentTab] || configs.all;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{desc}</p>
      {btn && (
        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {btn}
        </button>
      )}
    </div>
  );
}
