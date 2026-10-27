import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Pin, Archive, ArchiveRestore, Trash2, RotateCcw, Edit3, Palette, Check } from 'lucide-react';
import { COLOR_OPTIONS } from './Sidebar';

const colorMap = {
  '#ffffff': 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
  '#e0f2fe': 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50',
  '#dcfce7': 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
  '#fef3c7': 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
  '#ffe4e6': 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
  '#f3e8ff': 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export default function NoteCard({ note, onEdit, onTogglePin, onToggleArchive, onTrash, onRestore, onPermanentDelete, onChangeColor, onFilterByTag, viewMode = 'grid' }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const cardBg = colorMap[note.color] || colorMap['#ffffff'];
  const id = note._id || note.id;

  return (
    <div className={`group relative rounded-xl border p-4 flex flex-col gap-3 transition-all duration-150 hover:shadow-md ${cardBg} ${note.isPinned ? 'ring-1 ring-indigo-400/30 dark:ring-indigo-500/20' : ''}`}>
      {/* Pin badge */}
      {note.isPinned && (
        <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60">
          <Pin className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-current" />
        </span>
      )}

      {/* Title */}
      <h3
        onClick={() => onEdit(note)}
        className="font-semibold text-sm text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug pr-6"
      >
        {note.title}
      </h3>

      {/* Content preview */}
      {note.content && (
        <div
          onClick={() => onEdit(note)}
          className="cursor-pointer text-xs text-slate-500 dark:text-slate-400 line-clamp-4 prose prose-xs dark:prose-invert max-w-none prose-p:my-0.5 prose-headings:my-0.5 leading-relaxed"
        >
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      )}

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => { e.stopPropagation(); onFilterByTag?.(tag); }}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        <span className="text-[11px] text-slate-400">{fmt(note.updatedAt || note.createdAt)}</span>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.isDeleted ? (
            <>
              <ActionBtn onClick={() => onRestore(id)} title="Restore" className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50">
                <RotateCcw className="w-3.5 h-3.5" />
              </ActionBtn>
              <ActionBtn onClick={() => onPermanentDelete(id)} title="Delete permanently" className="text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50">
                <Trash2 className="w-3.5 h-3.5" />
              </ActionBtn>
            </>
          ) : (
            <>
              {/* Color picker */}
              <div className="relative">
                <ActionBtn onClick={() => setShowColorPicker(!showColorPicker)} title="Change color" className="text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800">
                  <Palette className="w-3.5 h-3.5" />
                </ActionBtn>
                {showColorPicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                    <div className="absolute bottom-8 right-0 z-40 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-1.5">
                      {COLOR_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                        <button
                          key={c.value}
                          onClick={() => { onChangeColor(id, c.value); setShowColorPicker(false); }}
                          className={`w-5 h-5 rounded-full ${c.bg} hover:scale-125 transition-transform flex items-center justify-center`}
                          title={c.name}
                        >
                          {note.color === c.value && <Check className="w-3 h-3 text-slate-700 dark:text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <ActionBtn onClick={() => onEdit(note)} title="Edit" className="text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800">
                <Edit3 className="w-3.5 h-3.5" />
              </ActionBtn>

              <ActionBtn onClick={() => onTogglePin(id)} title={note.isPinned ? 'Unpin' : 'Pin'} className={note.isPinned ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'}>
                <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
              </ActionBtn>

              <ActionBtn onClick={() => onToggleArchive(id)} title={note.isArchived ? 'Unarchive' : 'Archive'} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800">
                {note.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              </ActionBtn>

              <ActionBtn onClick={() => onTrash(id)} title="Move to trash" className="text-slate-500 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
              </ActionBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, className, children }) {
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-colors ${className}`}>
      {children}
    </button>
  );
}
