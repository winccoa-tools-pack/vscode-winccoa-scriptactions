# Test Architecture - WinCC OA Script Actions

## Folder Structure

```text
src/
├── extension.ts                    # Entry point
├── scriptSelector.ts               # Business Logic
├── extensionOutput.ts              # Utility
├── languageModelTools.ts           # Language Model Integration
│
└── test/
    ├── runTest.ts                  # E2E Test Launcher
    │
    ├── unit/                       # ⚡ Unit Tests (Pure TS Logic)
    │   ├── scriptSelector.test.ts  # Test scriptSelector without VS Code API
    │   ├── outputFormatter.test.ts # Test pure functions
    │   └── helpers.test.ts         # Test utility functions
    │
    ├── integration/                # 🔗 Integration Tests (Mocked VS Code API)
    │   ├── commands.test.ts        # Test commands with mocked vscode
    │   ├── configuration.test.ts   # Test settings with stubs
    │   └── extension.test.ts       # Test extension activation
    │
    └── e2e/                        # 🌐 End-to-End Tests (Real Extension Host)
        ├── index.ts                # E2E Test Suite Runner
        ├── executeScript.test.ts   # Real script execution
        ├── ui.test.ts              # QuickPick interactions
        └── winccoa/                # WinCC OA specific
            ├── runtime.test.ts     # Test with running WinCC OA
            └── scriptExecution.test.ts
```

## Test Types

### 1. Unit Tests (`src/test/unit/`)

**Purpose:** Test pure TypeScript/JavaScript logic without VS Code API

**Characteristics:**

- ✅ **Fast** (milliseconds)
- ✅ **No VS Code Extension Host** needed
- ✅ **No mocking** (or minimal)
- ✅ **Pure functions, utilities, data transformations**

**Run with:**

```bash
npm run test:unit
# or
mocha 'dist/test/unit/**/*.test.js'
```

**Example:**

```typescript
// src/scriptSelector.ts
export function parseScriptArguments(args: string): string[] {
    return args.split(' ').filter(arg => arg.length > 0);
}

// src/test/unit/scriptSelector.test.ts
import * as assert from 'assert';
import { parseScriptArguments } from '../../scriptSelector';

suite('Script Selector - Unit Tests', () => {
    test('Parse single argument', () => {
        const result = parseScriptArguments('testCase1');
        assert.deepStrictEqual(result, ['testCase1']);
    });
    
    test('Parse multiple arguments', () => {
        const result = parseScriptArguments('arg1 arg2 arg3');
        assert.deepStrictEqual(result, ['arg1', 'arg2', 'arg3']);
    });
    
    test('Handle empty string', () => {
        const result = parseScriptArguments('');
        assert.deepStrictEqual(result, []);
    });
});
```

---

### 2. Integration Tests (`src/test/integration/`)

**Purpose:** Test VS Code API integration with mocked dependencies

**Characteristics:**

- ⚡ **Medium speed** (seconds)
- 🎭 **Mocked VS Code API** (using sinon)
- ✅ **Test commands, configuration, context**
- ✅ **No real Extension Host** (faster than E2E)

**Run with:**

```bash
npm run test:integration
# or
mocha 'dist/test/integration/**/*.test.js'
```

**Example:**

```typescript
// src/test/integration/commands.test.ts
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

suite('Commands - Integration Tests', () => {
    let sandbox: sinon.SinonSandbox;
    
    setup(() => {
        sandbox = sinon.createSandbox();
    });
    
    teardown(() => {
        sandbox.restore();
    });
    
    test('executeScript command calls correct function', async () => {
        // Mock vscode.commands
        const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
        
        // Mock terminal creation
        const terminalStub = sandbox.stub(vscode.window, 'createTerminal');
        terminalStub.returns({
            sendText: sandbox.stub(),
            show: sandbox.stub()
        } as any);
        
        // Execute command
        await vscode.commands.executeCommand('winccoa.executeScript', 
            vscode.Uri.file('/test/script.ctl')
        );
        
        // Verify terminal was created
        assert.ok(terminalStub.called);
    });
});
```

---

### 3. E2E Tests (`src/test/e2e/`)

**Purpose:** Test full extension in real VS Code Extension Host

**Characteristics:**

- 🐌 **Slow** (seconds to minutes)
- ✅ **Real VS Code Extension Host**
- ✅ **Real VS Code API** (no mocking)
- ✅ **Full integration testing**
- ✅ **Optional: Real WinCC OA Runtime**

**Run with:**

```bash
npm run test:e2e
# or
node dist/test/runTest.js
```

**Example:**

```typescript
// src/test/e2e/executeScript.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Execute Script - E2E Tests', () => {
    test('Extension should be present', () => {
        const ext = vscode.extensions.getExtension('RichardJanisch.winccoa-script-actions');
        assert.ok(ext);
    });
    
    test('All commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        
        assert.ok(commands.includes('winccoa.executeScript'));
        assert.ok(commands.includes('winccoa.executeScriptWithArgs'));
        assert.ok(commands.includes('winccoa.selectScript'));
    });
    
    test('Execute script with arguments', async function() {
        this.timeout(10000); // E2E tests need more time
        
        // Open test workspace
        const testScript = path.join(__dirname, '../../../DevEnv/scripts/test.ctl');
        const doc = await vscode.workspace.openTextDocument(testScript);
        await vscode.window.showTextDocument(doc);
        
        // Execute command
        await vscode.commands.executeCommand('winccoa.executeScriptWithArgs', 
            vscode.Uri.file(testScript),
            'testParam'
        );
        
        // Verify terminal exists
        assert.ok(vscode.window.terminals.length > 0);
    });
});
```

