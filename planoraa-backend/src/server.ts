import express, { Application, Request, Response } from 'express';
import cors from 'cors';  // ← Make sure this import exists
import dotenv from 'dotenv';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import activityRoutes from './routes/activityRoutes';
import expenseRoutes from './routes/expenseRoutes';
import pollRoutes from './routes/pollRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// ============================================
// CORS Configuration - UPDATE THIS SECTION
// ============================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 'https://planoraa.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Planoraa API is running',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Planoraa API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      trips: '/api/v1/trips',
      activities: '/api/v1/activities',
      expenses: '/api/v1/expenses',
      polls: '/api/v1/polls',
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1', activityRoutes);
app.use('/api/v1', expenseRoutes);
app.use('/api/v1', pollRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/v1/health`);
  console.log('=================================');
});

export default app;
