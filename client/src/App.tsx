import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TestCaseList from './components/TestCaseList';
import TestCaseForm from './components/TestCaseForm';
import TestSuiteList from './components/TestSuiteList';
import TestRunList from './components/TestRunList';
import TestRunDetail from './components/TestRunDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="nav-bar">
          <h1>Test Case Manager</h1>
          <div className="nav-links">
            <Link to="/">Test Cases</Link>
            <Link to="/suites">Test Suites</Link>
            <Link to="/runs">Test Runs</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<TestCaseList />} />
            <Route path="/test-case/new" element={<TestCaseForm />} />
            <Route path="/test-case/:id/edit" element={<TestCaseForm />} />
            <Route path="/suites" element={<TestSuiteList />} />
            <Route path="/runs" element={<TestRunList />} />
            <Route path="/runs/:id" element={<TestRunDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
