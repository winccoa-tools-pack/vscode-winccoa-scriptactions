import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionOutputChannel } from './extensionOutput';

type ScriptSelection =
    | { type: 'current' }
    | { type: 'pinned'; fsPath: string; label: string };

interface PinnedScript {
    fsPath: string;
    label: string;
}

export class ScriptSelector {
    private selection: ScriptSelection = { type: 'current' };
    private pinnedScripts: PinnedScript[] = [];

    private readonly playStatusBar: vscode.StatusBarItem;
    private readonly selectorStatusBar: vscode.StatusBarItem;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.playStatusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            200,
        );
        this.selectorStatusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            199,
        );

        this.playStatusBar.command = 'winccoa.executeSelectedScript';
        this.selectorStatusBar.command = 'winccoa.selectScript';

        this.loadState();
        this.updateStatusBar();

        this.playStatusBar.show();
        this.selectorStatusBar.show();

        context.subscriptions.push(this.playStatusBar, this.selectorStatusBar);
    }

    getExecutionUri(): vscode.Uri | null {
        if (this.selection.type === 'current') {
            const uri = vscode.window.activeTextEditor?.document.uri;
            if (uri?.fsPath.toLowerCase().endsWith('.ctl')) {
                return uri;
            }
            return null;
        }
        return vscode.Uri.file(this.selection.fsPath);
    }

    async pinScript(uri: vscode.Uri): Promise<void> {
        const fsPath = uri.fsPath;
        const label = path.basename(fsPath);

        if (!this.pinnedScripts.find((s) => s.fsPath === fsPath)) {
            this.pinnedScripts.push({ fsPath, label });
            ExtensionOutputChannel.info('ScriptSelector', `Pinned script: ${label}`);
        }

        this.selection = { type: 'pinned', fsPath, label };
        this.saveState();
        this.updateStatusBar();
    }

    unpinScript(fsPath: string): void {
        const label = path.basename(fsPath);
        this.pinnedScripts = this.pinnedScripts.filter((s) => s.fsPath !== fsPath);

        if (this.selection.type === 'pinned' && this.selection.fsPath === fsPath) {
            this.selection = { type: 'current' };
        }

        this.saveState();
        this.updateStatusBar();
        ExtensionOutputChannel.info('ScriptSelector', `Unpinned script: ${label}`);
    }

    async showSelector(): Promise<void> {
        const trashButton: vscode.QuickInputButton = {
            iconPath: new vscode.ThemeIcon('trash'),
            tooltip: 'Remove from pinned list',
        };

        const qp = vscode.window.createQuickPick();
        qp.title = 'WinCC OA: Script Selector';
        qp.placeholder = 'Select a script to run...';
        qp.matchOnDescription = true;

        const buildItems = (): vscode.QuickPickItem[] => {
            const items: vscode.QuickPickItem[] = [
                {
                    label: '$(file-code)  Current Script',
                    description: 'Always runs the active .ctl file in the editor',
                    alwaysShow: true,
                },
            ];

            if (this.pinnedScripts.length > 0) {
                items.push({
                    label: 'Pinned Scripts',
                    kind: vscode.QuickPickItemKind.Separator,
                });
                for (const script of this.pinnedScripts) {
                    items.push({
                        label: `$(pin)  ${script.label}`,
                        description: vscode.workspace.asRelativePath(script.fsPath),
                        buttons: [trashButton],
                    });
                }
            }

            items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
            items.push({
                label: '$(add)  Pin active script',
                description: 'Add the currently open .ctl file to the list',
                alwaysShow: true,
            });
            items.push({
                label: '$(search)  Browse workspace scripts...',
                description: 'Find and pin any .ctl file in the workspace',
                alwaysShow: true,
            });

            return items;
        };

        const refreshItems = () => {
            const items = buildItems();
            qp.items = items;

            // Highlight the currently active selection
            if (this.selection.type === 'current') {
                qp.activeItems = items.slice(0, 1);
            } else {
                const match = items.find(
                    (i) =>
                        this.selection.type === 'pinned' &&
                        i.label === `$(pin)  ${this.selection.label}`,
                );
                if (match) {
                    qp.activeItems = [match];
                }
            }
        };

        refreshItems();

        qp.onDidTriggerItemButton(async (e) => {
            // Trash button: extract label from "$(pin)  name.ctl"
            const rawLabel = e.item.label.replace(/^\$\(pin\)\s+/, '');
            const script = this.pinnedScripts.find((s) => s.label === rawLabel);
            if (script) {
                this.unpinScript(script.fsPath);
                refreshItems();
            }
        });

        qp.onDidAccept(async () => {
            const selected = qp.selectedItems[0];
            if (!selected) {
                return;
            }

            qp.hide();

            if (selected.label === '$(file-code)  Current Script') {
                this.selection = { type: 'current' };
                this.saveState();
                this.updateStatusBar();
                ExtensionOutputChannel.info('ScriptSelector', 'Switched to: Current Script mode');
            } else if (selected.label.startsWith('$(pin)  ')) {
                const rawLabel = selected.label.replace(/^\$\(pin\)\s+/, '');
                const script = this.pinnedScripts.find((s) => s.label === rawLabel);
                if (script) {
                    this.selection = {
                        type: 'pinned',
                        fsPath: script.fsPath,
                        label: script.label,
                    };
                    this.saveState();
                    this.updateStatusBar();
                    ExtensionOutputChannel.info(
                        'ScriptSelector',
                        `Selected pinned script: ${script.label}`,
                    );
                }
            } else if (selected.label === '$(add)  Pin active script') {
                qp.dispose();
                await this.pinActiveScript();
            } else if (selected.label === '$(search)  Browse workspace scripts...') {
                qp.dispose();
                await this.browseAndPin();
            }
        });

        qp.onDidHide(() => qp.dispose());
        qp.show();
    }

    private async pinActiveScript(): Promise<void> {
        const activeUri = vscode.window.activeTextEditor?.document.uri;
        if (!activeUri || !activeUri.fsPath.toLowerCase().endsWith('.ctl')) {
            vscode.window.showWarningMessage(
                'No .ctl file is currently active in the editor. Open a .ctl file first.',
            );
            return;
        }
        await this.pinScript(activeUri);
        vscode.window.showInformationMessage(
            `$(pin) Pinned: ${path.basename(activeUri.fsPath)}`,
        );
    }

    private async browseAndPin(): Promise<void> {
        const files = await vscode.workspace.findFiles('**/*.ctl', '**/node_modules/**');

        if (files.length === 0) {
            vscode.window.showInformationMessage('No .ctl files found in the workspace.');
            return;
        }

        const picks = files.map((f) => ({
            label: path.basename(f.fsPath),
            description: vscode.workspace.asRelativePath(f.fsPath),
            uri: f,
        }));

        const selected = await vscode.window.showQuickPick(picks, {
            placeHolder: 'Select a .ctl script to pin',
            title: 'WinCC OA: Browse Scripts',
            matchOnDescription: true,
        });

        if (selected) {
            await this.pinScript(selected.uri);
            vscode.window.showInformationMessage(`$(pin) Pinned: ${selected.label}`);
        }
    }

    private updateStatusBar(): void {
        if (this.selection.type === 'current') {
            this.selectorStatusBar.text = '$(file-code) Current Script $(chevron-down)';
            this.selectorStatusBar.tooltip = new vscode.MarkdownString(
                '**WinCC OA Script Selector**\n\nCurrently: follows active editor\n\nClick to pin a specific script',
            );
            this.selectorStatusBar.color = undefined;
            this.selectorStatusBar.backgroundColor = undefined;
        } else {
            this.selectorStatusBar.text = `$(pin) ${this.selection.label} $(chevron-down)`;
            this.selectorStatusBar.tooltip = new vscode.MarkdownString(
                `**WinCC OA Script Selector**\n\nPinned: \`${this.selection.fsPath}\`\n\nClick to change selection`,
            );
            this.selectorStatusBar.color = new vscode.ThemeColor(
                'statusBarItem.warningForeground',
            );
            this.selectorStatusBar.backgroundColor = new vscode.ThemeColor(
                'statusBarItem.warningBackground',
            );
        }

        this.playStatusBar.text = '$(play)';
        this.playStatusBar.color =
            this.selection.type === 'current'
                ? undefined
                : new vscode.ThemeColor('statusBarItem.warningForeground');
        this.playStatusBar.backgroundColor =
            this.selection.type === 'current'
                ? undefined
                : new vscode.ThemeColor('statusBarItem.warningBackground');
        this.playStatusBar.tooltip =
            this.selection.type === 'current'
                ? 'Run active .ctl script (WinCC OA)'
                : `Run pinned script: ${this.selection.label}`;
    }

    private saveState(): void {
        this.context.workspaceState.update('scriptSelector.selection', this.selection);
        this.context.workspaceState.update('scriptSelector.pinnedScripts', this.pinnedScripts);
    }

    private loadState(): void {
        this.selection = this.context.workspaceState.get<ScriptSelection>(
            'scriptSelector.selection',
            { type: 'current' },
        );
        this.pinnedScripts = this.context.workspaceState.get<PinnedScript[]>(
            'scriptSelector.pinnedScripts',
            [],
        );
        ExtensionOutputChannel.debug(
            'ScriptSelector',
            `Loaded state: selection=${JSON.stringify(this.selection)}, pinned=${this.pinnedScripts.length}`,
        );
    }
}
