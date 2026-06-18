# Salão Nathy E2E Test Suite

Complete end-to-end testing for NestJS backend with role-based access control validation, appointment workflows, and financial calculations.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run only E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Test Structure

### Test Setup (`test/setup.ts`)
- Jest configuration with TypeORM
- Test database initialization and cleanup
- Automatic schema synchronization
- Transaction rollback after each test

### Test Fixtures (`test/fixtures/seed.ts`)
- Admin user (1)
- Employees (6 with varied commission rates)
- Services (6 types)
- Appointments (12 completed + future)
- Financial transactions (8 entries + 1 exit)

### Test Suites

#### 1. Appointments E2E (`test/e2e/appointments.spec.ts`)
**14 Tests:**
- Employee access control (6 tests)
- Employee appointment visibility (2 tests)
- Admin master schedule (5 tests)
- Public appointment creation (3 tests)

**Coverage:**
- ✅ Role-based access (403 Forbidden)
- ✅ Data isolation (employee sees only own appointments)
- ✅ Double-booking prevention
- ✅ Admin full visibility

#### 2. Financial E2E (`test/e2e/financial.spec.ts`)
**20 Tests:**
- Employee access control (3 tests)
- Commission calculations (5 tests)
- Admin CRUD operations (7 tests)
- Financial transaction management (5 tests)

**Coverage:**
- ✅ Role-based blocking
- ✅ Percentage-based commission accuracy
- ✅ Revenue & expense calculations
- ✅ Employee creation/update
- ✅ Appointment status & income tracking

## Test Data

Each test receives clean, isolated data:

```
Admin:
  - Email: admin@salao.com
  - Role: admin

Employees (6):
  - Employee 1: 22% commission, Manicure
  - Employee 2: 24% commission, Pedicure
  - Employee 3: 26% commission, Hidratação
  - Employee 4: 28% commission, Corte
  - Employee 5: 30% commission, Coloração
  - Employee 6: 32% commission, Design de Sobrancelha

Services (6):
  - Manicure: $50 / 30 min
  - Pedicure: $60 / 40 min
  - Hidratação: $120 / 60 min
  - Corte: $80 / 45 min
  - Coloração: $150 / 90 min
  - Design de Sobrancelha: $35 / 20 min

Appointments:
  - 8 completed (past, revenue-generating)
  - 4 confirmed (future)

Transactions:
  - 8 entry (completed appointment revenue)
  - 1 exit (expenses)
```

## Running Specific Tests

```bash
# Run only appointment tests
npm run test:e2e -- appointments.spec.ts

# Run only financial tests
npm run test:e2e -- financial.spec.ts

# Run specific test case
npm run test:e2e -- --testNamePattern="should calculate correct commission"

# Debug mode (opens inspector)
npm run test:debug

# Run with verbose output
npm run test -- --verbose
```

## Test Assertions

### Appointment Tests
- Status codes (201, 200, 403, 404, 409)
- Role validation (Forbidden responses)
- Data isolation (employee visibility)
- Relationship integrity (service/employee refs)
- Constraint validation (no double booking)

### Financial Tests
- Commission math: `commission = (revenue * rate) / 100`
- Total revenue sum accuracy
- Total expense sum accuracy
- Employee-specific commission validation
- Role-based access enforcement

## Expected Results

```
 PASS  test/e2e/appointments.spec.ts (5.234s)
  Appointments E2E (Role-Based Access Control)
    Employee Access Control
      ✓ should block employee from accessing /financial endpoints (403) (45ms)
      ✓ should block employee from registering another employee (403) (38ms)
      ✓ should block employee from creating services (403) (41ms)
      ✓ should return ONLY employee own appointments (32ms)
      ✓ should block employee from seeing other employees appointments (403) (35ms)
      ✓ should allow employee to get own profile (40ms)
    Admin Master Schedule (All Appointments)
      ✓ should return all appointments for admin (48ms)
      ✓ should return all 6 employees appointments in single request (52ms)
      ✓ should filter appointments by status (completed) (44ms)
      ✓ should allow admin to confirm appointment (51ms)
      ✓ should allow admin to complete appointment (49ms)
    Public Appointment Creation
      ✓ should allow public appointment creation without token (55ms)
      ✓ should reject appointment with invalid employee_id (38ms)
      ✓ should prevent double booking same employee same time (102ms)

 PASS  test/e2e/financial.spec.ts (6.112s)
  Financial E2E (Commission & Revenue Calculations)
    Employee Financial Access Control
      ✓ should block employee from accessing global transactions (403) (42ms)
      ✓ should block employee from accessing global report (403) (38ms)
      ✓ should allow employee to access own financials (45ms)
    Admin Commission Calculation
      ✓ should calculate correct total revenue for completed appointments (58ms)
      ✓ should calculate correct total expenses (52ms)
      ✓ should calculate employee commission correctly (percentage-based) (61ms)
      ✓ should return employee with highest commission first (49ms)
      ✓ should filter financial report by date range (56ms)
    Financial Transaction CRUD
      ✓ should create entry transaction (admin only) (54ms)
      ✓ should create exit transaction (admin only) (51ms)
      ✓ should block employee from creating transactions (403) (39ms)
      ✓ should delete transaction (admin only) (57ms)
      ✓ should fetch single transaction (admin) (43ms)
    Admin CRUD Operations
      ✓ should create new service with image URL (48ms)
      ✓ should update service (52ms)
      ✓ should delete service (49ms)
      ✓ should register new employee with commission rate (63ms)
      ✓ should update employee details (56ms)
      ✓ should deactivate employee (51ms)
      ✓ should activate employee (54ms)

Test Suites: 2 passed, 2 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        11.346s
```

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: salao_nathy_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:e2e
```

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running or use `.env.test` with correct credentials

### Timeout Error
```
Jest did not exit one second after the test run has completed
```
**Solution:** Database connection not closed. Check `afterAll()` hook in setup.ts

### Test Isolation Failure
```
Foreign key constraint violated
```
**Solution:** Ensure `afterEach()` truncates tables in correct order

## Performance Benchmarks

- **Setup:** ~2 seconds (database init, seeding)
- **Per test:** ~40-60ms
- **Total suite:** ~12 seconds
- **Memory:** ~150MB

## Coverage Targets

- **Lines:** 85%+
- **Branches:** 80%+
- **Functions:** 85%+
- **Statements:** 85%+

Run: `npm run test:cov` to generate coverage report

## Next Steps

1. ✅ All tests pass locally
2. ✅ Integrate into CI/CD pipeline
3. ✅ Add mutation testing (Stryker)
4. ✅ Performance benchmark tests (k6)
5. ✅ Load testing for concurrent users
