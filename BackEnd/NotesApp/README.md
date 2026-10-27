# 📝 PrivateNotes — Full-Stack Multi-User Notes Application

A modern, responsive multi-user notes workspace where each registered user gets a private vault to create, edit, tag, pin, color-code, search, and archive notes. Built following the complete **MERN request cycle**: React Form ➔ Axios ➔ Express Route ➔ Mongoose Model / Store ➔ MongoDB and back.

---

## 🌟 Key Features

1. **Custom Authentication & Session Persistence**:
   - Built-in JWT authentication & bcrypt password hashing from scratch.
   - Per-user data isolation: queries are strictly scoped by `userId` so no user can ever access another user's notes.
   - 1-Click Demo account login for instant testing.
2. **Rich Note Workspace**:
   - Full CRUD across the stack with Markdown formatting (headers, bold, italics, lists, code blocks).
   - Real-time Markdown preview switcher.
   - Tag chip management (create, search, filter).
   - Pin-to-top workflow (`PATCH /api/notes/:id/pin`).
   - Archive workflow (`PATCH /api/notes/:id/archive`).
   - Soft-delete Trash bin (`PATCH /api/notes/:id/restore` & permanent removal).
   - 6 curated pastel card color palettes.
3. **Instant Search & Filtering**:
   - Full-text search across titles, markdown content, and tags.
   - Filter by tag chips or color bubbles.
   - Grid and List view layouts.
4. **User Profile & Security**:
   - Profile management with name update and avatar URL selector (including presets).
   - Secure password change flow verifying current password with bcrypt.
5. **Aesthetic & Responsive UI**:
   - Dark & Light mode toggle with smooth persistence.
   - Tailwind CSS styling with modern typography (Inter & Outfit).
   - Mobile responsive navigation drawer.

---

## ⚡ Zero-Config Ready (No MongoDB Atlas Setup Required!)

By default, the backend operates in **Zero-Config Store Mode**:
- Uses an embedded JSON-backed persistent data store located in `server/data/db.json`.
- Runs immediately on `node server.js` without installing or connecting to MongoDB Atlas!
- Pre-seeded with a demo account:
  - **Email:** `demo@example.com`
  - **Password:** `password123`

### 🔌 Optional: Connecting to MongoDB Atlas
Whenever you want to connect to a live MongoDB Atlas cluster, simply open `server/.env` and add your connection string:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/notes_db?retryWrites=true&w=majority
```
The server will automatically detect the URI, connect via Mongoose models, and log:
`✅ MongoDB Connected successfully`.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Run the install command from root:
```bash
npm run install:all
```
*(Or install inside `server/` and `client/` separately with `npm install`)*

### 2. Start Both Backend & Frontend
Run the dev script:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001](http://localhost:5001)

Alternatively, run in separate terminals:
```bash
# Terminal 1 - Backend API:
cd server
npm run dev

