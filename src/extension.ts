import * as vscode from 'vscode';
import { MCPMonitorViewProvider } from './mcp-monitor-view';

export function activate(context: vscode.ExtensionContext) {
    console.log('mcp-monitor is now active');

    // Webview View Provider の登録
    const provider = new MCPMonitorViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(MCPMonitorViewProvider.viewType, provider)
    );

    // ステータスバー項目の追加
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'mcp-monitor.refresh';
    statusBarItem.text = `$(pulse) MCP: Checking...`;
    statusBarItem.tooltip = 'Click to refresh MCP status';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // リフレッシュコマンドの登録
    context.subscriptions.push(
        vscode.commands.registerCommand('mcp-monitor.refresh', () => {
            provider.refresh();
            vscode.window.showInformationMessage('Refreshing MCP server status...');
        })
    );
}

export function deactivate() { }
