import { Router } from 'express';
import { Database } from 'better-sqlite3';

export function testSuiteRoutes(db: Database) {
  const router = Router();

  router.get('/', (req, res) => {
    const suites = db.prepare('SELECT * FROM test_suites ORDER BY created_at DESC').all();
    res.json(suites);
  });

  router.get('/:id', (req, res) => {
    const suite = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(req.params.id);
    if (!suite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    const testCases = db.prepare('SELECT * FROM test_cases WHERE suite_id = ?').all(req.params.id);
    res.json({ ...suite, test_cases: testCases });
  });

  router.post('/', (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const stmt = db.prepare('INSERT INTO test_suites (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description);
    const newSuite = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newSuite);
  });

  router.put('/:id', (req, res) => {
    const { name, description } = req.body;
    
    const stmt = db.prepare('UPDATE test_suites SET name = ?, description = ? WHERE id = ?');
    stmt.run(name, description, req.params.id);
    
    const updatedSuite = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(req.params.id);
    if (!updatedSuite) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    res.json(updatedSuite);
  });

  router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM test_suites WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Test suite not found' });
    }
    
    res.status(204).send();
  });

  router.get('/:id/statistics', (req, res) => {
    const total = db.prepare('SELECT COUNT(*) as count FROM test_cases WHERE suite_id = ?').get(req.params.id) as { count: number };
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM test_cases WHERE suite_id = ? GROUP BY status').all(req.params.id);
    const byPriority = db.prepare('SELECT priority, COUNT(*) as count FROM test_cases WHERE suite_id = ? GROUP BY priority').all(req.params.id);
    
    res.json({
      total: total?.count || 0,
      by_status: byStatus,
      by_priority: byPriority
    });
  });

  return router;
}