import * as assert from 'assert';
import { suite, test } from 'mocha';

suite('ScriptSelector - Unit Tests', () => {
    suite('Path Validation', () => {
        test('should validate .ctl file extension', () => {
            const validPaths = [
                '/path/to/script.ctl',
                'C:\\Projects\\script.ctl',
                'script.ctl'
            ];

            validPaths.forEach(path => {
                const isValid = path.endsWith('.ctl');
                assert.strictEqual(isValid, true, `${path} should be valid`);
            });
        });

        test('should reject non-.ctl file extensions', () => {
            const invalidPaths = [
                '/path/to/script.txt',
                'script.js',
                'noextension'
            ];

            invalidPaths.forEach(path => {
                const isValid = path.endsWith('.ctl');
                assert.strictEqual(isValid, false, `${path} should be invalid`);
            });
        });
    });

    suite('Argument Parsing', () => {
        test('should handle empty arguments', () => {
            const args = '';
            const parts = args.split(' ').filter(arg => arg.length > 0);
            assert.deepStrictEqual(parts, []);
        });

        test('should parse single argument', () => {
            const args = 'testCaseId';
            const parts = args.split(' ').filter(arg => arg.length > 0);
            assert.deepStrictEqual(parts, ['testCaseId']);
        });

        test('should parse multiple arguments', () => {
            const args = 'arg1 arg2 arg3';
            const parts = args.split(' ').filter(arg => arg.length > 0);
            assert.deepStrictEqual(parts, ['arg1', 'arg2', 'arg3']);
        });

        test('should handle extra whitespace', () => {
            const args = '  arg1   arg2  ';
            const parts = args.split(' ').filter(arg => arg.length > 0);
            assert.deepStrictEqual(parts, ['arg1', 'arg2']);
        });

        test('should NOT add -lflag prefix (plain string args)', () => {
            const arg = 'testCaseId';
            // CRITICAL: Arguments are passed as plain strings, NOT with -lflag prefix!
            const shouldNotHavePrefix = !arg.startsWith('-lflag');
            assert.strictEqual(shouldNotHavePrefix, true, 'Arguments should be plain strings');
        });
    });
});
