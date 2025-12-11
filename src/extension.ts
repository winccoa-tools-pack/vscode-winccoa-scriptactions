import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ExtensionOutputChannel } from './extensionOutput';

const execAsync = promisify(exec);

interface ScriptConfig {
    installPath: string;
    projectName: string;
}

export function activate(context: vscode.ExtensionContext) {
    // Initialize output channel
    const outputChannel = ExtensionOutputChannel.initialize();
    context.subscriptions.push(outputChannel);

    ExtensionOutputChannel.info('Extension activated');

    // Register command
    const executeScriptCommand = vscode.commands.registerCommand(
        'winccoa.executeScript',
        async (uri?: vscode.Uri) => {
            ExtensionOutputChannel.debug(`Command called with URI: ${uri?.fsPath || 'none'}`);

            // If no URI provided (e.g., from command palette), use active editor
            if (!uri && vscode.window.activeTextEditor) {
                uri = vscode.window.activeTextEditor.document.uri;
            }

            if (!uri) {
                ExtensionOutputChannel.error('No .ctl file selected');
                vscode.window.showErrorMessage('No .ctl file selected');
                return;
            }

            await executeScript(uri);
        },
    );

    context.subscriptions.push(executeScriptCommand);

    ExtensionOutputChannel.success('Command registered: winccoa.executeScript');
}

async function executeScript(uri: vscode.Uri): Promise<void> {
    try {
        const filePath = uri.fsPath;
        ExtensionOutputChannel.info(`Executing script: ${path.basename(filePath)}`);

        // Validate file extension
        if (!filePath.toLowerCase().endsWith('.ctl')) {
            ExtensionOutputChannel.error('Invalid file type - only .ctl files supported');
            vscode.window.showErrorMessage('Only .ctl files can be executed.');
            return;
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            ExtensionOutputChannel.error(`File not found: ${filePath}`);
            vscode.window.showErrorMessage(`File not found: ${filePath}`);
            return;
        }

        // Get configuration
        const config = await getScriptConfig();
        if (!config) {
            return; // Error already shown in getScriptConfig
        }

        // Build command
        const command = buildExecutionCommand(filePath, config);
        ExtensionOutputChannel.debug(`Command: ${command}`);

        // Show progress
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Executing ${path.basename(filePath)}...`,
                cancellable: false,
            },
            async () => {
                try {
                    // Execute command
                    const { stdout, stderr } = await execAsync(command);

                    if (stderr) {
                        ExtensionOutputChannel.warn(`stderr: ${stderr}`);
                    }
                    if (stdout) {
                        ExtensionOutputChannel.info(`stdout: ${stdout}`);
                    }

                    ExtensionOutputChannel.success(`Script started: ${path.basename(filePath)}`);
                    vscode.window.showInformationMessage(
                        `✓ Script started: ${path.basename(filePath)}`,
                    );
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : String(err);
                    ExtensionOutputChannel.error(`Execution failed: ${message}`);
                    vscode.window.showErrorMessage(`✗ Script execution failed: ${message}`);
                }
            },
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        ExtensionOutputChannel.error(`Unexpected error: ${message}`);
        vscode.window.showErrorMessage(`Error: ${message}`);
    }
}

async function getScriptConfig(): Promise<ScriptConfig | null> {
    const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
    const pathSource = config.get<string>('pathSource', 'static');

    ExtensionOutputChannel.debug(`Path source mode: ${pathSource}`);

    if (pathSource === 'automatic') {
        // Dummy implementation - will be replaced with npm package later
        ExtensionOutputChannel.warn('Automatic path detection not yet implemented');
        vscode.window.showWarningMessage(
            'Automatic path detection is not yet implemented. Please use "static" mode and configure paths manually.',
        );
        return null;
    }

    // Static mode - get from settings
    const installPath = config.get<string>('installPath', '');
    const projectName = config.get<string>('projectName', '');

    ExtensionOutputChannel.debug(`installPath: ${installPath}, projectName: ${projectName}`);

    // Validate configuration
    if (!installPath) {
        ExtensionOutputChannel.error('Installation path not configured');
        vscode.window.showErrorMessage(
            'WinCC OA installation path not configured. Please set "winccoa.scriptActions.installPath" in settings.',
        );
        return null;
    }

    if (!projectName) {
        ExtensionOutputChannel.error('Project name not configured');
        vscode.window.showErrorMessage(
            'WinCC OA project name not configured. Please set "winccoa.scriptActions.projectName" in settings.',
        );
        return null;
    }

    // Normalize path (remove trailing slashes)
    const normalizedInstallPath = installPath.replace(/[\\/]+$/, '');

    // Check if installation path exists
    if (!fs.existsSync(normalizedInstallPath)) {
        ExtensionOutputChannel.warn(`Installation path does not exist: ${normalizedInstallPath}`);
        vscode.window.showWarningMessage(
            `WinCC OA installation path does not exist: ${normalizedInstallPath}`,
        );
        // Don't block execution - maybe it's a network path or will be available at runtime
    }

    ExtensionOutputChannel.info(
        `Configuration loaded - Project: ${projectName}, Install: ${normalizedInstallPath}`,
    );

    return {
        installPath: normalizedInstallPath,
        projectName: projectName,
    };
}

function buildExecutionCommand(scriptPath: string, config: ScriptConfig): string {
    const platform = process.platform;
    const isWindows = platform === 'win32';

    // Build path to WCCOActrl executable
    const binPath = path.join(config.installPath, 'bin');
    const executable = isWindows ? 'WCCOActrl.exe' : 'WCCOActrl';
    const fullExecutablePath = path.join(binPath, executable);

    // Normalize script path
    let normalizedScriptPath = scriptPath;
    if (isWindows) {
        // On Windows, convert to forward slashes (WinCC OA accepts both)
        normalizedScriptPath = scriptPath.replace(/\\/g, '/');
    }

    // Build command
    // Format: <WCCOActrl> <scriptPath> -proj <projectName>
    const parts = [
        `"${fullExecutablePath}"`,
        `"${normalizedScriptPath}"`,
        '-proj',
        config.projectName,
    ];

    return parts.join(' ');
}

export function deactivate() {
    ExtensionOutputChannel.info('Extension deactivated');
}
