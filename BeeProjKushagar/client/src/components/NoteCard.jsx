import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Pin, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Palette, 
  MoreVertical,
  Check
} from 'lucide-react';
import { COLOR_OPTIONS } from './Sidebar';

export default function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onTrash,
  onRestore,
  onPermanentDelete,
  onChangeColor,
  onFilterByTag,
  viewMode = 'grid'
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Determine card background style based on note.color
  const colorMap = {
    '#ffffff': 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    '#e0f2fe': 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
    '#dcfce7': 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    '#fef3c7': 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    '#ffe4e6': 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    '#f3e8ff': 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60'
  };

  const cardStyle = colorMap[note.color] || colorMap['#ffffff'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${cardStyle} ${
        note.isPinned ? 'ring-2 ring-indigo-500/20' : ''
      }`}
    >
      <div>
        {/* Card Header: Title & Pin Button */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 
            onClick={() => onEdit(note)}
            className="font-bold text-base text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
          >
            {note.title}
          </h3>

          {!note.isDeleted && (
            <button
              onClick={() => onTogglePin(note._id || note.id)}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                note.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Note Content / Markdown Preview */}
        <div 
          onClick={() => onEdit(note)}
          className="cursor-pointer text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-6 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1"
        >
          {note.content ? (
            <ReactMarkdown>{note.content}</ReactMarkdown>
          ) : (
            <span className="text-slate-400 italic text-xs">Empty note body</span>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFilterByTag) onFilterByTag(tag);
                }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Timestamp & Action Buttons */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span title={`Created: ${formatDate(note.createdAt)}`}>
          {formatDate(note.updatedAt || note.createdAt)}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {note.isDeleted ? (
            // Trashed actions
            <>
              <button
                onClick={() => onRestore(note._id || note.id)}
                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors"
                title="Restore note"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPermanentDelete(note._id || note.id)}
                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                title="Delete permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            // Active actions
            <>
              {/* Color Picker Palette Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                  title="Change color"
                >
                  <Palette className="w-4 h-4" />
                </button>

                {showColorPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowColorPicker(false)} 
                    />
                    <div className="absolute bottom-8 right-0 z-40 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-1.5">
                      {COLOR_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            onChangeColor(note._id || note.id, c.value);
                            setShowColorPicker(false);
                          }}
                          className={`w-5 h-5 rounded-full ${c.bg} transition-transform hover:scale-125 flex items-center justify-center`}
                          title={c.name}
                        >
                          {note.color === c.value && (
                            <Check className="w-3 h-3 text-slate-700 dark:text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => onEdit(note)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                title="Edit note"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Archive / Unarchive */}
              <button
                onClick={() => onToggleArchive(note._id || note.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                title={note.isArchived ? 'Unarchive' : 'Archive'}
              >
                {note.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              </button>

              {/* Move to Trash */}
              <button
                onClick={() => onTrash(note._id || note.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
