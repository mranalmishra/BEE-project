const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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
    this.init();
  }

  async init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.users = parsed.users || [];
        this.notes = parsed.notes || [];
      } catch (err) {
        console.error('Error reading db.json, initializing fresh store:', err.message);
        this.users = [];
        this.notes = [];
      }
    }

    // Seed demo user if no users exist
    if (this.users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const demoPasswordHash = await bcrypt.hash('password123', salt);
      const demoUserId = 'demo-user-uuid-1001';

      const demoUser = {
        _id: demoUserId,
        id: demoUserId,
        name: 'Alex Rivera',
        email: 'demo@example.com',
        passwordHash: demoPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.users.push(demoUser);

      // Seed sample notes
      this.notes.push(
        {
          _id: 'note-101',
          id: 'note-101',
          userId: demoUserId,
          title: 'Welcome to PrivateNotes Workspace! 🚀',
          content: '### Quick Features Tour\n- **Markdown Support**: Headers, *italics*, **bold**, lists and code blocks.\n- **Color & Pinning**: Pin crucial notes to the top and color-code them.\n- **Tags & Search**: Search anything instantly by title, body, or click tags.\n- **Per-user Data Isolation**: Every registered user gets a 100% isolated private vault!',
          tags: ['Guide', 'Welcome'],
          color: '#e0f2fe', // sky
          isPinned: true,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'note-102',
          id: 'note-102',
          userId: demoUserId,
          title: 'Project Architecture & Tech Stack 🛠️',
          content: '**Backend**: Node.js, Express, JWT, bcryptjs, Express-Validator, Morgan\n**Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios\n**Database Ready**: Built-in zero-config store + drop-in Mongoose schemas for MongoDB Atlas!',
          tags: ['Tech', 'MERN'],
          color: '#fef3c7', // amber
          isPinned: true,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'note-103',
          id: 'note-103',
          userId: demoUserId,
          title: 'Sprint Checklist 📝',
          content: '- [x] JWT Authentication & Token Expiry\n- [x] Per-user CRUD Note Routes\n- [x] Pin, Archive & Trash Soft-Delete\n- [x] Dark/Light Theme Switching\n- [ ] Deploy to Render & Vercel',
          tags: ['Tasks', 'Sprint'],
          color: '#dcfce7', // emerald
          isPinned: false,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      this.save();
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
