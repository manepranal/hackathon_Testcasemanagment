import React, { useState, useEffect } from 'react';
import { testSuiteAPI, TestSuite } from '../services/api';

const TestSuiteList: React.FC = () => {
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadSuites();
  }, []);

  const loadSuites = async () => {
    try {
      setLoading(true);
      const response = await testSuiteAPI.getAll();
      setSuites(response.data);
    } catch (error) {
      console.error('Error loading suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSuite) {
        await testSuiteAPI.update(editingSuite.id!, formData);
      } else {
        await testSuiteAPI.create(formData);
      }
      setShowForm(false);
      setEditingSuite(null);
      setFormData({ name: '', description: '' });
      loadSuites();
    } catch (error) {
      console.error('Error saving suite:', error);
    }
  };

  const handleEdit = (suite: TestSuite) => {
    setEditingSuite(suite);
    setFormData({ name: suite.name, description: suite.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test suite? All associated test cases will also be deleted.')) {
      try {
        await testSuiteAPI.delete(id);
        loadSuites();
      } catch (error) {
        console.error('Error deleting suite:', error);
      }
    }
  };

  return (
    <div className="test-suite-list">
      <div className="header">
        <h2>Test Suites</h2>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditingSuite(null);
            setFormData({ name: '', description: '' });
          }} 
          className="btn btn-primary"
        >
          Create New Suite
        </button>
      </div>

      {showForm && (
        <div className="suite-form-modal">
          <div className="modal-content">
            <h3>{editingSuite ? 'Edit' : 'Create'} Test Suite</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="form-control"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingSuite ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingSuite(null);
                  }} 
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
        <div className="suite-grid">
          {suites.map(suite => (
            <SuiteCard
              key={suite.id}
              suite={suite}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SuiteCardProps {
  suite: TestSuite;
  onEdit: (suite: TestSuite) => void;
  onDelete: (id: number) => void;
}

const SuiteCard: React.FC<SuiteCardProps> = ({ suite, onEdit, onDelete }) => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [suite.id]);

  const loadStats = async () => {
    try {
      const response = await testSuiteAPI.getStatistics(suite.id!);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="suite-card">
      <div className="card-header">
        <h3>{suite.name}</h3>
        <div className="card-actions">
          <button onClick={() => onEdit(suite)} className="btn-icon">✏️</button>
          <button onClick={() => onDelete(suite.id!)} className="btn-icon">🗑️</button>
        </div>
      </div>
      <p className="description">{suite.description || 'No description'}</p>
      {stats && (
        <div className="suite-stats">
          <div className="stat">
            <span className="stat-label">Total Cases:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">By Status:</span>
            <div className="stat-breakdown">
              {stats.by_status.map((item: any) => (
                <span key={item.status} className={`status-${item.status}`}>
                  {item.status}: {item.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSuiteList;