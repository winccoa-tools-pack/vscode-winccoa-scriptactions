import path from 'path';
import fs from 'fs';

/**
 * Gets the absolute path to the test fixtures directory
 */
export function getFixturesPath(): string {
    return path.resolve(__dirname, '..', 'test', 'fixtures');
}

/**
 * Gets the absolute path to a test script file
 * @param scriptName Name of the script file (e.g., 'simple.ctl')
 */
export function getTestScriptPath(scriptName: string): string {
    return path.join(getFixturesPath(), 'scripts', scriptName);
}

/**
 * Checks if a test script exists
 * @param scriptName Name of the script file
 */
export function testScriptExists(scriptName: string): boolean {
    const scriptPath = getTestScriptPath(scriptName);
    return fs.existsSync(scriptPath);
}

/**
 * Reads a test script file content
 * @param scriptName Name of the script file
 */
export function readTestScript(scriptName: string): string {
    const scriptPath = getTestScriptPath(scriptName);
    if (!fs.existsSync(scriptPath)) {
        throw new Error(`Test script not found: ${scriptPath}`);
    }
    return fs.readFileSync(scriptPath, 'utf-8');
}
