import * as vscode from 'vscode';
import { MCPProvider } from './mcp-provider';

export class MCPMonitorViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'mcp-monitor-view';
    private _view?: vscode.WebviewView;
    private _mcpProvider: MCPProvider;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {
        this._mcpProvider = new MCPProvider();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // ファイル監視の開始
        this._mcpProvider.watchConfig((servers) => {
            this._updateWebview(servers);
        });

        // 初回表示
        setTimeout(() => {
            this._updateWebview(this._mcpProvider.getServers());
        }, 500);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'refresh':
                    this.refresh();
                    break;
            }
        });
    }

    private _updateWebview(servers: any[]) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'update', data: servers });
        }
    }

    public refresh() {
        const servers = this._mcpProvider.getServers();
        this._updateWebview(servers);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'app.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>MCP Monitor</title>
            </head>
            <body>
                <div class="dashboard">
                    <header>
                        <h1>MCP Status</h1>
                        <div class="pulse-indicator"></div>
                    </header>
                    <div id="server-list" class="server-list">
                        <!-- Servers will be injected here -->
                        <div class="loading">Loading MCP Servers...</div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234563789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
