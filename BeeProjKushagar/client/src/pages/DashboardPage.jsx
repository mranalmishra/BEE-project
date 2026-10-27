import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  AlertCircle,
  Tag as TagIcon
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import ProfileModal from '../components/ProfileModal';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [allUserNotes, setAllUserNotes] = useState([]); // for counts & tags extraction
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering and navigation states
  const [currentTab, setCurrentTab] = useState('all'); // 'all', 'pinned', 'archive', 'trash'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch all user notes to compute badges and tags
  const fetchCountsAndTags = async () => {
    try {
      const [activeRes, archivedRes, trashRes] = await Promise.all([
        api.get('/notes', { params: { archived: false, deleted: false } }),
        api.get('/notes', { params: { archived: true, deleted: false } }),
        api.get('/notes', { params: { deleted: true } }),
      ]);

      const active = activeRes.data.data || [];
      const archived = archivedRes.data.data || [];
      const trash = trashRes.data.data || [];

      setAllUserNotes([...active, ...archived, ...trash]);
    } catch (err) {
      console.error('Failed to fetch counts and tags:', err);
    }
  };

  // Fetch current view notes
  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      let params = {};

      if (currentTab === 'trash') {
        params.deleted = true;
      } else {
        params.deleted = false;
        if (currentTab === 'archive') {
          params.archived = true;
        } else {
          params.archived = false;
        }
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (selectedTag) {
        params.tag = selectedTag;
      }

      const res = await api.get('/notes', { params });
      let fetched = res.data.data || [];

      // Filter by pinned if tab is pinned
      if (currentTab === 'pinned') {
        fetched = fetched.filter((n) => n.isPinned);
      }

      // Filter by color in client if selected
      if (selectedColor !== 'all') {
        fetched = fetched.filter((n) => n.color === selectedColor);
      }

      setNotes(fetched);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountsAndTags();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [currentTab, searchQuery, selectedTag, selectedColor]);

  // Compute counts
  const counts = useMemo(() => {
    const active = allUserNotes.filter((n) => !n.isDeleted && !n.isArchived);
    const pinned = active.filter((n) => n.isPinned);
    const archived = allUserNotes.filter((n) => !n.isDeleted && n.isArchived);
    const trash = allUserNotes.filter((n) => n.isDeleted);

    return {
      all: active.length,
      pinned: pinned.length,
      archived: archived.length,
      trash: trash.length
    };
  }, [allUserNotes]);

  // Compute unique tag list
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    allUserNotes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [allUserNotes]);

  // Handlers for note CRUD
  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      const id = editingNote._id || editingNote.id;
      const res = await api.put(`/notes/${id}`, noteData);
      setNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? res.data.data : n)));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? res.data.data : n)));
    } else {
      const res = await api.post('/notes', noteData);
      const newNote = res.data.data;
      setNotes((prev) => [newNote, ...prev]);
      setAllUserNotes((prev) => [newNote, ...prev]);
      
      // Joyful celebratory confetti on creation
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
    fetchCountsAndTags();
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.patch(`/notes/${id}/pin`);
      const updated = res.data.data;
      setNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      fetchCountsAndTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not toggle pin status');
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const res = await api.patch(`/notes/${id}/archive`);
      const updated = res.data.data;
      // Remove from current view if active tab was 'all' or 'archive'
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      fetchCountsAndTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not archive note');
    }
  };

  const handleTrash = async (id) => {
    try {
      const res = await api.delete(`/notes/${id}`);
      const updated = res.data.data;
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      fetchCountsAndTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not move note to trash');
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await api.patch(`/notes/${id}/restore`);
      const updated = res.data.data;
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      fetchCountsAndTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not restore note');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this note? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/notes/${id}?permanent=true`);
      setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      setAllUserNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      fetchCountsAndTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete note');
    }
  };

  const handleChangeColor = async (id, color) => {
    try {
      const res = await api.put(`/notes/${id}`, { color });
      const updated = res.data.data;
      setNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
      setAllUserNotes((prev) => prev.map((n) => ((n._id || n.id) === id ? updated : n)));
    } catch (err) {
      console.error('Failed to change color:', err);
    }
  };

  const handleOpenNewNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Split into pinned and others if on 'all' view
  const { pinnedNotes, regularNotes } = useMemo(() => {
    if (currentTab !== 'all') {
      return { pinnedNotes: [], regularNotes: notes };
    }
    return {
      pinnedNotes: notes.filter((n) => n.isPinned),
      regularNotes: notes.filter((n) => !n.isPinned)
    };
  }, [notes, currentTab]);

  const isFiltered = Boolean(searchQuery || selectedTag || selectedColor !== 'all');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewNote={handleOpenNewNote}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
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

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* View Header with Filters Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight capitalize font-['Outfit']">
                  {currentTab === 'all'
                    ? 'All Notes'
                    : currentTab === 'pinned'
                    ? 'Pinned Notes'
                    : currentTab === 'archive'
                    ? 'Archived Vault'
                    : 'Trash Bin'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentTab === 'trash'
                    ? 'Items here can be restored or permanently removed'
                    : `Showing ${notes.length} note${notes.length === 1 ? '' : 's'}`}
                </p>
              </div>

              {/* Active Filter Badges */}
              {isFiltered && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-400">Filters:</span>
                  {searchQuery && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  {selectedTag && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50 flex items-center gap-1">
                      <TagIcon className="w-3 h-3" /> #{selectedTag}
                    </span>
                  )}
                  {selectedColor !== 'all' && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Color Filtered
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag('');
                      setSelectedColor('all');
                    }}
                    className="text-xs text-rose-500 hover:underline font-medium"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <EmptyState
                currentTab={currentTab}
                isFiltered={isFiltered}
                onNewNote={handleOpenNewNote}
                onClearFilter={() => {
                  setSearchQuery('');
                  setSelectedTag('');
                  setSelectedColor('all');
                }}
              />
            ) : (
              <div className="space-y-8">
                {/* Pinned Section if on 'all' tab and has pinned notes */}
                {pinnedNotes.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Pinned Notes ({pinnedNotes.length})
                    </h2>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                          : 'space-y-4'
                      }
                    >
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note._id || note.id}
                          note={note}
                          onEdit={handleOpenEditNote}
                          onTogglePin={handleTogglePin}
                          onToggleArchive={handleToggleArchive}
                          onTrash={handleTrash}
                          onRestore={handleRestore}
                          onPermanentDelete={handlePermanentDelete}
                          onChangeColor={handleChangeColor}
                          onFilterByTag={(tag) => setSelectedTag(tag)}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Section */}
                <div>
                  {pinnedNotes.length > 0 && regularNotes.length > 0 && (
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Other Notes ({regularNotes.length})
                    </h2>
                  )}
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-4'
                    }
                  >
                    {regularNotes.map((note) => (
                      <NoteCard
                        key={note._id || note.id}
                        note={note}
                        onEdit={handleOpenEditNote}
                        onTogglePin={handleTogglePin}
                        onToggleArchive={handleToggleArchive}
                        onTrash={handleTrash}
                        onRestore={handleRestore}
                        onPermanentDelete={handlePermanentDelete}
                        onChangeColor={handleChangeColor}
                        onFilterByTag={(tag) => setSelectedTag(tag)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button (for mobile users) */}
      <button
        onClick={handleOpenNewNote}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-30"
        title="Create Note"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Note Edit/Create Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        note={editingNote}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
