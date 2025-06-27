import { Router } from 'express';
import { Database } from 'better-sqlite3';
import { TestCase } from '../models/types';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export function testCaseRoutes(db: Database) {
  const router = Router();

  router.get('/', (req, res) => {
    const { suite_id, status, priority, search } = req.query;
    let query = 'SELECT * FROM test_cases WHERE 1=1';
    const params: any[] = [];

    if (suite_id) {
      query += ' AND suite_id = ?';
      params.push(suite_id);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    
    const testCases = db.prepare(query).all(...params);
    res.json(testCases);
  });

  router.get('/export', (req, res) => {
    const { format = 'json' } = req.query;
    const testCases = db.prepare('SELECT * FROM test_cases').all();
    
    if (format === 'csv') {
      const csv = stringify(testCases, {
        header: true,
        columns: ['id', 'title', 'description', 'preconditions', 'steps', 'expected_result', 'priority', 'status', 'suite_id']
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="test-cases.csv"');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="test-cases.json"');
      res.json(testCases);
    }
  });

  router.get('/:id', (req, res) => {
    const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    res.json(testCase);
  });

  router.post('/', (req, res) => {
    const { title, description, preconditions, steps, expected_result, priority, status, suite_id } = req.body;
    
    if (!title || !steps || !expected_result) {
      return res.status(400).json({ error: 'Title, steps, and expected result are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO test_cases (title, description, preconditions, steps, expected_result, priority, status, suite_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, description, preconditions, steps, expected_result, priority || 'medium', status || 'draft', suite_id);
    const newTestCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(newTestCase);
  });

  router.put('/:id', (req, res) => {
    const { title, description, preconditions, steps, expected_result, priority, status, suite_id } = req.body;
    
    const stmt = db.prepare(`
      UPDATE test_cases 
      SET title = ?, description = ?, preconditions = ?, steps = ?, 
          expected_result = ?, priority = ?, status = ?, suite_id = ?
      WHERE id = ?
    `);
    
    stmt.run(title, description, preconditions, steps, expected_result, priority, status, suite_id, req.params.id);
    const updatedTestCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);
    
    if (!updatedTestCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.json(updatedTestCase);
  });

  router.delete('/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM test_cases WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    res.status(204).send();
  });

  router.post('/:id/duplicate', (req, res) => {
    const originalTestCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);
    
    if (!originalTestCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    const { id, created_at, updated_at, ...testCaseData } = originalTestCase as any;
    testCaseData.title = `${testCaseData.title} (Copy)`;
    testCaseData.status = 'draft';
    
    const columns = Object.keys(testCaseData).join(', ');
    const placeholders = Object.keys(testCaseData).map(() => '?').join(', ');
    const values = Object.values(testCaseData);
    
    const stmt = db.prepare(`INSERT INTO test_cases (${columns}) VALUES (${placeholders})`);
    const result = stmt.run(...values);
    
    const newTestCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTestCase);
  });

  router.post('/import', (req, res) => {
    const { format = 'json', data } = req.body;
    
    try {
      let testCases: any[] = [];
      
      if (format === 'csv') {
        testCases = parse(data, {
          columns: true,
          skip_empty_lines: true
        });
      } else {
        testCases = JSON.parse(data);
      }
      
      const stmt = db.prepare(`
        INSERT INTO test_cases (title, description, preconditions, steps, expected_result, priority, status, suite_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let imported = 0;
      for (const tc of testCases) {
        try {
          stmt.run(
            tc.title || 'Imported Test Case',
            tc.description || '',
            tc.preconditions || '',
            tc.steps || '',
            tc.expected_result || '',
            tc.priority || 'medium',
            tc.status || 'draft',
            tc.suite_id || null
          );
          imported++;
        } catch (error) {
          console.error('Error importing test case:', error);
        }
      }
      
      res.json({ message: `Successfully imported ${imported} test cases` });
    } catch (error) {
      res.status(400).json({ error: 'Invalid import data format' });
    }
  });

  router.post('/:id/run', (req, res) => {
    const { executed_by = 'User' } = req.body;
    const testCaseId = req.params.id;
    
    const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(testCaseId);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    try {
      // Create a quick test run
      const runStmt = db.prepare('INSERT INTO test_runs (name, suite_id) VALUES (?, ?)');
      const runResult = runStmt.run(`Quick Run - ${(testCase as any).title}`, (testCase as any).suite_id);
      const runId = runResult.lastInsertRowid;
      
      res.status(201).json({
        run_id: runId,
        test_case: testCase
      });
    } catch (error) {
      console.error('Error creating test run:', error);
      res.status(500).json({ error: 'Failed to create test run' });
    }
  });

  return router;
}