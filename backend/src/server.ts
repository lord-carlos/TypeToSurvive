import express from 'express';
import cors from 'cors';
import scoresRouter from './routes/scores';

try {
  console.log('Starting server...');

  const app = express();
  const PORT = process.env.PORT || 3001;

  console.log('Configuring middleware...');

  app.use(cors());
  app.use(express.json());

  console.log('Configuring routes...');

  app.use('/api', scoresRouter);

  app.get('/', (_req, res) => {
    res.json({ message: 'TypeToSurvive API' });
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
