import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import documentRoutes from './routes/document.routes';
import searchRoutes from './routes/search.routes';
import conversationRoutes from './routes/conversation.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api', documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', conversationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});