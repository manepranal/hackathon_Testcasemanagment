import { Database } from 'better-sqlite3';

export function initializeDatabase(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_suites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS test_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      preconditions TEXT,
      steps TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('draft', 'ready', 'obsolete')) DEFAULT 'draft',
      suite_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      suite_id INTEGER,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status TEXT CHECK(status IN ('running', 'completed', 'aborted')) DEFAULT 'running',
      FOREIGN KEY(suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_run_id INTEGER NOT NULL,
      test_case_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('passed', 'failed', 'skipped', 'blocked')) NOT NULL,
      notes TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      executed_by TEXT,
      FOREIGN KEY(test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE,
      FOREIGN KEY(test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS update_test_suite_timestamp 
    AFTER UPDATE ON test_suites
    BEGIN
      UPDATE test_suites SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER IF NOT EXISTS update_test_case_timestamp 
    AFTER UPDATE ON test_cases
    BEGIN
      UPDATE test_cases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
}