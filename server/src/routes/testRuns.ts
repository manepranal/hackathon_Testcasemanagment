import { Router } from 'express';
import { Database } from 'better-sqlite3';

export function testRunRoutes(db: Database) {
  const router = Router();

  router.get('/', (req, res) => {
    const runs = db.prepare(`
      SELECT tr.*, ts.name as suite_name,
        (SELECT COUNT(*) FROM test_results WHERE test_run_id = tr.id) as total_tests,
        (SELECT COUNT(*) FROM test_results WHERE test_run_id = tr.id AND status = 'passed') as passed,
        (SELECT COUNT(*) FROM test_results WHERE test_run_id = tr.id AND status = 'failed') as failed
      FROM test_runs tr
      LEFT JOIN test_suites ts ON tr.suite_id = ts.id
      ORDER BY tr.started_at DESC
    `).all();
    res.json(runs);
  });

  router.get('/:id', (req, res) => {
    const run = db.prepare(`
      SELECT tr.*, ts.name as suite_name
      FROM test_runs tr
      LEFT JOIN test_suites ts ON tr.suite_id = ts.id
      WHERE tr.id = ?
    `).get(req.params.id);
    
    if (!run) {
      return res.status(404).json({ error: 'Test run not found' });
    }
    
    const results = db.prepare(`
      SELECT tr.*, tc.title, tc.description, tc.priority
      FROM test_results tr
      JOIN test_cases tc ON tr.test_case_id = tc.id
      WHERE tr.test_run_id = ?
      ORDER BY tr.executed_at DESC
    `).all(req.params.id);
    
    res.json({ ...run, results });
  });

  router.post('/', (req, res) => {
    const { name, suite_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const stmt = db.prepare('INSERT INTO test_runs (name, suite_id) VALUES (?, ?)');
    const result = stmt.run(name, suite_id);
    const newRun = db.prepare('SELECT * FROM test_runs WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newRun);
  });

  router.put('/:id/complete', (req, res) => {
    const stmt = db.prepare(`
      UPDATE test_runs 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'running'
    `);
    
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Test run not found or already completed' });
    }
    
    const updatedRun = db.prepare('SELECT * FROM test_runs WHERE id = ?').get(req.params.id);
    res.json(updatedRun);
  });

  router.post('/:id/results', (req, res) => {
    const { test_case_id, status, notes, executed_by } = req.body;
    
    if (!test_case_id || !status) {
      return res.status(400).json({ error: 'Test case ID and status are required' });
    }

    const run = db.prepare('SELECT * FROM test_runs WHERE id = ? AND status = "running"').get(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Test run not found or not running' });
    }

    const stmt = db.prepare(`
      INSERT INTO test_results (test_run_id, test_case_id, status, notes, executed_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(req.params.id, test_case_id, status, notes, executed_by);
    const newResult = db.prepare('SELECT * FROM test_results WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newResult);
  });

  router.get('/:id/statistics', (req, res) => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked
      FROM test_results
      WHERE test_run_id = ?
    `).get(req.params.id);
    
    res.json(stats);
  });

  return router;
}