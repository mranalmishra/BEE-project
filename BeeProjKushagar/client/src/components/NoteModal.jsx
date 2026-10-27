import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Pin, 
  Plus, 
  Eye, 
  Edit3, 
  Palette, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { COLOR_OPTIONS } from './Sidebar';

export default function NoteModal({ isOpen, note, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(Array.isArray(note.tags) ? [...note.tags] : []);
      setColor(note.color || '#ffffff');
      setIsPinned(Boolean(note.isPinned));
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setColor('#ffffff');
      setIsPinned(false);
    }
    setActiveTab('write');
    setError('');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a note title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        content,
        tags,
        color,
        isPinned
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 font-['Outfit']">
              {note ? 'Edit Note' : 'Create New Note'}
            </span>
            {isPinned && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3 fill-current" /> Pinned
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-colors ${
                isPinned
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Pinned to top' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm">
                {error}
              </div>
            )}

            {/* Note Title */}
            <div>
              <input
                type="text"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full text-xl font-bold bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-indigo-500/30 pb-2 transition-all font-['Outfit']"
              />
            </div>

            {/* Markdown / Write View Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'write'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Markdown Preview
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                Supports # Headers, **bold**, lists & code
              </span>
            </div>

            {/* Content Area */}
            {activeTab === 'write' ? (
              <textarea
                placeholder="Write your note in rich markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-2xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-700/80 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none font-mono"
              />
            ) : (
              <div className="min-h-[200px] p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 prose prose-sm dark:prose-invert max-w-none">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-400 italic">No content to preview yet.</p>
                )}
              </div>
            )}

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Tags & Labels
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                  <input
                    type="text"
                    placeholder="Add tag and hit Enter..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none w-full px-1"
                  />
                  {newTagInput && (
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-[10px]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Card Color Theme
              </label>
              <div className="flex items-center gap-2.5">
                {COLOR_OPTIONS.filter((c) => c.value !== 'all').map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                      color === c.value
                        ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {color === c.value && (
                      <Check className="w-3.5 h-3.5 text-slate-800 dark:text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
