import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Sparkles, AlertCircle, Tag as TagIcon, X } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import ProfileModal from '../components/ProfileModal';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const [notes, setNotes]             = useState([]);
  const [allUserNotes, setAllUserNotes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [currentTab, setCurrentTab]     = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedTag, setSelectedTag]   = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [viewMode, setViewMode]         = useState('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen]     = useState(false);
  const [editingNote, setEditingNote]             = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchCountsAndTags = async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get('/notes', { params: { archived: false, deleted: false } }),
        api.get('/notes', { params: { archived: true,  deleted: false } }),
        api.get('/notes', { params: { deleted: true } }),
      ]);
      setAllUserNotes([...(a.data.data || []), ...(b.data.data || []), ...(c.data.data || [])]);
    } catch {}
  };

  const fetchNotes = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (currentTab === 'trash') {
        params.deleted = true;
      } else {
        params.deleted = false;
        params.archived = currentTab === 'archive';
      }
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedTag) params.tag = selectedTag;

      const res = await api.get('/notes', { params });
      let data = res.data.data || [];
      if (currentTab === 'pinned') data = data.filter((n) => n.isPinned);
      if (selectedColor !== 'all') data = data.filter((n) => n.color === selectedColor);
      setNotes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountsAndTags(); }, []);
  useEffect(() => { fetchNotes(); }, [currentTab, searchQuery, selectedTag, selectedColor]);

  const counts = useMemo(() => ({
    all:      allUserNotes.filter((n) => !n.isDeleted && !n.isArchived).length,
    pinned:   allUserNotes.filter((n) => !n.isDeleted && !n.isArchived && n.isPinned).length,
    archived: allUserNotes.filter((n) => !n.isDeleted && n.isArchived).length,
    trash:    allUserNotes.filter((n) => n.isDeleted).length,
  }), [allUserNotes]);

  const availableTags = useMemo(() => {
    const s = new Set();
    allUserNotes.forEach((n) => n.tags?.forEach((t) => t?.trim() && s.add(t.trim())));
    return Array.from(s).sort();
  }, [allUserNotes]);

  const id = (n) => n._id || n.id;

  const handleSaveNote = async (data) => {
    if (editingNote) {
      const res = await api.put(`/notes/${id(editingNote)}`, data);
      const updated = res.data.data;
      setNotes((p) => p.map((n) => id(n) === id(editingNote) ? updated : n));
      setAllUserNotes((p) => p.map((n) => id(n) === id(editingNote) ? updated : n));
    } else {
      const res = await api.post('/notes', data);
      const newNote = res.data.data;
      setNotes((p) => [newNote, ...p]);
      setAllUserNotes((p) => [newNote, ...p]);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    }
    fetchCountsAndTags();
  };

  const handleTogglePin = async (noteId) => {
    try {
      const res = await api.patch(`/notes/${noteId}/pin`);
      const updated = res.data.data;
      setNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      setAllUserNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      fetchCountsAndTags();
    } catch (err) { alert(err.response?.data?.message || 'Could not toggle pin'); }
  };

  const handleToggleArchive = async (noteId) => {
    try {
      const res = await api.patch(`/notes/${noteId}/archive`);
      const updated = res.data.data;
      setNotes((p) => p.filter((n) => id(n) !== noteId));
      setAllUserNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      fetchCountsAndTags();
    } catch (err) { alert(err.response?.data?.message || 'Could not archive note'); }
  };

  const handleTrash = async (noteId) => {
    try {
      const res = await api.delete(`/notes/${noteId}`);
      const updated = res.data.data;
      setNotes((p) => p.filter((n) => id(n) !== noteId));
      setAllUserNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      fetchCountsAndTags();
    } catch (err) { alert(err.response?.data?.message || 'Could not trash note'); }
  };

  const handleRestore = async (noteId) => {
    try {
      const res = await api.patch(`/notes/${noteId}/restore`);
      const updated = res.data.data;
      setNotes((p) => p.filter((n) => id(n) !== noteId));
      setAllUserNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      fetchCountsAndTags();
    } catch (err) { alert(err.response?.data?.message || 'Could not restore note'); }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note? This cannot be undone.')) return;
    try {
      await api.delete(`/notes/${noteId}?permanent=true`);
      setNotes((p) => p.filter((n) => id(n) !== noteId));
      setAllUserNotes((p) => p.filter((n) => id(n) !== noteId));
      fetchCountsAndTags();
    } catch (err) { alert(err.response?.data?.message || 'Could not delete note'); }
  };

  const handleChangeColor = async (noteId, color) => {
    try {
      const res = await api.put(`/notes/${noteId}`, { color });
      const updated = res.data.data;
      setNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
      setAllUserNotes((p) => p.map((n) => id(n) === noteId ? updated : n));
    } catch {}
  };

  const openNew  = () => { setEditingNote(null); setIsNoteModalOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setIsNoteModalOpen(true); };
  const clearFilters = () => { setSearchQuery(''); setSelectedTag(''); setSelectedColor('all'); };

  const { pinnedNotes, regularNotes } = useMemo(() => {
    if (currentTab !== 'all') return { pinnedNotes: [], regularNotes: notes };
    return { pinnedNotes: notes.filter((n) => n.isPinned), regularNotes: notes.filter((n) => !n.isPinned) };
  }, [notes, currentTab]);

  const isFiltered = Boolean(searchQuery || selectedTag || selectedColor !== 'all');

  const tabLabel = { all: 'All Notes', pinned: 'Pinned', archive: 'Archive', trash: 'Trash' };

  const gridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
    : 'flex flex-col gap-3';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewNote={openNew}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          tags={availableTags}
          counts={counts}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{tabLabel[currentTab]}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentTab === 'trash'
                    ? 'Restore or permanently remove notes'
                    : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Active filter chips */}
              {isFiltered && (
                <div className="flex items-center gap-2 flex-wrap">
                  {searchQuery && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
                      <TagIcon className="w-3 h-3" />#{selectedTag}
                      <button onClick={() => setSelectedTag('')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {selectedColor !== 'all' && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Color filter
                      <button onClick={() => setSelectedColor('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline font-medium">Clear all</button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
              <div className={gridClass}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <EmptyState currentTab={currentTab} isFiltered={isFiltered} onNewNote={openNew} onClearFilter={clearFilters} />
            ) : (
              <div className="space-y-6">
                {/* Pinned section */}
                {pinnedNotes.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Pinned · {pinnedNotes.length}
                    </p>
                    <div className={gridClass}>
                      {pinnedNotes.map((note) => (
                        <NoteCard key={id(note)} note={note} onEdit={openEdit} onTogglePin={handleTogglePin} onToggleArchive={handleToggleArchive} onTrash={handleTrash} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} onChangeColor={handleChangeColor} onFilterByTag={setSelectedTag} viewMode={viewMode} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular section */}
                {regularNotes.length > 0 && (
                  <div>
                    {pinnedNotes.length > 0 && (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                        Other · {regularNotes.length}
                      </p>
                    )}
                    <div className={gridClass}>
                      {regularNotes.map((note) => (
                        <NoteCard key={id(note)} note={note} onEdit={openEdit} onTogglePin={handleTogglePin} onToggleArchive={handleToggleArchive} onTrash={handleTrash} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} onChangeColor={handleChangeColor} onFilterByTag={setSelectedTag} viewMode={viewMode} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={openNew}
        className="fixed bottom-6 right-6 lg:hidden w-13 h-13 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-all z-30"
      >
        <Plus className="w-5 h-5" />
      </button>

      <NoteModal isOpen={isNoteModalOpen} note={editingNote} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveNote} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
