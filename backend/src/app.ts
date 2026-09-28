import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import documentRoutes from './routes/document.routes';
import searchRoutes from './routes/search.routes';
import conversationRoutes from './routes/conversation.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : true;

app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', conversationRoutes);

app.use(errorHandler);

export default app;