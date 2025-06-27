import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testRunAPI, TestRun, testCaseAPI, TestCase, TestResult } from '../services/api';

const TestRunDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState<TestRun | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [resultForm, setResultForm] = useState({
    status: 'passed' as TestResult['status'],
    notes: '',
    executed_by: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const runResponse = await testRunAPI.getById(Number(id));
      setRun(runResponse.data);

      if (runResponse.data.suite_id) {
        const casesResponse = await testCaseAPI.getAll({ suite_id: runResponse.data.suite_id });
        setTestCases(casesResponse.data);
      } else {
        const casesResponse = await testCaseAPI.getAll();
        setTestCases(casesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRun = async () => {
    if (window.confirm('Are you sure you want to complete this test run?')) {
      try {
        await testRunAPI.complete(Number(id));
        loadData();
      } catch (error) {
        console.error('Error completing run:', error);
      }
    }
  };

  const handleExecuteTest = async (testCase: TestCase) => {
    setSelectedCase(testCase);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    try {
      await testRunAPI.addResult(Number(id), {
        test_case_id: selectedCase.id!,
        ...resultForm
      });
      setSelectedCase(null);
      setResultForm({ status: 'passed', notes: '', executed_by: '' });
      loadData();
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  const getResultForCase = (caseId: number): TestResult | undefined => {
    return run?.results?.find(r => r.test_case_id === caseId);
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      passed: '✓',
      failed: '✗',
      skipped: '⏭',
      blocked: '⊘'
    };
    return icons[status as keyof typeof icons] || '?';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      passed: '#28a745',
      failed: '#dc3545',
      skipped: '#ffc107',
      blocked: '#6c757d'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  if (loading || !run) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="test-run-detail">
      <div className="header">
        <div>
          <h2>{run.name}</h2>
          <p className="subtitle">Suite: {run.suite_name || 'All Test Cases'}</p>
        </div>
        <div className="header-actions">
          {run.status === 'running' && (
            <button onClick={handleCompleteRun} className="btn btn-success">
              Complete Run
            </button>
          )}
          <button onClick={() => navigate('/runs')} className="btn btn-secondary">
            Back to Runs
          </button>
        </div>
      </div>

      <div className="run-summary">
        <div className="summary-card">
          <h4>Status</h4>
          <p className={`status-${run.status}`}>{run.status}</p>
        </div>
        <div className="summary-card">
          <h4>Started</h4>
          <p>{new Date(run.started_at!).toLocaleString()}</p>
        </div>
        {run.completed_at && (
          <div className="summary-card">
            <h4>Completed</h4>
            <p>{new Date(run.completed_at).toLocaleString()}</p>
          </div>
        )}
        <RunStatistics runId={Number(id)} />
      </div>

      <div className="test-cases-section">
        <h3>Test Cases</h3>
        <div className="test-case-list">
          {testCases.map(testCase => {
            const result = getResultForCase(testCase.id!);
            return (
              <div key={testCase.id} className="test-case-item">
                <div className="case-info">
                  <h4>{testCase.title}</h4>
                  <p>{testCase.description}</p>
                  <div className="case-meta">
                    <span className={`priority priority-${testCase.priority}`}>
                      {testCase.priority}
                    </span>
                  </div>
                </div>
                <div className="case-result">
                  {result ? (
                    <div className="result-display">
                      <span 
                        className="result-status"
                        style={{ color: getStatusColor(result.status) }}
                      >
                        {getStatusIcon(result.status)} {result.status}
                      </span>
                      {result.notes && <p className="result-notes">{result.notes}</p>}
                      <p className="result-meta">
                        By {result.executed_by || 'Unknown'} at {new Date(result.executed_at!).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    run.status === 'running' && (
                      <button 
                        onClick={() => handleExecuteTest(testCase)}
                        className="btn btn-primary btn-sm"
                      >
                        Execute Test
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCase && (
        <div className="result-form-modal">
          <div className="modal-content">
            <h3>Execute Test: {selectedCase.title}</h3>
            <div className="test-details">
              <div className="detail-section">
                <h4>Preconditions</h4>
                <p>{selectedCase.preconditions || 'None'}</p>
              </div>
              <div className="detail-section">
                <h4>Steps</h4>
                <pre>{selectedCase.steps}</pre>
              </div>
              <div className="detail-section">
                <h4>Expected Result</h4>
                <p>{selectedCase.expected_result}</p>
              </div>
            </div>
            <form onSubmit={handleSubmitResult}>
              <div className="form-group">
                <label>Result Status *</label>
                <div className="status-options">
                  {(['passed', 'failed', 'skipped', 'blocked'] as const).map(status => (
                    <label key={status} className="status-option">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={resultForm.status === status}
                        onChange={(e) => setResultForm({...resultForm, status: e.target.value as TestResult['status']})}
                      />
                      <span className={`status-label status-${status}`}>
                        {getStatusIcon(status)} {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={resultForm.notes}
                  onChange={(e) => setResultForm({...resultForm, notes: e.target.value})}
                  rows={3}
                  className="form-control"
                  placeholder="Add any observations or failure details..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="executed_by">Executed By</label>
                <input
                  type="text"
                  id="executed_by"
                  value={resultForm.executed_by}
                  onChange={(e) => setResultForm({...resultForm, executed_by: e.target.value})}
                  className="form-control"
                  placeholder="Your name"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Submit Result</button>
                <button 
                  type="button" 
                  onClick={() => setSelectedCase(null)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RunStatistics: React.FC<{ runId: number }> = ({ runId }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [runId]);

  const loadStats = async () => {
    try {
      const response = await testRunAPI.getStatistics(runId);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  if (!stats) return null;

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  return (
    <>
      <div className="summary-card">
        <h4>Total Tests</h4>
        <p>{stats.total}</p>
      </div>
      <div className="summary-card">
        <h4>Passed</h4>
        <p className="text-success">{stats.passed}</p>
      </div>
      <div className="summary-card">
        <h4>Failed</h4>
        <p className="text-danger">{stats.failed}</p>
      </div>
      <div className="summary-card">
        <h4>Pass Rate</h4>
        <p>{passRate}%</p>
      </div>
    </>
  );
};

export default TestRunDetail;