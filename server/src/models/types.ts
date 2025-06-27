export interface TestSuite {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface TestRun {
  id?: number;
  name: string;
  suite_id?: number;
  started_at?: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'aborted';
}

export interface TestResult {
  id?: number;
  test_run_id: number;
  test_case_id: number;
  status: 'passed' | 'failed' | 'skipped' | 'blocked';
  notes?: string;
  executed_at?: string;
  executed_by?: string;
}