import express from 'express';
import path from 'path';
import cors from 'cors';
import scoresRouter from './routes/scores';

try {
  console.log('Starting server...');

  const app = express();
  const PORT = 3001;

  app.use(cors());
  app.use(express.json());

  app.use('/api', scoresRouter);

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  console.log(`Starting server on port ${PORT}...`);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (error: any) => {
    console.error('Server error:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Server startup error:', error);
  process.exit(1);
}
