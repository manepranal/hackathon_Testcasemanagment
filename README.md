# Test Case Manager

A modern web application for managing test cases, test suites, and test execution tracking.

## Features

- **Test Case Management**: Create, edit, and organize test cases with detailed steps and expected results
- **Test Suite Organization**: Group related test cases into test suites for better organization
- **Test Run Tracking**: Execute test cases and track results with pass/fail/skip/blocked status
- **Filtering & Search**: Filter test cases by suite, status, and priority
- **Real-time Statistics**: View test execution statistics and pass rates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (via better-sqlite3)
- **Styling**: Custom CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd test-case-manager
```

2. Install dependencies:
```bash
npm install-all
```

This will install dependencies for both the frontend and backend.

### Running the Application

1. Start both the frontend and backend servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5002
- Frontend development server on http://localhost:3000

The application will automatically open in your default browser.

## Usage Guide

### Managing Test Cases

1. **Create a Test Case**: Click "Create New Test Case" on the main page
2. **Fill in Details**:
   - Title: Brief description of what's being tested
   - Description: Detailed explanation of the test
   - Preconditions: Any setup required before testing
   - Steps: Step-by-step instructions to perform the test
   - Expected Result: What should happen if the test passes
   - Priority: Set importance level (Low/Medium/High/Critical)
   - Status: Draft/Ready/Obsolete

### Organizing Test Suites

1. Navigate to "Test Suites" tab
2. Click "Create New Suite"
3. Group related test cases together
4. View statistics for each suite

### Running Tests

1. Go to "Test Runs" tab
2. Click "Start New Test Run"
3. Select a test suite or run all test cases
4. Execute each test case and record results:
   - Passed: Test completed successfully
   - Failed: Test did not produce expected results
   - Skipped: Test was not executed
   - Blocked: Test could not be executed due to a blocker
5. Add notes for any failures or issues
6. Complete the test run when finished

## API Endpoints

### Test Cases
- `GET /api/test-cases` - Get all test cases (with optional filters)
- `GET /api/test-cases/:id` - Get a specific test case
- `POST /api/test-cases` - Create a new test case
- `PUT /api/test-cases/:id` - Update a test case
- `DELETE /api/test-cases/:id` - Delete a test case

### Test Suites
- `GET /api/test-suites` - Get all test suites
- `GET /api/test-suites/:id` - Get a specific test suite with its test cases
- `POST /api/test-suites` - Create a new test suite
- `PUT /api/test-suites/:id` - Update a test suite
- `DELETE /api/test-suites/:id` - Delete a test suite
- `GET /api/test-suites/:id/statistics` - Get statistics for a test suite

### Test Runs
- `GET /api/test-runs` - Get all test runs
- `GET /api/test-runs/:id` - Get a specific test run with results
- `POST /api/test-runs` - Create a new test run
- `PUT /api/test-runs/:id/complete` - Mark a test run as completed
- `POST /api/test-runs/:id/results` - Add a test result to a run
- `GET /api/test-runs/:id/statistics` - Get statistics for a test run

## Database Schema

The application uses SQLite with the following tables:
- `test_suites`: Test suite information
- `test_cases`: Individual test cases
- `test_runs`: Test execution runs
- `test_results`: Results for each test case execution

## Development

### Project Structure
```
test-case-manager/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API service layer
│   │   └── App.tsx      # Main app component
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── models/      # TypeScript types
│   │   ├── database/    # Database initialization
│   │   └── index.ts     # Server entry point
└── package.json         # Root package file
```

### Adding New Features

1. Backend: Add new routes in `server/src/routes/`
2. Frontend: Add new components in `client/src/components/`
3. Update API service in `client/src/services/api.ts`
4. Add necessary database migrations in `server/src/database/init.ts`

## License

This project is open source and available under the MIT License.