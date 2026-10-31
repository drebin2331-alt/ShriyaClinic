import express from 'express';
import path from 'path';
import { apiRouter } from './api';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', apiRouter);

// Serve static assets from dist in production
const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Clinic Management Backend Server running on http://localhost:${PORT}`);
});

export default app;
