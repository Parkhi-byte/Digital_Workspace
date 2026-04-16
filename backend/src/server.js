import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import cron from 'node-cron';

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
import adminRoutes from './routes/adminRoutes.js';
import { apiRateLimit } from './middleware/rateLimiter.js';
import { setupSocket } from './socket/socketHandler.js';
import Event from './models/eventModel.js';
import Team from './models/Team.js';
import { createNotifications } from './utils/notificationService.js';

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL, // e.g. https://your-app.vercel.app
].filter(Boolean);

// Helper: check if an origin is allowed (includes *.vercel.app for preview deploys)
const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow server-to-server / non-browser
  if (ALLOWED_ORIGINS.some(o => origin === o)) return true;
  if (origin.endsWith('.vercel.app')) return true; // allow all Vercel preview URLs
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(new Error(`Socket CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Keep alive — prevents Render free tier idle disconnects
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});


const uploadsDir = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

try {
  await connectDB();
  console.log('Database connected successfully');
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) callback(null, true);
    else callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());

app.set('socketio', io);
setupSocket(io);

app.use('/api/', apiRateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => res.sendFile(path.resolve(frontendPath, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running...'));
}

app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const port = process.env.PORT || 4001;

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);

  cron.schedule('0 * * * *', async () => {
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
