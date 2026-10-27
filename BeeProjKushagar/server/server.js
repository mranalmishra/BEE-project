require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Database Connection
connectDB();

// CORS configuration (allow Vite client origin or localhost)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive fallback
      }
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());

// HTTP logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root / Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'PrivateNotes MERN Backend API',
    endpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
      notes: ['/api/notes', '/api/notes/:id', '/api/notes/:id/pin', '/api/notes/:id/archive'],
      users: ['/api/users/me', '/api/users/me/password']
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`🚀 Notes API server running on http://localhost:${PORT}`);
  console.log(`🔒 Authentication & Note endpoints ready`);
});

module.exports = app;
