# Manual Test Cases

This directory contains organized manual test cases for the PowerAudit application.

## Structure

Test cases are organized into the following categories:

```
manual-tests/
├── 01-component-rendering/     # UI and layout tests
├── 02-checklist-functionality/ # Core checklist features
├── 03-document-handling/       # File preview and management
├── 04-checklist-actions/       # User actions and workflows
├── 05-compliance-status/       # Compliance tracking
├── 06-transaction-data/        # Data loading and display
├── 07-state-management/        # Application state tests
└── 08-responsive-design/       # Mobile and responsive tests
```

## Test Case Format

Each test case includes:
- Test ID and priority
- Description and preconditions
- Numbered test steps
- Expected results
- Section for recording test execution results

## Quick Start

1. Review the [Test Index](index.md) for a complete list of tests
2. Start with Critical and High priority tests
3. Use the test execution notes section to record results
4. Document any issues or deviations found

## Test Execution

When executing tests:
- Follow steps exactly as written
- Record the date, tester name, and result
- Add detailed notes about any issues
- Include environment details (browser, device, etc.)

## Updating Tests

To update or add new tests:
1. Follow the existing markdown format
2. Assign appropriate priority levels
3. Update the index file
4. Keep test steps clear and specific