# Terminal 2 - Frontend UI:
cd client
npm run dev
```

---

## 📁 Project Architecture

```
BeeProjKushagar/
├── server/
│   ├── config/
│   │   └── db.js                 # Resilient database connection (Atlas + local fallback)
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, getMe
│   │   ├── notesController.js    # Note CRUD, pin, archive, trash, tags, search
│   │   └── usersController.js    # Update profile, change password
│   ├── data/
│   │   └── db.json               # Auto-generated zero-config store
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & req.user attachment
│   │   └── errorHandler.js       # Centralized Express error handler
│   ├── models/
│   │   ├── Note.js               # Mongoose schema with text indexes
│   │   └── User.js               # Mongoose schema with unique email index
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── notesRoutes.js        # /api/notes routes (all protected & scoped)
│   │   └── userRoutes.js         # /api/users routes
│   ├── services/
│   │   └── store.js              # In-memory / JSON store for zero-config run
│   ├── server.js                 # Express app, CORS, Morgan, route mounting
│   ├── .env                      # Environment config
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmptyState.jsx    # Contextual empty state illustrations
│   │   │   ├── Navbar.jsx        # Search, view toggle, theme switcher, profile menu
│   │   │   ├── NoteCard.jsx      # Note card with markdown preview, pin, color picker
│   │   │   ├── NoteModal.jsx     # Note editor modal with markdown preview & tags
│   │   │   ├── ProfileModal.jsx  # Edit name, avatar, and password change
│   │   │   └── Sidebar.jsx       # Views, tag list, color bubbles, vault security badge
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth provider, JWT token management & session
│   │   │   └── ThemeContext.jsx  # Dark/Light theme provider
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx      # Login, Register, 1-Click Demo login
│   │   │   └── DashboardPage.jsx # Main workspace & note grid
│   │   ├── services/
│   │   │   └── api.js            # Axios client with JWT request interceptor
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── start.js                      # Dual process orchestrator
├── package.json                  # Root runner scripts
└── README.md
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user with hashed password |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get currently authenticated user |

### Notes (`/api/notes`)
*All note routes are protected by auth middleware and scoped to `userId`.*
| Method | Endpoint | Query / Body Params | Description |
|---|---|---|---|
| `GET` | `/api/notes` | `?search=&tag=&archived=&deleted=` | Fetch notes for logged-in user |
| `GET` | `/api/notes/:id` | — | Get single note by ID (user isolated) |
| `POST` | `/api/notes` | `{ title, content, tags, color, isPinned }` | Create note |
| `PUT` | `/api/notes/:id` | `{ title, content, tags, color, ... }` | Update note |
| `DELETE` | `/api/notes/:id` | `?permanent=true` (optional) | Move to trash or delete permanently |
| `PATCH` | `/api/notes/:id/pin` | — | Toggle pin to top |
| `PATCH` | `/api/notes/:id/archive`| — | Toggle archive status |
| `PATCH` | `/api/notes/:id/restore`| — | Restore from trash |

### User Profile (`/api/users`)
| Method | Endpoint | Body Params | Description |
|---|---|---|---|
| `PUT` | `/api/users/me` | `{ name, avatarUrl }` | Update profile information |
| `PUT` | `/api/users/me/password` | `{ currentPassword, newPassword }` | Change user password |

---

## 🎯 Placement Interview Answers (From Assignment Sheet)

- **Q: What happens from clicking Login to seeing the dashboard?**
  > The React form sends a POST request with `{ email, password }` via Axios to `/api/auth/login`. Express validates the request and queries the user. `bcrypt.compare` verifies the password hash. A JWT signed with the secret key is returned. The React frontend stores the token in `localStorage`, updates the `AuthContext`, and redirects/renders the protected dashboard which issues an authenticated GET `/api/notes` with `Authorization: Bearer <token>`.

- **Q: Where do you store the JWT and what are the trade-offs of localStorage vs httpOnly cookie?**
  > `localStorage` is simple to implement and works easily across separate domains (CORS), but is vulnerable to XSS attacks if untrusted scripts run. `httpOnly` cookies protect against XSS because JavaScript cannot read them, but require configuring CORS with `credentials: true` and protection against CSRF (Cross-Site Request Forgery).

- **Q: How does bcrypt work? What is a salt?**
  > A salt is a random cryptographic string appended to the password before hashing to ensure identical passwords produce distinct hashes and prevent rainbow table attacks. Bcrypt uses a configurable work factor (rounds) to intentionally slow down computation, making brute-force attacks computationally infeasible.

- **Q: How do you guarantee one user cannot fetch another user's notes?**
  > The auth middleware decodes the JWT and sets `req.user.id`. Every database query enforces `{ userId: req.user.id }` (e.g. `Note.find({ userId: req.user.id, ... })`). Even if an attacker passes another user's note ID to `/api/notes/:id`, the query fails with 404 because the `userId` does not match.
