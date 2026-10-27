const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + persistent disk synchronization
class FileStore {
  constructor() {
    this.users = [];
    this.notes = [];
    // Synchronous read — safe because file I/O completes before any request arrives
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.users = parsed.users || [];
        this.notes = parsed.notes || [];
      } catch (err) {
        console.error('Error reading db.json, initializing fresh store:', err.message);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify({ users: this.users, notes: this.notes }, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed writing db.json:', err.message);
    }
  }

  // User Methods
  async findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id) {
    return this.users.find((u) => u._id === id || u.id === id);
  }

  async createUser({ name, email, passwordHash, avatarUrl = '' }) {
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const newUser = {
      _id: id,
      id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatarUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  async updateUser(id, updates) {
    const user = await this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // Note Methods (always scoped strictly to userId)
  async getNotes({ userId, search, tag, isArchived, isDeleted }) {
    let result = this.notes.filter((n) => n.userId === userId);

    if (typeof isDeleted === 'boolean') {
      result = result.filter((n) => Boolean(n.isDeleted) === isDeleted);
    } else {
      // Default: exclude trashed notes unless requested
      result = result.filter((n) => !n.isDeleted);
    }

    if (typeof isArchived === 'boolean') {
      result = result.filter((n) => Boolean(n.isArchived) === isArchived);
    }

    if (tag) {
      const lowerTag = tag.toLowerCase();
      result = result.filter(
        (n) => Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase() === lowerTag)
      );
    }

    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((n) => {
        const titleMatch = (n.title || '').toLowerCase().includes(query);
        const contentMatch = (n.content || '').toLowerCase().includes(query);
        const tagMatch =
          Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagMatch;
      });
    }

    // Sort: pinned first, then newest updatedAt
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    return result;
  }

  async getNoteById(id, userId) {
    return this.notes.find((n) => (n._id === id || n.id === id) && n.userId === userId) || null;
  }

  async createNote({ userId, title, content = '', tags = [], color = '#ffffff', isPinned = false }) {
    const id = 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const newNote = {
      _id: id,
      id,
      userId,
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      color: color || '#ffffff',
      isPinned: Boolean(isPinned),
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.notes.unshift(newNote);
    this.save();
    return newNote;
  }

  async updateNote(id, userId, updates) {
    const note = await this.getNoteById(id, userId);
    if (!note) return null;
    const allowed = ['title', 'content', 'tags', 'color', 'isPinned', 'isArchived', 'isDeleted'];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) {
        note[key] = updates[key];
      }
    });
    note.updatedAt = new Date().toISOString();
    this.save();
    return note;
  }

  async deleteNote(id, userId, permanent = false) {
    const index = this.notes.findIndex((n) => (n._id === id || n.id === id) && n.userId === userId);
    if (index === -1) return null;

    if (permanent) {
      const [deleted] = this.notes.splice(index, 1);
      this.save();
      return deleted;
    } else {
      // Soft delete (move to trash)
      this.notes[index].isDeleted = true;
      this.notes[index].updatedAt = new Date().toISOString();
      this.save();
      return this.notes[index];
    }
  }
}

const store = new FileStore();
module.exports = store;
