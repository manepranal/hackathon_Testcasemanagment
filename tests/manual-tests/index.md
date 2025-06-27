# Manual Test Cases Index

This directory contains organized manual test cases for the PowerAudit application, grouped by functional area.

## Test Categories

### 01. Component Rendering
Tests focused on UI rendering and layout:
- [Test 002: Verify PowerAudit Component Mounts](01-component-rendering/test-002-verify-poweraudit-component-mounts.md) - **High Priority**
- [Test 003: Test Grid Layout Renders](01-component-rendering/test-003-test-grid-layout-renders.md) - Medium Priority
- [Test 004: Confirm Scrolling Behavior](01-component-rendering/test-004-confirm-scrolling-behavior.md) - Medium Priority
- [Test 005: Validate Border Styling](01-component-rendering/test-005-validate-border-styling.md) - Low Priority

### 02. Checklist Functionality
Tests for checklist features and interactions:
- [Test 006: Test Switching Between Tabs](02-checklist-functionality/test-006-test-switching-between-tabs.md) - **High Priority**
- [Test 007: Verify Correct Items Display](02-checklist-functionality/test-007-verify-correct-items-display.md) - **High Priority**
- [Test 008: Validate Filtering Functionality](02-checklist-functionality/test-008-validate-filtering-functionality.md) - Medium Priority
- [Test 009: Check Sorting Behavior](02-checklist-functionality/test-009-check-sorting-behavior.md) - Medium Priority

### 03. Document Handling
Tests for document preview and file management:
- [Test 010: Test Document Preview](03-document-handling/test-010-test-document-preview.md) - **High Priority**
- [Test 011: Verify HEIC Image Support](03-document-handling/test-011-verify-heic-image-support.md) - Medium Priority
- [Test 012: Test PDF Document Handling](03-document-handling/test-012-test-pdf-document-handling.md) - **High Priority**
- [Test 013: Validate File Navigation](03-document-handling/test-013-validate-file-navigation.md) - Medium Priority
- [Test 014: Check Download Unrecognized Files](03-document-handling/test-014-check-download-unrecognized-files.md) - Low Priority

### 04. Checklist Actions
Tests for item actions and workflows:
- [Test 015: Test Accepting Checklist Items](04-checklist-actions/test-015-test-accepting-checklist-items.md) - **Critical Priority**
- [Test 016: Verify Revision Request](04-checklist-actions/test-016-verify-revision-request.md) - **High Priority**
- [Test 017: Test Marking Items Urgent](04-checklist-actions/test-017-test-marking-items-urgent.md) - Medium Priority
- [Test 018: Validate Required Status Toggle](04-checklist-actions/test-018-validate-required-status-toggle.md) - Medium Priority
- [Test 019: Check Comment Posting](04-checklist-actions/test-019-check-comment-posting.md) - Medium Priority

### 05. Compliance Status
Tests for compliance tracking and status management:
- [Test 020: Verify Mark as Compliant Button](05-compliance-status/test-020-verify-mark-as-compliant-button.md) - **Critical Priority**
- [Test 021: Test Mark as Non-Compliant](05-compliance-status/test-021-test-mark-as-non-compliant.md) - **High Priority**
- [Test 022: Validate Compliance Status Updates](05-compliance-status/test-022-validate-compliance-status-updates.md) - **High Priority**
- [Test 023: Check Broker-Specific Compliance](05-compliance-status/test-023-check-broker-specific-compliance.md) - Medium Priority

### 06. Transaction Data
Tests for data loading and display:
- [Test 024: Verify Transaction Data Loading](06-transaction-data/test-024-verify-transaction-data-loading.md) - Medium Priority
- [Test 025: Test Refetch on Mount](06-transaction-data/test-025-test-refetch-on-mount.md) - Medium Priority
- [Test 026: Validate Transaction Details Display](06-transaction-data/test-026-validate-transaction-details-display.md) - **High Priority**
- [Test 027: Check Contact Information Rendering](06-transaction-data/test-027-check-contact-information-rendering.md) - Medium Priority

### 07. State Management
Tests for application state and context:
- [Test 028: Verify ChecklistItemContext State](07-state-management/test-028-verify-checklistitemcontext-state.md) - **High Priority**
- [Test 029: Test Navigation Between Items](07-state-management/test-029-test-navigation-between-items.md) - Medium Priority
- [Test 030: Validate Auto-Selection](07-state-management/test-030-validate-auto-selection.md) - Low Priority
- [Test 031: Check State Persistence](07-state-management/test-031-check-state-persistence.md) - Medium Priority

### 08. Responsive Design
Tests for mobile and responsive behavior:
- [Test 032: Test Layout Viewport Sizes](08-responsive-design/test-032-test-layout-viewport-sizes.md) - **High Priority**
- [Test 033: Verify Scrollbar Behavior](08-responsive-design/test-033-verify-scrollbar-behavior.md) - Low Priority
- [Test 034: Check Component Responsiveness](08-responsive-design/test-034-check-component-responsiveness.md) - Medium Priority
- [Test 035: Validate Mobile View Adaptations](08-responsive-design/test-035-validate-mobile-view-adaptations.md) - **High Priority**
- [Test 036: Check Download Unrecognized Files Copy](08-responsive-design/test-036-check-download-unrecognized-files-copy.md) - Low Priority (Draft)

## Priority Legend
- **Critical**: Must be tested before any release
- **High**: Should be tested for major releases
- **Medium**: Test for feature releases
- **Low**: Test when time permits

## Test Execution Guidelines
1. Execute tests in order of priority within each category
2. Record all test results in the provided sections
3. Document any deviations from expected results
4. Note environmental factors that may affect results
5. Include screenshots or recordings for failed tests when possible