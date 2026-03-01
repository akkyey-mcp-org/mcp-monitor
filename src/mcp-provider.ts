import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface MCPServerStatus {
    name: string;
    status: 'active' | 'stopped';
    cpu: number;
}

export class MCPProvider {
    private _configPath: string;
    private _watcher?: fs.FSWatcher;

    constructor() {
        // mcp_config.json は親ディレクトリにあると想定
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
        this._configPath = path.join(workspacePath, '..', 'mcp_config.json');
    }

    public getServers(): MCPServerStatus[] {
        try {
            if (!fs.existsSync(this._configPath)) {
                return [];
            }
            const configRaw = fs.readFileSync(this._configPath, 'utf8');
            const config = JSON.parse(configRaw);
            const mcpServers = config.mcpServers || {};

            return Object.keys(mcpServers).map(name => ({
                name,
                status: 'active', // 簡易的に active と設定（実際はプロセス確認が必要）
                cpu: Math.floor(Math.random() * 20) // ダミーの CPU 使用率
            }));
        } catch (error) {
            console.error('Error reading mcp_config.json:', error);
            return [];
        }
    }

    public watchConfig(callback: (servers: MCPServerStatus[]) => void) {
        if (this._watcher) {
            this._watcher.close();
        }

        try {
            this._watcher = fs.watch(this._configPath, (event) => {
                if (event === 'change') {
                    callback(this.getServers());
                }
            });
        } catch (error) {
            console.error('Error watching mcp_config.json:', error);
        }
    }

    public dispose() {
        if (this._watcher) {
            this._watcher.close();
        }
    }
}
