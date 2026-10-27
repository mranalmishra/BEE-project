import React from 'react';
import { 
  FileText, 
  Pin, 
  Archive, 
  Trash2, 
  SearchX, 
  Plus 
} from 'lucide-react';

export default function EmptyState({ currentTab, isFiltered, onNewNote, onClearFilter }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 font-['Outfit']">
          No matching notes found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
          We couldn't find any notes matching your search or active filters.
        </p>
        <button
          onClick={onClearFilter}
          className="px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  const tabConfigs = {
    all: {
      icon: FileText,
      title: 'Your workspace is empty',
      desc: 'Capture thoughts, meeting minutes, code snippets, and ideas in rich markdown.',
      buttonText: 'Create your first note',
      action: onNewNote
    },
    pinned: {
      icon: Pin,
      title: 'No pinned notes',
      desc: 'Pin key notes to keep them anchored at the top of your workspace.',
      buttonText: null,
      action: null
    },
    archive: {
      icon: Archive,
      title: 'Archive is empty',
      desc: 'Completed or old notes that you archive will be kept safe here.',
      buttonText: null,
      action: null
    },
    trash: {
      icon: Trash2,
      title: 'Trash is empty',
      desc: 'Deleted notes appear here before permanent removal.',
      buttonText: null,
      action: null
    }
  };

  const config = tabConfigs[currentTab] || tabConfigs.all;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 font-['Outfit']">
        {config.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {config.desc}
      </p>
      {config.buttonText && config.action && (
        <button
          onClick={config.action}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          {config.buttonText}
        </button>
      )}
    </div>
  );
}
