import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { testCaseRoutes } from './routes/testCases';
import { testSuiteRoutes } from './routes/testSuites';
import { testRunRoutes } from './routes/testRuns';
import { initializeDatabase } from './database/init';

const app = express();
const PORT = process.env.PORT || 5002;

// Configure CORS for production
const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins: string[] = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || '',
      // Add your Vercel URLs here
      'https://test-case-manager.vercel.app',
      'https://test-case-manager-*.vercel.app', // Preview deployments
    ].filter(Boolean);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some((allowed: string) => {
      if (allowed.includes('*')) {
        // Handle wildcard
        const regex = new RegExp(allowed.replace('*', '.*'));
        return regex.test(origin || '');
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In production, you might want to allow all origins temporarily
      // callback(new Error('Not allowed by CORS'));
      callback(null, true); // Temporarily allow all origins
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Use data directory for persistent storage (Render or Railway)
const dbPath = process.env.DATABASE_PATH || 
  (process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'test_cases.db')
    : path.join(__dirname, '../test_cases.db'));

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);
initializeDatabase(db);

app.use('/api/test-cases', testCaseRoutes(db));
app.use('/api/test-suites', testSuiteRoutes(db));
app.use('/api/test-runs', testRunRoutes(db));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database path: ${dbPath}`);
  console.log(`CORS configured for multiple origins`);
});