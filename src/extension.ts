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

    ExtensionOutputChannel.info('Extension', 'WinCC OA Script Actions Extension activated');
    ExtensionOutputChannel.debug('Extension', `Extension Path: ${context.extensionPath}`);
    ExtensionOutputChannel.debug('Extension', `VS Code Version: ${vscode.version}`);

    // Setup Core extension integration if in automatic mode
    setupCoreExtensionIntegration(context);

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('winccoaScriptActions.logLevel')) {
                ExtensionOutputChannel.updateLogLevel();
            }
            if (e.affectsConfiguration('winccoa.scriptActions.pathSource')) {
                // Re-setup Core integration when mode changes
                setupCoreExtensionIntegration(context);
            }
        })
    );

    // Register command
    const executeScriptCommand = vscode.commands.registerCommand(
        'winccoa.executeScript',
        async (uri?: vscode.Uri) => {
            ExtensionOutputChannel.debug('Command', `executeScript called with URI: ${uri?.fsPath || 'none'}`);

            // If no URI provided (e.g., from command palette), use active editor
            if (!uri && vscode.window.activeTextEditor) {
                uri = vscode.window.activeTextEditor.document.uri;
            }

            if (!uri) {
                ExtensionOutputChannel.error('Command', 'No .ctl file selected');
                vscode.window.showErrorMessage('No .ctl file selected');
                return;
            }

            await executeScript(uri);
        },
    );

    context.subscriptions.push(executeScriptCommand);

    // Register command with arguments
    const executeScriptWithArgsCommand = vscode.commands.registerCommand(
        'winccoa.executeScriptWithArgs',
        async (uri?: vscode.Uri, args?: string) => {
            ExtensionOutputChannel.debug('Command', `executeScriptWithArgs called with URI: ${uri?.fsPath || 'none'}, args: ${args || 'none'}`);

            // If no URI provided (e.g., from command palette), use active editor
            if (!uri && vscode.window.activeTextEditor) {
                uri = vscode.window.activeTextEditor.document.uri;
            }

            if (!uri) {
                ExtensionOutputChannel.error('Command', 'No .ctl file selected');
                vscode.window.showErrorMessage('No .ctl file selected');
                return;
            }

            await executeScriptWithArgs(uri, args);
        },
    );

    context.subscriptions.push(executeScriptWithArgsCommand);

    ExtensionOutputChannel.success('Extension', 'Commands registered: winccoa.executeScript, winccoa.executeScriptWithArgs');
}

async function setupCoreExtensionIntegration(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
    const pathSource = config.get<string>('pathSource', 'static');

    if (pathSource !== 'automatic') {
        ExtensionOutputChannel.debug('CoreIntegration', 'Static mode - Core extension integration disabled');
        return;
    }

    const coreExtension = vscode.extensions.getExtension('winccoa-tools-pack.winccoa-core');
    
    if (!coreExtension) {
        ExtensionOutputChannel.warn('CoreIntegration', 'WinCC OA Core extension not found - automatic mode unavailable');
        return;
    }

    if (!coreExtension.isActive) {
        ExtensionOutputChannel.debug('CoreIntegration', 'Activating Core extension...');
        await coreExtension.activate();
    }

    const coreApi = coreExtension.exports;
    
    // Subscribe to project changes
    coreApi.onDidChangeProject((project: any) => {
        if (project) {
            ExtensionOutputChannel.info('CoreIntegration', `Project changed: ${project.name} (${project.oaInstallPath})`);
        } else {
            ExtensionOutputChannel.info('CoreIntegration', 'No project selected');
        }
    });

    const currentProject = coreApi.getCurrentProject();
    if (currentProject) {
        ExtensionOutputChannel.info('CoreIntegration', `Current project: ${currentProject.name} (${currentProject.oaInstallPath})`);
    } else {
        ExtensionOutputChannel.debug('CoreIntegration', 'No project currently selected');
    }
}

async function executeScript(uri: vscode.Uri, args?: string): Promise<void> {
    try {
        const filePath = uri.fsPath;
        const logMessage = args ? `Executing script with args: ${path.basename(filePath)} ${args}` : `Executing script: ${path.basename(filePath)}`;
        ExtensionOutputChannel.info('ScriptExecution', logMessage);

        // Validate file extension
        if (!filePath.toLowerCase().endsWith('.ctl')) {
            ExtensionOutputChannel.error('ScriptExecution', 'Invalid file type - only .ctl files supported');
            vscode.window.showErrorMessage('Only .ctl files can be executed.');
            return;
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            ExtensionOutputChannel.error('ScriptExecution', `File not found: ${filePath}`);
            vscode.window.showErrorMessage(`File not found: ${filePath}`);
            return;
        }

        // Get configuration
        const config = await getScriptConfig();
        if (!config) {
            return; // Error already shown in getScriptConfig
        }

        // Build command
        const command = buildExecutionCommand(filePath, config, args);
        ExtensionOutputChannel.debug('ScriptExecution', `Command: ${command}`);

        // Show progress
        const progressTitle = args ? `Executing ${path.basename(filePath)} with args...` : `Executing ${path.basename(filePath)}...`;
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: progressTitle,
                cancellable: false,
            },
            async () => {
                try {
                    // Execute command
                    const { stdout, stderr } = await execAsync(command);

                    if (stderr) {
                        ExtensionOutputChannel.warn('ScriptExecution', `stderr: ${stderr}`);
                    }
                    if (stdout) {
                        ExtensionOutputChannel.info('ScriptExecution', `stdout: ${stdout}`);
                    }

                    ExtensionOutputChannel.success('ScriptExecution', `Script started: ${path.basename(filePath)}`);
                    vscode.window.showInformationMessage(
                        `✓ Script started: ${path.basename(filePath)}`,
                    );
                } catch (err: unknown) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    ExtensionOutputChannel.error('ScriptExecution', `Execution failed: ${error.message}`, error);
                    vscode.window.showErrorMessage(`✗ Script execution failed: ${error.message}`);
                }
            },
        );
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        ExtensionOutputChannel.error('ScriptExecution', `Unexpected error: ${error.message}`, error);
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

