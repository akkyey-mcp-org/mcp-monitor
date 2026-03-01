"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPMonitorViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const mcp_provider_1 = require("./mcp-provider");
class MCPMonitorViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._mcpProvider = new mcp_provider_1.MCPProvider();
    }
    resolveWebviewView(webviewView, context, _token) {
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
                case 'ready':
                    // Webview の準備ができたら即座にデータを送る
                    this.refresh();
                    break;
                case 'refresh':
                    this.refresh();
                    break;
            }
        });
    }
    _updateWebview(servers) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'update', servers: servers });
        }
    }
    refresh() {
        const servers = this._mcpProvider.getServers();
        this._updateWebview(servers);
    }
    _getHtmlForWebview(webview) {
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
                        <h1>MCP Monitor v1.1</h1>
                        <div class="pulse-indicator"></div>
                    </header>
                    <div id="server-list" class="server-list">
                        <div class="loading-spinner">Initializing Antigravity Engine...</div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
exports.MCPMonitorViewProvider = MCPMonitorViewProvider;
MCPMonitorViewProvider.viewType = 'mcp-monitor-view';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234563789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=mcp-monitor-view.js.map