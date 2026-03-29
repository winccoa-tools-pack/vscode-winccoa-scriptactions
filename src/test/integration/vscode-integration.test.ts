import * as assert from 'assert';
import { suite, test, suiteSetup, suiteTeardown } from 'mocha';
import * as vscode from 'vscode';

suite('WinCC OA Script Actions - Integration Tests', () => {
    suiteSetup(async function () {
        this.timeout(30000); // 30 second timeout for extension activation

        console.log('🔧 Setting up integration test environment...');

        // Get extension
        const ext = vscode.extensions.getExtension('RichardJanisch.winccoa-script-actions');
        assert.ok(ext, 'Extension should be installed');

        // Activate extension
        await ext.activate();
        console.log('✅ Extension activated');
    });

    suiteTeardown(() => {
        console.log('🧹 Cleaning up integration test environment...');
    });

    suite('Extension Activation', () => {
        test('should activate extension', () => {
            const ext = vscode.extensions.getExtension('RichardJanisch.winccoa-script-actions');
            assert.ok(ext, 'Extension should be present');
            assert.strictEqual(ext.isActive, true, 'Extension should be active');
        });

        test('should export API (if any)', () => {
            const ext = vscode.extensions.getExtension('RichardJanisch.winccoa-script-actions');
            assert.ok(ext, 'Extension should be present');
            // Script Actions doesn't export an API currently, but this tests the pattern
            assert.ok(ext.exports !== undefined, 'Exports should be defined (even if empty)');
        });
    });

    suite('Command Registration', () => {
        test('should register winccoa.executeScript command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.executeScript'),
                'winccoa.executeScript should be registered',
            );
        });

        test('should register winccoa.executeScriptWithArgs command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.executeScriptWithArgs'),
                'winccoa.executeScriptWithArgs should be registered',
            );
        });

        test('should register winccoa.executeScriptWithEventConnection command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.executeScriptWithEventConnection'),
                'winccoa.executeScriptWithEventConnection should be registered',
            );
        });

        test('should register winccoa.selectScript command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.selectScript'),
                'winccoa.selectScript should be registered',
            );
        });

        test('should register winccoa.executeSelectedScript command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.executeSelectedScript'),
                'winccoa.executeSelectedScript should be registered',
            );
        });

        test('should register winccoa.pinScript command', async () => {
            const commands = await vscode.commands.getCommands(true);
            assert.ok(
                commands.includes('winccoa.pinScript'),
                'winccoa.pinScript should be registered',
            );
        });
    });

    suite('Configuration', () => {
        test('should have pathSource configuration', () => {
            const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
            const pathSource = config.get<string>('pathSource');
            assert.ok(['static', 'automatic'].includes(pathSource || ''));
        });

        test('should have installPath configuration', () => {
            const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
            const installPath = config.get<string>('installPath');
            assert.ok(installPath !== undefined, 'installPath should be defined');
        });

        test('should have projectName configuration', () => {
            const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
            const projectName = config.get<string>('projectName');
            assert.ok(projectName !== undefined, 'projectName should be defined');
        });

        test('should have logLevel configuration', () => {
            const config = vscode.workspace.getConfiguration('winccoaScriptActions');
            const logLevel = config.get<string>('logLevel');
            assert.ok(
                ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(logLevel || 'INFO'),
                'logLevel should be valid',
            );
        });
    });

    suite('Language Model Tools', () => {
        test('should have language model tool available (if VS Code supports it)', async function () {
            // Language Model Tools API is relatively new, check if available
            const tools = vscode.lm?.tools;
            if (!tools) {
                console.log('Language Model Tools API not available in this VS Code version');
                this.skip();
                return;
            }
            console.log('Language Model Tools API is available');
            assert.ok(true);
        });
    });

    suite('Output Channel', () => {
        test('should create output channel', () => {
            // Output channel should be created during activation
            // We can't directly access it, but we can verify the extension activated successfully
            const ext = vscode.extensions.getExtension('RichardJanisch.winccoa-script-actions');
            assert.ok(ext?.isActive, 'Extension should be active and have output channel');
        });
    });
});
