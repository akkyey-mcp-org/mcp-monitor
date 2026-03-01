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
exports.MCPProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MCPProvider {
    constructor() {
        this._configPath = this._resolveConfigPath();
    }
    _resolveConfigPath() {
        // 1. VS Code 設定を確認
        const userConfigPath = vscode.workspace.getConfiguration('mcpMonitor').get('configPath');
        if (userConfigPath && fs.existsSync(userConfigPath)) {
            return userConfigPath;
        }
        // 2. 環境変数を確認
        if (process.env.MCP_CONFIG_PATH && fs.existsSync(process.env.MCP_CONFIG_PATH)) {
            return process.env.MCP_CONFIG_PATH;
        }
        // 3. ワークスペース内と親ディレクトリを探索
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
        if (workspacePath) {
            let current = workspacePath;
            const root = path.parse(current).root;
            while (current !== root) {
                const p = path.join(current, 'mcp_config.json');
                if (fs.existsSync(p))
                    return p;
                current = path.dirname(current);
            }
        }
        // 4. ホームディレクトリや標準パスを確認
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const standardPaths = [
            path.join(homeDir, '.config', 'google-antigravity', 'mcp_config.json'),
            path.join(homeDir, 'dev', 'mcp-servers', 'mcp_config.json'),
            path.join(homeDir, 'mcp_config.json')
        ];
        for (const p of standardPaths) {
            if (fs.existsSync(p))
                return p;
        }
        // デフォルト (見つからない場合はエラー表示用として残す)
        return path.join(homeDir, 'mcp_config.json');
    }
    getServers() {
        try {
            if (!fs.existsSync(this._configPath)) {
                // デバッグ用: パスが見つからないことを通知
                return [{
                        name: `Error: Config not found at ${this._configPath}`,
                        status: 'stopped',
                        cpu: 0,
                        memory: 0,
                        tools: []
                    }];
            }
            const configContent = fs.readFileSync(this._configPath, 'utf8');
            const config = JSON.parse(configContent);
            const mcpServers = config.mcpServers || {};
            const servers = Object.keys(mcpServers).map(name => {
                const serverConfig = mcpServers[name];
                // 簡易的な稼働判定
                // 1. 設定ファイルと同じ階層にソースがあるか確認 (開発用)
                const relativeSourcePath = path.join(path.dirname(this._configPath), name);
                let isActive = fs.existsSync(relativeSourcePath);
                // 2. 将来的にはプロセス一覧から推定するロジックを追加可能
                // 現在はランダムな負荷計算でデモ表示
                return {
                    name,
                    status: (isActive ? 'active' : 'stopped'),
                    cpu: isActive ? 5 : 0,
                    memory: isActive ? 20 : 0,
                    tools: this._inferTools(name, serverConfig)
                };
            });
            return servers;
        }
        catch (error) {
            console.error('Error reading mcp_config.json:', error);
            return [{
                    name: 'Error: Failed to parse config',
                    status: 'stopped',
                    cpu: 0,
                    memory: 0,
                    tools: []
                }];
        }
    }
    _inferTools(name, config) {
        // 本来は各サーバーの inspector から取得すべきだが、
        // 今回は設定やディレクトリ構造から代表的なツールを推測表示する
        if (name === 'git-task-server') {
            return [
                { name: 'git_status', description: 'Check git status' },
                { name: 'github_list_issues', description: 'List GitHub issues' },
                { name: 'git_summarize_staged', description: 'Summarize staged changes' }
            ];
        }
        if (name === 'memory-server') {
            return [{ name: 'get_lessons_learned', description: 'Search project insights' }];
        }
        return [];
    }
    watchConfig(callback) {
        if (this._watcher) {
            this._watcher.close();
        }
        try {
            this._watcher = fs.watch(this._configPath, (event) => {
                if (event === 'change') {
                    callback(this.getServers());
                }
            });
        }
        catch (error) {
            console.error('Error watching mcp_config.json:', error);
        }
    }
    dispose() {
        if (this._watcher) {
            this._watcher.close();
        }
    }
}
exports.MCPProvider = MCPProvider;
//# sourceMappingURL=mcp-provider.js.map