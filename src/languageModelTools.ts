/**
 * Language Model Tools for GitHub Copilot
 * 
 * Provides WinCC OA script execution tools for AI assistants.
 * Simple interface for starting CTL scripts with optional event connection.
 */

import * as vscode from 'vscode';
import { ExtensionOutputChannel } from './extensionOutput';

/**
 * Language Model Tools Service
 * 
 * Registers script execution tools for GitHub Copilot autonomous access.
 */
export class LanguageModelToolsService {
    private disposables: vscode.Disposable[] = [];

    /**
     * Register all Language Model Tools
     */
    register(context: vscode.ExtensionContext): void {
        console.log('[LanguageModelTools] Registering WinCC OA Script Actions Tools...');
        
        // Tool: Execute Script (with optional event connection)
        this.disposables.push(
            vscode.lm.registerTool('scriptactions_execute_script', new ExecuteScriptTool())
        );

        // Add to context subscriptions
        context.subscriptions.push(...this.disposables);

        console.log('[LanguageModelTools] ✅ Registered 1 WinCC OA Script Actions Tool');
    }

    /**
     * Dispose all registered tools
     */
    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}

/**
 * Tool: Execute Script
 * 
 * Executes a WinCC OA CTL script with optional event connection.
 */
class ExecuteScriptTool implements vscode.LanguageModelTool<ExecuteScriptInput> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ExecuteScriptInput>,
        _token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        try {
            const input = options.input;
            console.log(`[ExecuteScriptTool] Executing script: ${input.scriptPath}`);
            ExtensionOutputChannel.debug('LanguageModelTool', `Execute script: ${input.scriptPath}`);

            // Validate script path
            if (!input.scriptPath) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: false,
                            error: 'scriptPath is required'
                        }, null, 2)
                    )
                ]);
            }

            // Validate file extension
            if (!input.scriptPath.toLowerCase().endsWith('.ctl')) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: false,
                            error: 'Only .ctl files are supported',
                            scriptPath: input.scriptPath
                        }, null, 2)
                    )
                ]);
            }

            // Convert to URI
            let uri: vscode.Uri;
            try {
                // Try to parse as workspace-relative path first
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0 && !input.scriptPath.includes(':')) {
                    // Relative path - resolve against first workspace folder
                    uri = vscode.Uri.joinPath(workspaceFolders[0].uri, input.scriptPath);
                } else {
                    // Absolute path or file:// URI
                    uri = vscode.Uri.file(input.scriptPath);
                }
            } catch (error: any) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: false,
                            error: `Invalid script path: ${error.message}`,
                            scriptPath: input.scriptPath
                        }, null, 2)
                    )
                ]);
            }

            // Execute script via VS Code command (without arguments)
            try {
                await vscode.commands.executeCommand(
                    'winccoa.executeScript',
                    uri
                );

                const resultMessage = `Script ${input.scriptPath} started with event connection`;

                ExtensionOutputChannel.info('LanguageModelTool', `✓ ${resultMessage}`);

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: true,
                            scriptPath: input.scriptPath,
                            message: resultMessage
                        }, null, 2)
                    )
                ]);
            } catch (error: any) {
                ExtensionOutputChannel.error('LanguageModelTool', `✗ Script execution failed: ${error.message}`, error);

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            success: false,
                            error: `Script execution failed: ${error.message}`,
                            scriptPath: input.scriptPath
                        }, null, 2)
                    )
                ]);
            }
        } catch (error: any) {
            console.error('[ExecuteScriptTool] Unexpected error:', error);
            ExtensionOutputChannel.error('LanguageModelTool', `Unexpected error: ${error.message}`, error);

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(
                    JSON.stringify({
                        success: false,
                        error: error.message || 'Unknown error'
                    }, null, 2)
                )
            ]);
        }
    }
}

/**
 * Input schema for Execute Script Tool
 */
interface ExecuteScriptInput {
    /**
     * Path to the CTL script file (absolute or workspace-relative).
     * Example: "scripts/test.ctl" or "C:/Projects/MyProject/scripts/test.ctl"
     */
    scriptPath: string;
}
