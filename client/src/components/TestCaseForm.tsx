import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testCaseAPI, TestCase, testSuiteAPI, TestSuite } from '../services/api';

const TestCaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [formData, setFormData] = useState<TestCase>({
    title: '',
    description: '',
    preconditions: '',
    steps: '',
    expected_result: '',
    priority: 'medium',
    status: 'draft',
    suite_id: undefined
  });

  useEffect(() => {
    loadSuites();
    if (isEdit) {
      loadTestCase();
    }
  }, [id]);

  const loadSuites = async () => {
    try {
      const response = await testSuiteAPI.getAll();
      setSuites(response.data);
    } catch (error) {
      console.error('Error loading suites:', error);
    }
  };

  const loadTestCase = async () => {
    try {
      const response = await testCaseAPI.getById(Number(id));
      setFormData(response.data);
    } catch (error) {
      console.error('Error loading test case:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await testCaseAPI.update(Number(id), formData);
      } else {
        await testCaseAPI.create(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving test case:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'suite_id' ? (value ? Number(value) : undefined) : value
    }));
  };

  return (
    <div className="test-case-form">
      <h2>{isEdit ? 'Edit Test Case' : 'Create New Test Case'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="suite_id">Test Suite</label>
          <select
            id="suite_id"
            name="suite_id"
            value={formData.suite_id || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">No Suite</option>
            {suites.map(suite => (
              <option key={suite.id} value={suite.id}>{suite.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="preconditions">Preconditions</label>
          <textarea
            id="preconditions"
            name="preconditions"
            value={formData.preconditions || ''}
            onChange={handleChange}
            rows={3}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="steps">Test Steps *</label>
          <textarea
            id="steps"
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            required
            rows={5}
            className="form-control"
            placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expected_result">Expected Result *</label>
          <textarea
            id="expected_result"
            name="expected_result"
            value={formData.expected_result}
            onChange={handleChange}
            required
            rows={3}
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-control"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="obsolete">Obsolete</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEdit ? 'Update' : 'Create'} Test Case
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCaseForm;