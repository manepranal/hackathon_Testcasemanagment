import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { testCaseRoutes } from './routes/testCases';
import { testSuiteRoutes } from './routes/testSuites';
import { testRunRoutes } from './routes/testRuns';
import { initializeDatabase } from './database/init';

const app = express();
const PORT = process.env.PORT || 5002;

// Configure CORS for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Use data directory for persistent storage (Render or Railway)
const dbPath = process.env.DATABASE_PATH || 
  process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH || '/var/data', 'test_cases.db')
    : path.join(__dirname, '../test_cases.db');

// Ensure directory exists
const fs = require('fs');
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
  console.log(`CORS origin: ${corsOptions.origin}`);
});