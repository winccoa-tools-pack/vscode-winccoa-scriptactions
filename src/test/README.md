# Tests

This folder contains unit tests, integration tests, test helpers, and test fixtures.

## Structure

- `unit/` – Fast Mocha unit tests (pure TS/JS logic, minimal VS Code API usage)
- `integration/` – VS Code extension-host integration tests (real VS Code API)
- `fixtures/` – Test data (CTL scripts, configurations) copied to `out/` via `npm run compile`
- `test-script-helpers.ts` – Helper utilities for accessing test fixtures

## Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run tests with coverage
npm run test:coverage
npm run test:unit:coverage
npm run test:integration:coverage
```

## Coverage

Coverage is generated via `vscode-test --coverage`.

Output locations:

- `coverage/unitTests/` – Unit test coverage
- `coverage/integrationTests/` – Integration test coverage

Useful files:

- `coverage/<suite>/index.html` – HTML report (open in browser)
- `coverage/<suite>/lcov.info` – LCOV format for CI tooling
- `coverage/<suite>/coverage-summary.json` – JSON summary

## Deterministic Test Discovery

Test selection is **deterministic** via `.vscode-test.mjs` labels.
This prevents stale compiled artifacts in `out/test/**` from being discovered/executed.

Entry points:

- **Unit**: `out/test/unit/index.js` (imports all `*.test.js` files)
- **Integration**: `out/test/integration/vscode-integration.test.js`

## Writing Tests

### Unit Tests

Place in `src/test/unit/` and import in `unit/index.ts`:

```typescript
// src/test/unit/myFeature.test.ts
import * as assert from 'assert';
import { suite, test } from 'mocha';

suite('MyFeature - Unit Tests', () => {
    test('should do something', () => {
        assert.strictEqual(1 + 1, 2);
    });
});
```

```typescript
// src/test/unit/index.ts
import './myFeature.test.js';
```

### Integration Tests

Place in `src/test/integration/vscode-integration.test.ts`:

```typescript
suite('MyCommand - Integration Tests', () => {
    test('should register command', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('winccoa.myCommand'));
    });
});
```

## Test Helpers

### `test-script-helpers.ts`

Helper functions for working with test fixtures:

```typescript
import { getTestScriptPath, readTestScript } from '../test-script-helpers';

// Get path to test script
const scriptPath = getTestScriptPath('simple.ctl');

// Read script content
const content = readTestScript('simple.ctl');
```

## Test Fixtures

Located in `src/test/fixtures/scripts/`:

- **simple.ctl** – Basic script with no arguments
- **withArgs.ctl** – Script that accepts arguments (tests plain string passing)
- **multipleArgs.ctl** – Script with multiple arguments
- **errorScript.ctl** – Script that causes error (tests error handling)

## CI/CD Integration

Tests run automatically in GitHub Actions:

- **Unit tests**: Fast feedback on every PR
- **Integration tests**: Full VS Code integration testing
- **Coverage**: Reported to PR comments

See `.github/workflows/ci-cd.yml` for details.

## Troubleshooting

### Tests not found

Run `npm run compile` to ensure TypeScript is compiled to `out/`.

### Timeout errors

Increase timeout in `.vscode-test.mjs`:

```javascript
mocha: {
    timeout: 10000  // 10 seconds
}
```

### Coverage not generated

Ensure test files are in `out/test/` directory:

```bash
npm run compile
ls out/test/unit/
ls out/test/integration/
```

## Best Practices

1. **Unit tests** should be fast (<100ms per test) and test pure logic
2. **Integration tests** can be slower (seconds) and test VS Code API integration
3. **Keep tests deterministic** – no reliance on external state
4. **Use descriptive test names** – `should do X when Y`
5. **Test error cases** – not just happy paths
