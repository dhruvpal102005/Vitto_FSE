import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import applicationRoutes from './routes/applicationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// App Routes
app.use('/api', applicationRoutes);

// Error Handler
app.use(errorHandler);

export default app;
