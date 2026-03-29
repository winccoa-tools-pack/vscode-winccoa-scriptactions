# Test Fixtures

This directory contains test fixtures used by the WinCC OA Script Actions test suite.

## Directory Structure

- `scripts/` - CTL script files for testing script execution

## Test Scripts

### simple.ctl
Basic script with no arguments, used to test basic script execution.

### withArgs.ctl
Script that accepts one string argument, used to test argument passing.
**Critical**: Verifies that arguments are passed as plain strings (no `-lflag` prefix).

### multipleArgs.ctl
Script that accepts multiple arguments (string + int), used to test complex argument passing.

### errorScript.ctl
Script that intentionally causes an error, used to test error handling.

## Usage in Tests

```typescript
import { getTestScriptPath, readTestScript } from '../test-script-helpers';

// Get path to test script
const scriptPath = getTestScriptPath('simple.ctl');

// Read script content
const content = readTestScript('simple.ctl');
```
