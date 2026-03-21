import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionOutputChannel } from './extensionOutput';

type ScriptMode = 'current' | 'selected';

interface SelectedScript {
    fsPath: string;
    label: string;
}

export class ScriptSelector {
    private mode: ScriptMode = 'current';
    private selectedScript: SelectedScript | null = null;
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly codeLensEmitter = new vscode.EventEmitter<void>();

    constructor(private readonly context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        context.subscriptions.push(this.statusBarItem);

        const codeLensProvider: vscode.CodeLensProvider = {
            onDidChangeCodeLenses: this.codeLensEmitter.event,
            provideCodeLenses: (document) => this.provideCodeLenses(document),
        };
        context.subscriptions.push(
            vscode.languages.registerCodeLensProvider({ pattern: '**/*.ctl' }, codeLensProvider),
            this.codeLensEmitter,
        );

        this.loadState();
        this.updateStatusBar();

        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(() => this.updateStatusBar()),
        );
    }

    getExecutionUri(): vscode.Uri | null {
        if (this.mode === 'current') {
            const uri = vscode.window.activeTextEditor?.document.uri;
            return uri?.fsPath.toLowerCase().endsWith('.ctl') ? uri : null;
        }
        return this.selectedScript ? vscode.Uri.file(this.selectedScript.fsPath) : null;
    }

    useCurrentScript(): void {
        this.mode = 'current';
        this.saveState();
        this.updateStatusBar();
        ExtensionOutputChannel.info('ScriptSelector', 'Mode set to current (active editor)');
    }

    async pinScript(uri: vscode.Uri): Promise<void> {
        const fsPath = uri.fsPath;
        const label = path.basename(fsPath);
        this.selectedScript = { fsPath, label };
        this.mode = 'selected';
        this.saveState();
        this.updateStatusBar();
        ExtensionOutputChannel.info('ScriptSelector', `Selected script: ${label}`);
    }

    async showSelector(): Promise<void> {
        await this.changeSelectedScript();
    }

    private async changeSelectedScript(): Promise<void> {
        const files = await vscode.workspace.findFiles('**/*.ctl', '**/node_modules/**');

        // Also include current selectedScript if outside workspace
        if (this.selectedScript) {
            const workspaceUris = new Set(files.map((f) => f.fsPath));
            if (!workspaceUris.has(this.selectedScript.fsPath)) {
                files.push(vscode.Uri.file(this.selectedScript.fsPath));
            }
        }

        if (files.length === 0) {
            vscode.window.showInformationMessage('No .ctl files found in the workspace.');
            return;
        }

        const picks = files.map((f) => ({
            label: path.basename(f.fsPath),
            description: vscode.workspace.asRelativePath(f.fsPath),
            uri: f,
        }));

        const picked = await vscode.window.showQuickPick(picks, {
            placeHolder: 'Select a .ctl script',
            title: 'WinCC OA: Pin Script',
            matchOnDescription: true,
        });

        if (picked) {
            await this.pinScript(picked.uri);
        }
    }

    private provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const range = new vscode.Range(0, 0, 0, 0);
        const lenses: vscode.CodeLens[] = [];
        const docName = path.basename(document.uri.fsPath);

        // Always show a lens to run the current file
        lenses.push(
            new vscode.CodeLens(range, {
                title: `$(play) Run ${docName}`,
                command: 'winccoa.executeScript',
                arguments: [document.uri],
                tooltip: `Run this file — ${document.uri.fsPath}`,
            }),
        );

        // Show pinned script lens if one is pinned and it's a different file
        if (this.mode === 'selected' && this.selectedScript) {
            const pinnedName = this.selectedScript.label;
            if (document.uri.fsPath !== this.selectedScript.fsPath) {
                lenses.push(
                    new vscode.CodeLens(range, {
                        title: `$(pinned) Run pinned: ${pinnedName}`,
                        command: 'winccoa.executeSelectedScript',
                        tooltip: `Run pinned script — ${this.selectedScript.fsPath}`,
                    }),
                );
            }
        }

        return lenses;
    }

    private updateStatusBar(): void {
        vscode.commands.executeCommand('setContext', 'winccoaScriptPinned', this.mode === 'selected');

        const uri = this.getExecutionUri();
        if (uri) {
            const label = path.basename(uri.fsPath);
            const modeLabel = this.mode === 'selected' ? 'Pinned' : 'Active';
            this.statusBarItem.text = label;
            this.statusBarItem.tooltip = `WinCC OA: ${modeLabel} script — ${uri.fsPath}`;
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }

        this.codeLensEmitter.fire();
        ExtensionOutputChannel.debug('ScriptSelector', `Status bar updated: mode=${this.mode}`);
    }

    private saveState(): void {
        this.context.workspaceState.update('scriptSelector.mode', this.mode);
        this.context.workspaceState.update('scriptSelector.selectedScript', this.selectedScript);
    }

    private loadState(): void {
        const newMode = this.context.workspaceState.get<ScriptMode>('scriptSelector.mode');

        if (newMode !== undefined) {
            this.mode = newMode;
            this.selectedScript = this.context.workspaceState.get<SelectedScript | null>(
                'scriptSelector.selectedScript',
                null,
            );
        } else {
            // Migrate from old state format
            const oldSelection = this.context.workspaceState.get<{
                type: string;
                fsPath?: string;
                label?: string;
            }>('scriptSelector.selection');

            if (oldSelection?.type === 'pinned' && oldSelection.fsPath && oldSelection.label) {
                this.mode = 'selected';
                this.selectedScript = { fsPath: oldSelection.fsPath, label: oldSelection.label };
                ExtensionOutputChannel.info('ScriptSelector', 'Migrated pinned script from old state');
            }

            // Clear old keys
            this.context.workspaceState.update('scriptSelector.selection', undefined);
            this.context.workspaceState.update('scriptSelector.pinnedScripts', undefined);
            this.saveState();
        }

        ExtensionOutputChannel.debug(
            'ScriptSelector',
            `Loaded state: mode=${this.mode}, selectedScript=${JSON.stringify(this.selectedScript)}`,
        );
    }
}
