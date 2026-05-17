import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { registerRoutes } from './server/routes.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Debug Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path}`, {
        body: req.method === 'POST' ? { ...req.body, password: '***' } : undefined,
        headers: { 'content-type': req.headers['content-type'] }
      });
    }
    next();
  });

  // MongoDB Connection (Graceful Failure)
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepai';
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5s timeout
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('Database operations will remain buffered until connection is established.');
    });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState
    });
  });
  registerRoutes(app);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
