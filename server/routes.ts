import { Express } from 'express';
import authRoutes from './routes/auth.ts';
import resumeRoutes from './routes/resume.ts';
import interviewRoutes from './routes/interview.ts';
import dashboardRoutes from './routes/dashboard.ts';
import jdMatchRoutes from './routes/jdMatch.ts';

export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/resume', resumeRoutes);
  app.use('/api/interview', interviewRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/jd-match', jdMatchRoutes);
}
