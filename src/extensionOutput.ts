import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

export class ExtensionOutputChannel {
    private static instance: vscode.OutputChannel;

    public static initialize(): vscode.OutputChannel {
        if (!ExtensionOutputChannel.instance) {
            ExtensionOutputChannel.instance = vscode.window.createOutputChannel('WinCC OA scriptActions');
        }
        return ExtensionOutputChannel.instance;
    }

    public static info(message: string): void {
        if (ExtensionOutputChannel.instance) {
            const timestamp = new Date().toLocaleTimeString();
            ExtensionOutputChannel.instance.appendLine(`[${timestamp}] ℹ️ ${message}`);
        }
    }

    public static success(message: string): void {
        if (ExtensionOutputChannel.instance) {
            const timestamp = new Date().toLocaleTimeString();
            ExtensionOutputChannel.instance.appendLine(`[${timestamp}] ✅ ${message}`);
        }
    }

    public static error(message: string): void {
        if (ExtensionOutputChannel.instance) {
            const timestamp = new Date().toLocaleTimeString();
            ExtensionOutputChannel.instance.appendLine(`[${timestamp}] ❌ ${message}`);
        }
    }

    public static warn(message: string): void {
        if (ExtensionOutputChannel.instance) {
            const timestamp = new Date().toLocaleTimeString();
            ExtensionOutputChannel.instance.appendLine(`[${timestamp}] ⚠️ ${message}`);
        }
    }

    public static debug(message: string): void {
        if (ExtensionOutputChannel.instance) {
            const timestamp = new Date().toLocaleTimeString();
            ExtensionOutputChannel.instance.appendLine(`[${timestamp}] 🔍 ${message}`);
        }
    }

    public static show(): void {
        if (ExtensionOutputChannel.instance) {
            ExtensionOutputChannel.instance.show();
        }
    }
}
