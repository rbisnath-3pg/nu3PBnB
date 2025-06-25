const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, 'logs/test-results.json');

// Sample test results with realistic command-line output
const sampleTestResults = [
  {
    id: "1750871768000",
    date: "2025-06-25 1:30:08 PM",
    status: "passed",
    summary: "45 of 45 tests passed",
    coverage: "87.5%",
    details: `PASS src/components/__tests__/AdminDashboard.test.jsx
  ✓ renders admin dashboard (45ms)
  ✓ shows analytics tab by default (23ms)
  ✓ switches between tabs (34ms)
  ✓ displays unread message count (12ms)
  ✓ handles authentication loading state (18ms)
  ✓ shows correct tab icons (15ms)
  ✓ displays user information correctly (22ms)
  ✓ handles tab switching with animations (28ms)
  ✓ shows unread count badge (11ms)
  ✓ refreshes data on tab change (19ms)

PASS src/components/__tests__/HomePage.test.jsx
  ✓ renders homepage (23ms)
  ✓ displays featured listings (18ms)
  ✓ shows search functionality (29ms)
  ✓ handles language switching (25ms)
  ✓ displays property cards correctly (31ms)
  ✓ shows loading states (16ms)
  ✓ handles empty results (14ms)
  ✓ displays pagination (21ms)
  ✓ shows property details on hover (27ms)
  ✓ handles search filters (33ms)

PASS src/components/__tests__/PaymentHistory.test.jsx
  ✓ renders payment history (31ms)
  ✓ displays payment details (25ms)
  ✓ shows payment status (19ms)
  ✓ handles payment filtering (28ms)
  ✓ displays payment amounts correctly (22ms)
  ✓ shows payment dates (17ms)
  ✓ handles empty payment list (13ms)
  ✓ displays payment methods (24ms)
  ✓ shows payment confirmation (20ms)
  ✓ handles payment errors (26ms)

PASS src/components/__tests__/Messaging.test.jsx
  ✓ renders messaging interface (38ms)
  ✓ displays conversation list (29ms)
  ✓ shows message content (25ms)
  ✓ handles message sending (32ms)
  ✓ displays unread indicators (18ms)
  ✓ shows message timestamps (21ms)
  ✓ handles conversation switching (27ms)
  ✓ displays user avatars (16ms)
  ✓ shows typing indicators (19ms)
  ✓ handles message errors (23ms)

PASS src/components/__tests__/AnalyticsDashboard.test.jsx
  ✓ renders analytics dashboard (42ms)
  ✓ displays metrics correctly (31ms)
  ✓ shows charts and graphs (35ms)
  ✓ handles data loading (28ms)
  ✓ displays time range selector (24ms)
  ✓ shows metric comparisons (29ms)
  ✓ handles empty data states (19ms)
  ✓ displays trend indicators (22ms)
  ✓ shows data tooltips (26ms)
  ✓ handles metric filtering (33ms)

Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        2.145s
Ran all test suites.

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   87.50 |    82.35 |   85.71 |   87.50 |                 
----------|---------|----------|---------|---------|-------------------`
  },
  {
    id: "1750871668000",
    date: "2025-06-25 1:20:08 PM",
    status: "failed",
    summary: "42 of 45 tests passed",
    coverage: "85.2%",
    details: `FAIL src/components/__tests__/AdminDashboard.test.jsx
  ✓ renders admin dashboard (45ms)
  ✕ shows analytics tab by default (23ms)
    Expected element to have class 'bg-blue-600' but found 'bg-gray-100'
  ✓ switches between tabs (34ms)
  ✓ displays unread message count (12ms)
  ✓ handles authentication loading state (18ms)
  ✓ shows correct tab icons (15ms)
  ✓ displays user information correctly (22ms)
  ✓ handles tab switching with animations (28ms)
  ✓ shows unread count badge (11ms)
  ✓ refreshes data on tab change (19ms)

FAIL src/components/__tests__/HomePage.test.jsx
  ✓ renders homepage (23ms)
  ✕ displays featured listings (18ms)
    TypeError: Cannot read property 'map' of undefined
  ✓ shows search functionality (29ms)
  ✓ handles language switching (25ms)
  ✓ displays property cards correctly (31ms)
  ✓ shows loading states (16ms)
  ✓ handles empty results (14ms)
  ✓ displays pagination (21ms)
  ✓ shows property details on hover (27ms)
  ✓ handles search filters (33ms)

PASS src/components/__tests__/PaymentHistory.test.jsx
  ✓ renders payment history (31ms)
  ✓ displays payment details (25ms)
  ✓ shows payment status (19ms)
  ✓ handles payment filtering (28ms)
  ✓ displays payment amounts correctly (22ms)
  ✓ shows payment dates (17ms)
  ✓ handles empty payment list (13ms)
  ✓ displays payment methods (24ms)
  ✓ shows payment confirmation (20ms)
  ✓ handles payment errors (26ms)

PASS src/components/__tests__/Messaging.test.jsx
  ✓ renders messaging interface (38ms)
  ✓ displays conversation list (29ms)
  ✓ shows message content (25ms)
  ✓ handles message sending (32ms)
  ✓ displays unread indicators (18ms)
  ✓ shows message timestamps (21ms)
  ✓ handles conversation switching (27ms)
  ✓ displays user avatars (16ms)
  ✓ shows typing indicators (19ms)
  ✓ handles message errors (23ms)

PASS src/components/__tests__/AnalyticsDashboard.test.jsx
  ✓ renders analytics dashboard (42ms)
  ✓ displays metrics correctly (31ms)
  ✓ shows charts and graphs (35ms)
  ✓ handles data loading (28ms)
  ✓ displays time range selector (24ms)
  ✓ shows metric comparisons (29ms)
  ✓ handles empty data states (19ms)
  ✓ displays trend indicators (22ms)
  ✓ shows data tooltips (26ms)
  ✓ handles metric filtering (33ms)

Test Suites: 2 failed, 3 passed, 5 total
Tests:       42 passed, 3 failed, 45 total
Snapshots:   0 total
Time:        2.145s
Ran all test suites.

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   85.20 |    80.15 |   83.45 |   85.20 |                 
----------|---------|----------|---------|---------|-------------------`
  },
  {
    id: "1750871568000",
    date: "2025-06-25 1:10:08 PM",
    status: "passed",
    summary: "43 of 43 tests passed",
    coverage: "89.1%",
    details: `PASS src/components/__tests__/AdminDashboard.test.jsx
  ✓ renders admin dashboard (45ms)
  ✓ shows analytics tab by default (23ms)
  ✓ switches between tabs (34ms)
  ✓ displays unread message count (12ms)
  ✓ handles authentication loading state (18ms)
  ✓ shows correct tab icons (15ms)
  ✓ displays user information correctly (22ms)
  ✓ handles tab switching with animations (28ms)
  ✓ shows unread count badge (11ms)
  ✓ refreshes data on tab change (19ms)

PASS src/components/__tests__/HomePage.test.jsx
  ✓ renders homepage (23ms)
  ✓ displays featured listings (18ms)
  ✓ shows search functionality (29ms)
  ✓ handles language switching (25ms)
  ✓ displays property cards correctly (31ms)
  ✓ shows loading states (16ms)
  ✓ handles empty results (14ms)
  ✓ displays pagination (21ms)
  ✓ shows property details on hover (27ms)
  ✓ handles search filters (33ms)

PASS src/components/__tests__/PaymentHistory.test.jsx
  ✓ renders payment history (31ms)
  ✓ displays payment details (25ms)
  ✓ shows payment status (19ms)
  ✓ handles payment filtering (28ms)
  ✓ displays payment amounts correctly (22ms)
  ✓ shows payment dates (17ms)
  ✓ handles empty payment list (13ms)
  ✓ displays payment methods (24ms)
  ✓ shows payment confirmation (20ms)
  ✓ handles payment errors (26ms)

PASS src/components/__tests__/Messaging.test.jsx
  ✓ renders messaging interface (38ms)
  ✓ displays conversation list (29ms)
  ✓ shows message content (25ms)
  ✓ handles message sending (32ms)
  ✓ displays unread indicators (18ms)
  ✓ shows message timestamps (21ms)
  ✓ handles conversation switching (27ms)
  ✓ displays user avatars (16ms)
  ✓ shows typing indicators (19ms)
  ✓ handles message errors (23ms)

Test Suites: 4 passed, 4 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        1.845s
Ran all test suites.

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   89.10 |    85.25 |   87.80 |   89.10 |                 
----------|---------|----------|---------|---------|-------------------`
  },
  {
    id: "1750871468000",
    date: "2025-06-25 1:00:08 PM",
    status: "running",
    summary: "Running...",
    coverage: "",
    details: `Running tests...

PASS src/components/__tests__/AdminDashboard.test.jsx
  ✓ renders admin dashboard (45ms)
  ✓ shows analytics tab by default (23ms)
  ✓ switches between tabs (34ms)
  ✓ displays unread message count (12ms)
  ✓ handles authentication loading state (18ms)

Test execution in progress...`
  }
];

// Ensure logs directory exists
const logsDir = path.dirname(TEST_RESULTS_FILE);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Write sample test results
fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(sampleTestResults, null, 2));

console.log('✅ Sample test results seeded successfully!');
console.log(`📁 Test results file: ${TEST_RESULTS_FILE}`);
console.log(`📊 Created ${sampleTestResults.length} test runs with realistic command-line output`); 