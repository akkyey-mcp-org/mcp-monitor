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

        // 
        this._mcpProvider.watchConfig((servers) => {
            this._updateWebview(servers);
        });

        // 
        setTimeout(() => {
            this.refresh();
        }, 500);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'ready':
                    // Webview 
                    this.refresh();
                    break;
                case 'refresh':
                    this.refresh();
                    break;
            }
        });
    }

    private _updateWebview(servers: any[]) {
        // 
        console.log('Updating Webview with servers:', JSON.stringify(servers.map(s => ({ name: s.name, status: s.status }))));


        if (this._view) {
            this._view.webview.postMessage({
                type: 'update',
                servers: servers
            });
        }
    }

    public async refresh() {
        const servers = await this._mcpProvider.getServers();
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
                        <h1>Antigravity Hub <span class="version-tag">V2.1</span></h1>
                        <div class="session-badge">${this._mcpProvider.sessionId.substring(0, 8)}</div>
                    </header>
                    <div id="server-list" class="server-list">
                        <div class="loading-spinner">Synchronizing with MCP Core...</div>
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
