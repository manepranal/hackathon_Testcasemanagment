import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testRunAPI, TestRun, testSuiteAPI, TestSuite } from '../services/api';

const TestRunList: React.FC = () => {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', suite_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [runsResponse, suitesResponse] = await Promise.all([
        testRunAPI.getAll(),
        testSuiteAPI.getAll()
      ]);
      setRuns(runsResponse.data);
      setSuites(suitesResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await testRunAPI.create({
        name: formData.name,
        suite_id: formData.suite_id ? Number(formData.suite_id) : undefined
      });
      setShowForm(false);
      setFormData({ name: '', suite_id: '' });
      loadData();
    } catch (error) {
      console.error('Error creating test run:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: '#007bff',
      completed: '#28a745',
      aborted: '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const calculatePassRate = (run: TestRun) => {
    if (!run.total_tests || run.total_tests === 0) return 0;
    return Math.round((run.passed! / run.total_tests) * 100);
  };

  return (
    <div className="test-run-list">
      <div className="header">
        <h2>Test Runs</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          Start New Test Run
        </button>
      </div>

      {showForm && (
        <div className="run-form-modal">
          <div className="modal-content">
            <h3>Start New Test Run</h3>
            <form onSubmit={handleCreateRun}>
              <div className="form-group">
                <label htmlFor="name">Run Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="form-control"
                  placeholder="e.g., Release 1.0 Testing"
                />
              </div>
              <div className="form-group">
                <label htmlFor="suite_id">Test Suite</label>
                <select
                  id="suite_id"
                  value={formData.suite_id}
                  onChange={(e) => setFormData({...formData, suite_id: e.target.value})}
                  className="form-control"
                >
                  <option value="">All Test Cases</option>
                  {suites.map(suite => (
                    <option key={suite.id} value={suite.id}>{suite.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Start Run</button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="run-list">
          {runs.map(run => (
            <Link to={`/runs/${run.id}`} key={run.id} className="run-card">
              <div className="run-header">
                <h3>{run.name}</h3>
                <span 
                  className="status badge" 
                  style={{backgroundColor: getStatusColor(run.status)}}
                >
                  {run.status}
                </span>
              </div>
              <div className="run-info">
                <span>Suite: {run.suite_name || 'All Test Cases'}</span>
                <span>Started: {new Date(run.started_at!).toLocaleString()}</span>
                {run.completed_at && (
                  <span>Completed: {new Date(run.completed_at).toLocaleString()}</span>
                )}
              </div>
              {run.total_tests !== undefined && run.total_tests > 0 && (
                <div className="run-stats">
                  <div className="stat-bar">
                    <div 
                      className="stat-bar-fill passed" 
                      style={{width: `${calculatePassRate(run)}%`}}
                    />
                  </div>
                  <div className="stat-numbers">
                    <span className="passed">✓ {run.passed}</span>
                    <span className="failed">✗ {run.failed}</span>
                    <span className="total">Total: {run.total_tests}</span>
                    <span className="pass-rate">{calculatePassRate(run)}% Pass Rate</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestRunList;