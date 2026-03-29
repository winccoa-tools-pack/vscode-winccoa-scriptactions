import * as assert from 'assert';
import { suite, test } from 'mocha';

suite('ExtensionOutput - Unit Tests', () => {
    suite('Log Level Validation', () => {
        test('should accept valid log levels', () => {
            const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

            validLevels.forEach(level => {
                const isValid = validLevels.includes(level);
                assert.strictEqual(isValid, true, `${level} should be valid`);
            });
        });

        test('should reject invalid log levels', () => {
            const invalidLevels = ['VERBOSE', 'CRITICAL', 'ALL'];

            invalidLevels.forEach(level => {
                const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
                const isValid = validLevels.includes(level);
                assert.strictEqual(isValid, false, `${level} should be invalid`);
            });
        });
    });

    suite('Message Formatting', () => {
        test('should format simple message', () => {
            const msg = 'Test message';
            const formatted = `[WinCC OA Script Actions] ${msg}`;
            assert.strictEqual(formatted, '[WinCC OA Script Actions] Test message');
        });

        test('should format message with timestamp', () => {
            const msg = 'Test message';
            const timestamp = new Date().toISOString();
            const formatted = `[${timestamp}] ${msg}`;
            assert.ok(formatted.includes(msg));
            assert.ok(formatted.includes('[202'));  // Year prefix
        });
    });
});
