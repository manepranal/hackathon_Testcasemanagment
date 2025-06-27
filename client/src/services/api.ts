import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TestCase {
  id?: number;
  title: string;
  description?: string;
  preconditions?: string;
  steps: string;
  expected_result: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'ready' | 'obsolete';
  suite_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TestSuite {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  test_cases?: TestCase[];
}

export interface TestRun {
  id?: number;
  name: string;
  suite_id?: number;
  suite_name?: string;
  started_at?: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'aborted';
  total_tests?: number;
  passed?: number;
  failed?: number;
  results?: TestResult[];
}

export interface TestResult {
  id?: number;
  test_run_id: number;
  test_case_id: number;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  notes?: string;
  executed_at?: string;
  executed_by?: string;
  title?: string;
  description?: string;
  priority?: string;
}

export const testCaseAPI = {
  getAll: (params?: any) => api.get<TestCase[]>('/test-cases', { params }),
  getById: (id: number) => api.get<TestCase>(`/test-cases/${id}`),
  create: (data: TestCase) => api.post<TestCase>('/test-cases', data),
  update: (id: number, data: TestCase) => api.put<TestCase>(`/test-cases/${id}`, data),
  delete: (id: number) => api.delete(`/test-cases/${id}`),
  duplicate: (id: number) => api.post<TestCase>(`/test-cases/${id}/duplicate`),
  export: (format: 'json' | 'csv' = 'json') => 
    api.get('/test-cases/export', { 
      params: { format },
      responseType: format === 'csv' ? 'text' : 'json'
    }),
  import: (data: string, format: 'json' | 'csv' = 'json') => 
    api.post('/test-cases/import', { data, format }),
  run: (id: number, executed_by?: string) => 
    api.post<{run_id: number, test_case: TestCase}>(`/test-cases/${id}/run`, { executed_by }),
};

export const testSuiteAPI = {
  getAll: () => api.get<TestSuite[]>('/test-suites'),
  getById: (id: number) => api.get<TestSuite>(`/test-suites/${id}`),
  create: (data: Partial<TestSuite>) => api.post<TestSuite>('/test-suites', data),
  update: (id: number, data: Partial<TestSuite>) => api.put<TestSuite>(`/test-suites/${id}`, data),
  delete: (id: number) => api.delete(`/test-suites/${id}`),
  getStatistics: (id: number) => api.get(`/test-suites/${id}/statistics`),
};

export const testRunAPI = {
  getAll: () => api.get<TestRun[]>('/test-runs'),
  getById: (id: number) => api.get<TestRun>(`/test-runs/${id}`),
  create: (data: Partial<TestRun>) => api.post<TestRun>('/test-runs', data),
  complete: (id: number) => api.put<TestRun>(`/test-runs/${id}/complete`),
  addResult: (id: number, result: Partial<TestResult>) => api.post<TestResult>(`/test-runs/${id}/results`, result),
  getStatistics: (id: number) => api.get(`/test-runs/${id}/statistics`),
};