---

## Test Configuration

### package.json Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "npm run compile && mocha 'dist/test/unit/**/*.test.js'",
    "test:integration": "npm run compile && mocha 'dist/test/integration/**/*.test.js'",
    "test:e2e": "npm run compile && node dist/test/runTest.js",
    "test:coverage": "c8 npm test",
    "test:watch": "mocha --watch 'dist/test/unit/**/*.test.js'"
  }
}
```

### Mocha Configuration (.mocharc.json)

```json
{
  "require": ["source-map-support/register"],
  "ui": "tdd",
  "color": true,
  "timeout": 5000,
  "slow": 1000,
  "spec": [
    "dist/test/unit/**/*.test.js",
    "dist/test/integration/**/*.test.js"
  ]
}
```

### Coverage Configuration (c8)

```json
{
  "c8": {
    "reporter": ["text", "html", "lcov"],
    "exclude": [
      "dist/test/**",
      "**/*.test.js"
    ],
    "all": true
  }
}
```

---

## CI/CD Integration

### GitHub Actions Matrix

```yaml
# .github/workflows/ci-cd.yml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit  # Fast feedback
  
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - run: npm run test:integration
  
  e2e-tests:
    runs-on: ${{ matrix.os }}
    needs: integration-tests
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - run: npm run test:e2e
  
  e2e-winccoa:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - name: Run in Docker with WinCC OA
        run: |
          docker run -v $PWD:/workspace \
            mpokornyetm/winccoa:v3.19.9-full \
            sh -c "xvfb-run npm run test:e2e"
```

---

## Best Practices

### 1. Test Naming Convention

```typescript
// Unit: Pure logic
suite('UtilityName - Unit', () => {
    test('should do X when Y', () => {});
});

// Integration: With mocked VS Code API
suite('CommandName - Integration', () => {
    test('should call vscode.window.showQuickPick', () => {});
});

// E2E: Real Extension Host
suite('FeatureName - E2E', () => {
    test('should execute script in terminal', () => {});
});
```

### 2. Test Isolation

```typescript
suite('CommandTests', () => {
    let sandbox: sinon.SinonSandbox;
    
    setup(() => {
        sandbox = sinon.createSandbox();
    });
    
    teardown(() => {
        sandbox.restore(); // Always cleanup!
    });
});
```

### 3. Async Testing

```typescript
test('Async operation', async () => {
    const result = await someAsyncFunction();
    assert.strictEqual(result, 'expected');
});

test('Timeout for slow tests', async function() {
    this.timeout(10000); // 10 seconds
    await slowOperation();
});
```

### 4. Parametrized Tests

```typescript
const testCases = [
    { input: 'arg1', expected: ['arg1'] },
    { input: 'arg1 arg2', expected: ['arg1', 'arg2'] },
    { input: '', expected: [] }
];

testCases.forEach(({ input, expected }) => {
    test(`Parse arguments: "${input}"`, () => {
        const result = parseScriptArguments(input);
        assert.deepStrictEqual(result, expected);
    });
});
```

---

## WinCC OA Specific Testing

### Mock WinCC OA Runtime

```typescript
// src/test/integration/winccoaMock.ts
import * as sinon from 'sinon';

export function mockWinCCOAEnvironment(sandbox: sinon.SinonSandbox) {
    // Mock Core Extension API
    const coreApi = {
        getActiveProject: sandbox.stub().resolves({
            name: 'TestProject',
            path: '/opt/WinCC_OA/Projects/TestProject'
        }),
        getInstallPath: sandbox.stub().returns('/opt/WinCC_OA')
    };
    
    // Mock extension
    sandbox.stub(vscode.extensions, 'getExtension').returns({
        exports: coreApi
    } as any);
    
    return coreApi;
}
```

### Test with Real WinCC OA (E2E)

```typescript
suite('WinCC OA Runtime - E2E', () => {
    test('Execute script on running project', async function() {
        this.timeout(30000); // WinCC OA startup takes time
        
        // Check if WinCC OA is available
        const winccoaPath = process.env.WINCCOA_PATH || '/opt/WinCC_OA';
        const projectName = process.env.WINCCOA_PROJECT || 'DevEnv';
        
        if (!fs.existsSync(winccoaPath)) {
            this.skip(); // Skip if WinCC OA not available
        }
        
        // Execute script
        await vscode.commands.executeCommand('winccoa.executeScript');
        
        // Verify execution (check terminal output, logs, etc.)
    });
});
```

---

## Summary

| Type        | Speed      | Isolation | VS Code API | Coverage     |
|-------------|------------|-----------|-------------|--------------|
| Unit        | ⚡⚡⚡ Fast  | ✅ High    | ❌ No       | Logic        |
| Integration | ⚡⚡ Medium | 🎭 Mocked   | ✅ Yes      | Commands/API |
| E2E         | 🐌 Slow    | ❌ Low     | ✅ Real     | Full Stack   |

**Recommendation:**

- 70% Unit Tests (fast feedback)
- 20% Integration Tests (verify VS Code integration)
- 10% E2E Tests (smoke tests, critical paths)
