import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Pin, Plus, Eye, Edit3, Check } from 'lucide-react';
import { COLOR_OPTIONS } from './Sidebar';

export default function NoteModal({ isOpen, note, onClose, onSave }) {
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [tags, setTags]           = useState([]);
  const [tagInput, setTagInput]   = useState('');
  const [color, setColor]         = useState('#ffffff');
  const [isPinned, setIsPinned]   = useState(false);
  const [tab, setTab]             = useState('write');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(Array.isArray(note.tags) ? [...note.tags] : []);
      setColor(note.color || '#ffffff');
      setIsPinned(Boolean(note.isPinned));
    } else {
      setTitle(''); setContent(''); setTags([]); setColor('#ffffff'); setIsPinned(false);
    }
    setTab('write'); setError('');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Please provide a note title');
    setLoading(true); setError('');
    try {
      await onSave({ title: title.trim(), content, tags, color, isPinned });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {note ? 'Edit Note' : 'New Note'}
            </span>
            {isPinned && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3 fill-current" /> Pinned
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg transition-colors ${isPinned ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={isPinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">{error}</div>
            )}

            {/* Title */}
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full text-xl font-bold bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none border-b border-slate-100 dark:border-slate-800 pb-3"
            />

            {/* Write / Preview tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit text-xs font-medium">
              {[['write', Edit3, 'Write'], ['preview', Eye, 'Preview']].map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${tab === id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Content */}
            {tab === 'write' ? (
              <textarea
                placeholder="Write in markdown... (# Heading, **bold**, - list)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-600 focus:outline-none resize-none font-mono leading-relaxed"
              />
            ) : (
              <div className="min-h-[200px] p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 prose prose-sm dark:prose-invert max-w-none">
                {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-slate-400 italic text-sm">Nothing to preview yet.</p>}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Tags</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-rose-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                  <input
                    type="text"
                    placeholder="Add tag, press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none flex-1 px-1"
                  />
                  {tagInput && (
                    <button type="button" onClick={addTag} className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Card Color</label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${color === c.value ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-110' : 'hover:scale-110 opacity-75 hover:opacity-100'}`}
                    title={c.name}
                  >
                    {color === c.value && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
