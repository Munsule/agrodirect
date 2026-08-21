import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import listingsRouter from './routes/listings';
import usersRouter from './routes/users';
import ordersRouter from './routes/orders';
import walletRouter from './routes/wallet';
import { db } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const listingsCount = db.getListings().length;
  const usersCount = db.getUsers().length;
  const ordersCount = db.getOrders().length;

  res.json({
    status: 'ok',
    service: 'AgroDirect Dedicated Node.js API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    stats: {
      listingsCount,
      usersCount,
      ordersCount,
    },
  });
});

// API Routes
app.use('/api/listings', listingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/wallet', walletRouter);

// Global 404 handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? String(err) : undefined,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 AgroDirect Dedicated Node.js Backend Server Running`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌾 Listings API: http://localhost:${PORT}/api/listings`);
  console.log(`=======================================================`);
});
