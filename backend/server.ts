import express from 'express';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints can be added here
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

const port = process.env.BACKEND_PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export { app, server };
