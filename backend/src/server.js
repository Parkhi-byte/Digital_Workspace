// Trigger restart
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cron from 'node-cron';

// Config
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { apiRateLimit } from './middleware/rateLimiter.js';
import { setupSocket } from './socket/socketHandler.js';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Models for cron
import Event from './models/eventModel.js';
import Team from './models/Team.js';
import { createNotifications } from './utils/notificationService.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with robust CORS
const io = new Server(server, {
  cors: {
    origin: true, // Let Socket.io handle the origin from the request
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup uploads directory
const uploadsDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to database
try {
  await connectDB();
  console.log('Database connected successfully');
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Initialize Socket Logic
app.set('socketio', io);
setupSocket(io);

// Apply rate limiting to all API routes
app.use('/api/', apiRateLimit);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(frontendPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const port = process.env.PORT || 4001;

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);

  // Schedule event reminders: Check every hour for events starting in 24 hours
  cron.schedule('0 * * * *', async () => {
    console.log('Running event reminder cron job...');
    const now = new Date();
    const tomorrowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    try {
      const approachingEvents = await Event.find({
        start: { $gte: tomorrowStart, $lte: tomorrowEnd }
      });

      for (const event of approachingEvents) {
        if (event.team) {
          const team = await Team.findById(event.team);
          if (team) {
            const recipientIds = [...team.members, team.owner].map(id => id.toString());
            await createNotifications(recipientIds, {
              title: 'Event Reminder',
              description: `Reminder: The event "${event.title}" starts in 1 day!`,
              type: 'event_reminder',
              link: '/calendar'
            }, io);
          }
        } else {
          await createNotifications([event.user.toString()], {
            title: 'Event Reminder',
            description: `Reminder: Your event "${event.title}" starts in 1 day!`,
            type: 'event_reminder',
            link: '/calendar'
          }, io);
        }
      }
    } catch (error) {
      console.error('Error in event reminder cron:', error);
    }
  });
});


