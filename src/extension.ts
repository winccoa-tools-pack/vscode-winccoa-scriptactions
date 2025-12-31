import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ExtensionOutputChannel } from './extensionOutput';
import { getProjectByProjectPath, getRegisteredProjects } from '@winccoa-tools-pack/npm-winccoa-core/utils/winccoa-project-environment';
import type { ProjEnvProject } from '@winccoa-tools-pack/npm-winccoa-core/types/project/ProjEnvProject';
import { getWinCCOAInstallationPathByVersion } from '@winccoa-tools-pack/npm-winccoa-core';


const execAsync = promisify(exec);

// Global extension context for accessing global state
let extensionContext: vscode.ExtensionContext;

interface ScriptConfig {
    installPath: string;
    projectName: string;
}

export function activate(context: vscode.ExtensionContext) {
    // Store extension context globally for use in other functions
    extensionContext = context;
    // Initialize output channel
    const outputChannel = ExtensionOutputChannel.initialize();
    context.subscriptions.push(outputChannel);

    ExtensionOutputChannel.info('Extension', 'WinCC OA Script Actions Extension activated');
    ExtensionOutputChannel.debug('Extension', `Extension Path: ${context.extensionPath}`);
    ExtensionOutputChannel.debug('Extension', `VS Code Version: ${vscode.version}`);

    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('winccoaScriptActions.logLevel')) {
                ExtensionOutputChannel.updateLogLevel();
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

    ExtensionOutputChannel.success('Extension', 'Command registered: winccoa.executeScript');
}

async function executeScript(uri: vscode.Uri): Promise<void> {
    try {
        const filePath = uri.fsPath;
        ExtensionOutputChannel.info('ScriptExecution', `Executing script: ${path.basename(filePath)}`);

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
        const config = await getScriptConfig(extensionContext, filePath);
        if (!config) {
            return; // Error already shown in getScriptConfig
        }

        // Build command
        const command = buildExecutionCommand(filePath, config);
        ExtensionOutputChannel.debug('ScriptExecution', `Command: ${command}`);

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

async function getScriptConfig(context: vscode.ExtensionContext, filePath: string): Promise<ScriptConfig | null> {
    const config = vscode.workspace.getConfiguration('winccoa.scriptActions');
    const pathSource = config.get<string>('pathSource', 'automatic');

    ExtensionOutputChannel.debug('Configuration', `Path source mode: ${pathSource}`);

    let installPath: string | undefined;
    let projectName: string | undefined;

    if (pathSource === 'static') {
        installPath = config.get<string>('installPath');
        projectName = config.get<string>('projectName');
    } else if (pathSource === 'automatic') {

        let project = await getProjectByProjectPath(filePath);

        if (!project) {
            // were not able to determine project automatically
            // let the user select from registered projects
            const registeredProjects = await getRegisteredProjects();
            if (registeredProjects.length === 0) {
                ExtensionOutputChannel.warn('Configuration', 'No registered WinCC OA projects found');
                vscode.window.showWarningMessage(
                    'No registered WinCC OA projects found. Please use "static" mode and configure paths manually.',
                );
                return null;
            }

            // Filter projects based on workspace folders
            const workspaceFolders = vscode.workspace.workspaceFolders || [];
            const filteredProjects = registeredProjects.filter((proj: ProjEnvProject) => {
                const projectDir = proj.getDir();
                return workspaceFolders.some(folder => 
                    projectDir.startsWith(folder.uri.fsPath) || 
                    folder.uri.fsPath.startsWith(projectDir)
                );
            });

            // Use filtered projects if any match workspace, otherwise use all
            const projectsToShow = filteredProjects.length > 0 ? filteredProjects : registeredProjects;

            // Get last selected project from global state
            const lastSelectedProjectName = context.globalState.get<string>('winccoa.lastSelectedProject');

            // Sort runnable projects first
            projectsToShow.sort((a: ProjEnvProject, b: ProjEnvProject) => {
                const aRunnable = a.isRunnable();
                const bRunnable = b.isRunnable();
                const lastSelectedA = (lastSelectedProjectName) && a.getId() === lastSelectedProjectName;
                const lastSelectedB = (lastSelectedProjectName) && b.getId() === lastSelectedProjectName;
                if (lastSelectedA) return -1;
                if (lastSelectedB) return 1;
                if (aRunnable && !bRunnable) return -1;
                if (!aRunnable && bRunnable) return 1;
                return a.getName().localeCompare(b.getName());
            });

            // Create quick pick items with project details
            const quickPickItems: vscode.QuickPickItem[] = projectsToShow.map((proj: ProjEnvProject) => {
                const version = proj.getVersion() || 'unknown';
                const projectDir = proj.getDir();
                const isRunnable = proj.isRunnable();
                const lastUsed = (lastSelectedProjectName) && proj.getId() === lastSelectedProjectName;
                
                return {
                    label: proj.getName(),
                    description: `${version} ${lastUsed ? '(last selected)' : ''} ${isRunnable ? '(runnable)' : '(not runnable)'}`,
                    detail: projectDir,
                    // Store project reference for later retrieval
                    project: proj
                };
            });

            

            const selectedQuickPickItem = await vscode.window.showQuickPick(quickPickItems, {
                placeHolder: 'Select WinCC OA project for the script',
                matchOnDescription: true,
                matchOnDetail: true,
            });

            if (!selectedQuickPickItem) {
                ExtensionOutputChannel.warn('Configuration', 'No project selected by user');
                vscode.window.showWarningMessage(
                    'No WinCC OA project selected. Please use "static" mode and configure paths manually.',
                );
                return null;
            }

            // Remember the selected project for next time
            await context.globalState.update('winccoa.lastSelectedProject', selectedQuickPickItem.label);

            project = (selectedQuickPickItem as any).project;
        }

        if (!project) {
            ExtensionOutputChannel.warn('Configuration', `No project found for script path: ${filePath}`);
            vscode.window.showWarningMessage(
                'Could not automatically determine WinCC OA project for the selected script. Please use "static" mode and configure paths manually.',
            );
            return null;
        }

        if (!project.getVersion() === undefined) {
            // this is unexpected, but handle gracefully
            ExtensionOutputChannel.warn('Configuration', `Project version unknown for project: ${project.getName()}`);
            vscode.window.showWarningMessage(
                `WinCC OA project version unknown for project "${project.getName()}". Please ensure the project is properly registered.`,
            );
            return null;
        }
        installPath = getWinCCOAInstallationPathByVersion(project.getVersion() || '') || undefined;
        projectName = project.getId();

        ExtensionOutputChannel.debug('Configuration', `Auto-detected project: ${projectName}, installPath: ${installPath}`);
    }


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
    ExtensionOutputChannel.info('Extension', 'WinCC OA Script Actions Extension deactivated');
}
