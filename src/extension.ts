import * as vscode from 'vscode';
import { MCPMonitorViewProvider } from './mcp-monitor-view';

export function activate(context: vscode.ExtensionContext) {
    console.log('mcp-monitor is now active');


    // Webview View Provider の登録
    const provider = new MCPMonitorViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(MCPMonitorViewProvider.viewType, provider)
    );

    // リフレッシュコマンドの登録
    context.subscriptions.push(
        vscode.commands.registerCommand('mcp-monitor.refresh', () => {
            provider.refresh();
            vscode.window.showInformationMessage('Refreshing MCP server status...');
        })
    );
}

export function deactivate() { }