async function executeScriptWithArgs(uri: vscode.Uri, args?: string): Promise<void> {
    let finalArgs = args;
    
    // If no args provided programmatically, prompt user for arguments
    if (finalArgs === undefined) {
        finalArgs = await vscode.window.showInputBox({
            prompt: 'Enter script arguments (space-separated)',
            placeHolder: 'arg1 arg2 arg3',
            value: ''
        });

        // User cancelled
        if (finalArgs === undefined) {
            ExtensionOutputChannel.info('ScriptExecution', 'Script execution with args cancelled by user');
            return;
        }
    }

    // Execute with arguments (even if empty)
    await executeScript(uri, finalArgs);
}

async function getScriptConfig(): Promise<ScriptConfig | null> {
    const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
    const pathSource = config.get<string>('pathSource', 'static');

    ExtensionOutputChannel.debug('Configuration', `Path source mode: ${pathSource}`);

    if (pathSource === 'automatic') {
        // Get project info from Core extension
        const coreExtension = vscode.extensions.getExtension('winccoa-tools-pack.winccoa-core');
        
        if (!coreExtension) {
            ExtensionOutputChannel.error('Configuration', 'WinCC OA Core extension not found');
            vscode.window.showErrorMessage(
                'WinCC OA Core extension is required for automatic mode. Please install it or switch to "static" mode.',
            );
            return null;
        }

        if (!coreExtension.isActive) {
            ExtensionOutputChannel.debug('Configuration', 'Activating Core extension...');
            await coreExtension.activate();
        }

        const coreApi = coreExtension.exports;
        const currentProject = coreApi.getCurrentProject();

        if (!currentProject) {
            ExtensionOutputChannel.warn('Configuration', 'No WinCC OA project selected in Core extension');
            vscode.window.showWarningMessage(
                'No WinCC OA project selected. Please select a project using the WinCC OA status bar.',
            );
            return null;
        }

        ExtensionOutputChannel.debug('Configuration', `Automatic mode - Project: ${currentProject.name}, Install: ${currentProject.oaInstallPath}`);

        return {
            installPath: currentProject.oaInstallPath,
            projectName: currentProject.name,
        };
    }

    // Static mode - get from settings
    const installPath = config.get<string>('installPath', '');
    const projectName = config.get<string>('projectName', '');

    ExtensionOutputChannel.debug('Configuration', `installPath: ${installPath}, projectName: ${projectName}`);

    // Validate configuration
    if (!installPath) {
        ExtensionOutputChannel.error('Configuration', 'Installation path not configured');
        vscode.window.showErrorMessage(
            'WinCC OA installation path not configured. Please set "winccoa.scriptActions.installPath" in settings.',
        );
        return null;
    }

    if (!projectName) {
        ExtensionOutputChannel.error('Configuration', 'Project name not configured');
        vscode.window.showErrorMessage(
            'WinCC OA project name not configured. Please set "winccoa.scriptActions.projectName" in settings.',
        );
        return null;
    }

    // Normalize path (remove trailing slashes)
    const normalizedInstallPath = installPath.replace(/[\\/]+$/, '');

    // Check if installation path exists
    if (!fs.existsSync(normalizedInstallPath)) {
        ExtensionOutputChannel.warn('Configuration', `Installation path does not exist: ${normalizedInstallPath}`);
        vscode.window.showWarningMessage(
            `WinCC OA installation path does not exist: ${normalizedInstallPath}`,
        );
        // Don't block execution - maybe it's a network path or will be available at runtime
    }

    ExtensionOutputChannel.info(
        'Configuration',
        `Configuration loaded - Project: ${projectName}, Install: ${normalizedInstallPath}`
    );

    return {
        installPath: normalizedInstallPath,
        projectName: projectName,
    };
}

function buildExecutionCommand(scriptPath: string, config: ScriptConfig, args?: string): string {
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
    // Format: <WCCOActrl> <scriptPath> -proj <projectName> [args]
    const parts = [
        `"${fullExecutablePath}"`,
        `"${normalizedScriptPath}"`,
        '-proj',
        config.projectName,
    ];

    // Add arguments if provided
    if (args && args.trim()) {
        parts.push(args.trim());
    }

    return parts.join(' ');
}

export function deactivate() {
    ExtensionOutputChannel.info('Extension', 'WinCC OA Script Actions Extension deactivated');
}
