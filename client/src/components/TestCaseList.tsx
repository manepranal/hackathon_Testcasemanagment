import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testCaseAPI, TestCase, testSuiteAPI, TestSuite, testRunAPI, API_BASE_URL } from '../services/api';

const TestCaseList: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [filters, setFilters] = useState({
    suite_id: '',
    status: '',
    priority: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [previewCase, setPreviewCase] = useState<TestCase | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [runningTest, setRunningTest] = useState<{testCase: TestCase, runId: number} | null>(null);
  const [testResult, setTestResult] = useState<{status: string, notes: string}>({status: '', notes: ''});
  const [runningTests, setRunningTests] = useState<Set<number>>(new Set());
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesResponse, suitesResponse] = await Promise.all([
        testCaseAPI.getAll(filters),
        testSuiteAPI.getAll()
      ]);
      setTestCases(casesResponse.data);
      setSuites(suitesResponse.data);
    } catch (error) {
      console.error('Error loading test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await testCaseAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting test case:', error);
      }
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await testCaseAPI.duplicate(id);
      loadData();
    } catch (error) {
      console.error('Error duplicating test case:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      // Create a direct download link
      const url = `${API_BASE_URL}/test-cases/export?format=${format}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-cases.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting test cases:', error);
    }
  };

  const handleImport = async () => {
    try {
      await testCaseAPI.import(importData, importFormat);
      setShowImportModal(false);
      setImportData('');
      loadData();
    } catch (error) {
      console.error('Error importing test cases:', error);
      alert('Error importing test cases. Please check the format.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleRunTest = async (testCase: TestCase) => {
    try {
      // Add to running tests
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.add(testCase.id!);
        return newSet;
      });
      
      const response = await testCaseAPI.run(testCase.id!);
      setRunningTest({
        testCase,
        runId: response.data.run_id
      });
      setTestResult({status: '', notes: ''});
    } catch (error) {
      console.error('Error starting test run:', error);
      // Remove from running tests on error
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testCase.id!);
        return newSet;
      });
    }
  };

  const handleSubmitTestResult = async () => {
    if (!runningTest || !testResult.status) return;
    
    try {
      await testRunAPI.addResult(runningTest.runId, {
        test_case_id: runningTest.testCase.id!,
        status: testResult.status as 'passed' | 'failed' | 'skipped' | 'blocked',
        notes: testResult.notes,
        executed_by: 'User'
      });
      
      // Complete the test run
      await testRunAPI.complete(runningTest.runId);
      
      // Remove from running tests
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(runningTest.testCase.id!);
        return newSet;
      });
      
      setRunningTest(null);
      setTestResult({status: '', notes: ''});
    } catch (error) {
      console.error('Error submitting test result:', error);
    }
  };

  const getSuiteName = (suiteId?: number) => {
    if (!suiteId) return 'No Suite';
    const suite = suites.find(s => s.id === suiteId);
    return suite?.name || 'Unknown Suite';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[priority as keyof typeof colors] || '#6c757d';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '#6c757d',
      ready: '#28a745',
      obsolete: '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const handleSelectTest = (id: number) => {
    setSelectedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTests.size === testCases.length) {
      setSelectedTests(new Set());
    } else {
      setSelectedTests(new Set(testCases.map(tc => tc.id!)));
    }
  };

  const handleReadSelected = () => {
    if (selectedTests.size === 0) {
      alert('Please select at least one test case to read.');
      return;
    }

    const selectedTestCases = testCases.filter(tc => selectedTests.has(tc.id!));
    const textToRead = selectedTestCases.map(tc => {
      return `Test case: ${tc.title}. 
      Description: ${tc.description || 'No description'}. 
      Priority: ${tc.priority}. 
      Status: ${tc.status}. 
      Preconditions: ${tc.preconditions || 'None'}. 
      Steps: ${tc.steps}. 
      Expected result: ${tc.expected_result}.`;
    }).join('\n\nNext test case: \n\n');

    // Use the Web Speech API
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsReading(true);
      };
      
      utterance.onend = () => {
        setIsReading(false);
      };
      
      utterance.onerror = () => {
        setIsReading(false);
        alert('Error occurred while reading. Please try again.');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  const handleStopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  return (
    <div className="test-case-list">
      <div className="header">
        <h2>Test Cases</h2>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          {selectedTests.size > 0 && (
            <>
              <button 
                onClick={isReading ? handleStopReading : handleReadSelected} 
                className={`btn ${isReading ? 'btn-danger' : 'btn-success'}`}
              >
                {isReading ? '⏹️ Stop Reading' : '🔊 Read Selected'} ({selectedTests.size})
              </button>
              <button onClick={() => setSelectedTests(new Set())} className="btn btn-secondary">
                Clear Selection
              </button>
            </>
          )}
          <button onClick={() => handleExport('json')} className="btn btn-secondary">Export JSON</button>
          <button onClick={() => handleExport('csv')} className="btn btn-secondary">Export CSV</button>
          <button onClick={() => setShowImportModal(true)} className="btn btn-secondary">Import</button>
          <Link to="/test-case/new" className="btn btn-primary">Create New Test Case</Link>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search test cases..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="search-input"
        />
        
        <select 
          value={filters.suite_id} 
          onChange={(e) => setFilters({...filters, suite_id: e.target.value})}
          className="filter-select"
        >
          <option value="">All Suites</option>
          {suites.map(suite => (
            <option key={suite.id} value={suite.id}>{suite.name}</option>
          ))}
        </select>

        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="ready">Ready</option>
          <option value="obsolete">Obsolete</option>
        </select>

        <select 
          value={filters.priority} 
          onChange={(e) => setFilters({...filters, priority: e.target.value})}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {testCases.length > 0 && (
            <div style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={selectedTests.size === testCases.length && testCases.length > 0}
                  onChange={handleSelectAll}
                  style={{width: '18px', height: '18px', cursor: 'pointer'}}
                />
                <span style={{fontWeight: 500}}>Select All</span>
              </label>
              <span style={{color: '#666', fontSize: '0.9rem'}}>
                {selectedTests.size} of {testCases.length} selected
              </span>
            </div>
          )}
          <div className="test-case-grid">
          {testCases.map(testCase => (
            <div key={testCase.id} className={`test-case-card ${runningTests.has(testCase.id!) ? 'running' : ''} ${selectedTests.has(testCase.id!) ? 'selected' : ''}`}>
              <div className="card-header">
                <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1}}>
                  <input
                    type="checkbox"
                    checked={selectedTests.has(testCase.id!)}
                    onChange={() => handleSelectTest(testCase.id!)}
                    onClick={(e) => e.stopPropagation()}
                    style={{marginTop: '0.25rem', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0}}
                  />
                  <h3 style={{margin: 0, flex: 1}}>{testCase.title}</h3>
                </div>
                <div className="card-actions">
                  <button 
                    onClick={() => handleRunTest(testCase)} 
                    className="btn-icon" 
                    title={runningTests.has(testCase.id!) ? "Test is currently running" : "Run this test case"}
                    disabled={runningTests.has(testCase.id!)}
                  >
                    {runningTests.has(testCase.id!) ? '⏳' : '▶️'}
                  </button>
                  <button onClick={() => setPreviewCase(testCase)} className="btn-icon" title="Preview test case details">👁️</button>
                  <Link to={`/test-case/${testCase.id}/edit`} className="btn-icon" title="Edit test case">✏️</Link>
                  <button onClick={() => handleDuplicate(testCase.id!)} className="btn-icon" title="Create a duplicate of this test case">📋</button>
                  <button onClick={() => handleDelete(testCase.id!)} className="btn-icon" title="Delete this test case">🗑️</button>
                </div>
              </div>
              {runningTests.has(testCase.id!) && (
                <div className="running-indicator">
                  <span className="pulse-dot"></span>
                  <span className="running-text">Test Running...</span>
                </div>
              )}
              <p className="description">{testCase.description || 'No description'}</p>
              <div className="card-meta">
                <span className="suite">{getSuiteName(testCase.suite_id)}</span>
                <span 
                  className="priority badge" 
                  style={{backgroundColor: getPriorityColor(testCase.priority)}}
                >
                  {testCase.priority}
                </span>
                <span 
                  className="status badge" 
                  style={{backgroundColor: getStatusColor(testCase.status)}}
                >
                  {testCase.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {previewCase && (
        <div className="preview-modal" onClick={() => setPreviewCase(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-header-content">
                <h2>{previewCase.title}</h2>
                <div className="preview-badges">
                  <span className={`badge priority-${previewCase.priority}`}>
                    {previewCase.priority}
                  </span>
                  <span className={`badge status-${previewCase.status}`}>
                    {previewCase.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setPreviewCase(null)} className="close-btn">×</button>
            </div>
            
            <div className="preview-body">
              <div className="preview-info-grid">
                <div className="info-card">
                  <h5>Suite</h5>
                  <p>{getSuiteName(previewCase.suite_id)}</p>
                </div>
                <div className="info-card">
                  <h5>Created</h5>
                  <p>{new Date(previewCase.created_at || '').toLocaleDateString()}</p>
                </div>
                <div className="info-card">
                  <h5>Updated</h5>
                  <p>{new Date(previewCase.updated_at || '').toLocaleDateString()}</p>
                </div>
              </div>

              {previewCase.description && (
                <div className="preview-section">
                  <h4>📝 Description</h4>
                  <p>{previewCase.description}</p>
                </div>
              )}

              {previewCase.preconditions && (
                <div className="preview-section">
                  <h4>⚡ Preconditions</h4>
                  <p>{previewCase.preconditions}</p>
                </div>
              )}

              <div className="preview-section">
                <h4>📋 Test Steps</h4>
                <pre className="steps-content">{previewCase.steps}</pre>
              </div>

              <div className="preview-section">
                <h4>✅ Expected Result</h4>
                <p className="expected-result">{previewCase.expected_result}</p>
              </div>
            </div>

            <div className="preview-footer">
              <Link to={`/test-case/${previewCase.id}/edit`} className="btn btn-primary">
                <span style={{marginRight: '0.5rem'}}>✏️</span> Edit Test Case
              </Link>
              <button onClick={() => handleRunTest(previewCase)} className="btn btn-success">
                <span style={{marginRight: '0.5rem'}}>▶️</span> Run Test
              </button>
              <button onClick={() => setPreviewCase(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="preview-modal" onClick={() => setShowImportModal(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Import Test Cases</h2>
              <button onClick={() => setShowImportModal(false)} className="close-btn">×</button>
            </div>
            <div className="preview-body">
              <div className="form-group">
                <label>Select Format:</label>
                <select 
                  value={importFormat} 
                  onChange={(e) => setImportFormat(e.target.value as 'json' | 'csv')}
                  className="form-control"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Upload File:</label>
                <input 
                  type="file" 
                  accept={importFormat === 'json' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Or Paste Data:</label>
                <textarea 
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="form-control"
                  rows={10}
                  placeholder={importFormat === 'json' ? 
                    'Paste JSON array of test cases...' : 
                    'Paste CSV data with headers: title,description,preconditions,steps,expected_result,priority,status,suite_id'
                  }
                />
              </div>
              
              <div className="preview-footer">
                <button 
                  onClick={handleImport} 
                  className="btn btn-primary"
                  disabled={!importData}
                >
                  Import Test Cases
                </button>
                <button onClick={() => setShowImportModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {runningTest && (
        <div className="preview-modal" onClick={() => {
          // Remove from running tests when cancelled
          setRunningTests(prev => {
            const newSet = new Set(prev);
            newSet.delete(runningTest.testCase.id!);
            return newSet;
          });
          setRunningTest(null);
        }}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Run Test: {runningTest.testCase.title}</h2>
              <button onClick={() => {
                // Remove from running tests when cancelled
                setRunningTests(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(runningTest.testCase.id!);
                  return newSet;
                });
                setRunningTest(null);
              }} className="close-btn">×</button>
            </div>
            <div className="preview-body">
              <div className="detail-section">
                <h4>Test Case Details</h4>
                <p><strong>Description:</strong> {runningTest.testCase.description || 'No description'}</p>
                {runningTest.testCase.preconditions && (
                  <p><strong>Preconditions:</strong> {runningTest.testCase.preconditions}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Test Steps</h4>
                <pre className="steps-content">{runningTest.testCase.steps}</pre>
              </div>

              <div className="detail-section">
                <h4>Expected Result</h4>
                <p>{runningTest.testCase.expected_result}</p>
              </div>

              <div className="form-group">
                <label>Test Result:</label>
                <div className="status-options">
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="passed"
                      checked={testResult.status === 'passed'}
                      onChange={(e) => setTestResult({...testResult, status: e.target.value})}
                    />
                    <span className="status-label status-passed">Passed</span>
                  </label>
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="failed"
                      checked={testResult.status === 'failed'}
                      onChange={(e) => setTestResult({...testResult, status: e.target.value})}
                    />
                    <span className="status-label status-failed">Failed</span>
                  </label>
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="skipped"
                      checked={testResult.status === 'skipped'}
                      onChange={(e) => setTestResult({...testResult, status: e.target.value})}
                    />
                    <span className="status-label status-skipped">Skipped</span>
                  </label>
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="blocked"
                      checked={testResult.status === 'blocked'}
                      onChange={(e) => setTestResult({...testResult, status: e.target.value})}
                    />
                    <span className="status-label status-blocked">Blocked</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={testResult.notes}
                  onChange={(e) => setTestResult({...testResult, notes: e.target.value})}
                  className="form-control"
                  rows={4}
                  placeholder="Add any notes about the test execution..."
                />
              </div>

              <div className="preview-footer">
                <button 
                  onClick={handleSubmitTestResult} 
                  className="btn btn-primary"
                  disabled={!testResult.status}
                >
                  Submit Result
                </button>
                <button onClick={() => {
                  // Remove from running tests when cancelled
                  setRunningTests(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(runningTest.testCase.id!);
                    return newSet;
                  });
                  setRunningTest(null);
                }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseList;