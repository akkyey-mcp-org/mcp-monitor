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
const http = __importStar(require("http"));
class MCPProvider {
    constructor() {
        this.sessionId = 'unknown';
        this._configPath = this._resolveConfigPath();
        this._loadSessionId();
    }
    _loadSessionId() {
        try {
            if (fs.existsSync(this._configPath)) {
                const config = JSON.parse(fs.readFileSync(this._configPath, 'utf8'));
                this.sessionId = config.ANTIGRAVITY_SESSION_ID || config.mcpServers?.ANTIGRAVITY_SESSION_ID || 'unified';
            }
        }
        catch (e) { }
    }
    _resolveConfigPath() {
        // 1. VS Code 
        const userConfigPath = vscode.workspace.getConfiguration('mcpMonitor').get('configPath');
        if (userConfigPath && fs.existsSync(userConfigPath)) {
            return userConfigPath;
        }
        // 2. 
        if (process.env.CORE_CONFIG_PATH && fs.existsSync(process.env.CORE_CONFIG_PATH)) {
            return process.env.CORE_CONFIG_PATH;
        }
        // 3. 
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
        // 4. 
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
        //  ()
        return path.join(homeDir, 'mcp_config.json');
    }
    _logDebug(message) {
        try {
            const homeDir = process.env.HOME || process.env.USERPROFILE || '';
            const logPath = path.join(homeDir, 'mcp-monitor-debug.log');
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
        }
        catch (e) {
            console.error('Failed to write debug log:', e);
        }
    }
    async getServers() {
        const port = process.env.ANTIGRAVITY_HUB_PORT || '8000';
        const hosts = ['127.0.0.1', 'localhost'];
        for (const host of hosts) {
            try {
                const servers = await this._fetchFromHost(host, port);
                if (servers) {
                    this._logDebug(`Successfully fetched status from ${host}:${port}`);
                    return servers;
                }
            }
            catch (e) {
                this._logDebug(`Fetch failed from ${host}:${port}: ${e.message || e}`);
            }
        }
        this._logDebug(`All hosts failed. Returning offline status.`);
        return this._getOfflineStatus();
    }
    _fetchFromHost(host, port) {
        return new Promise((resolve, reject) => {
            const url = `http://${host}:${port}/api/status`;
            const req = http.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            return reject(new Error(`HTTP ${res.statusCode}`));
                        }
                        const json = JSON.parse(data);
                        this.sessionId = json.session_id || 'unknown';
                        const brainServer = {
                            name: 'brain-mcp',
                            status: 'active',
                            cpu: 0,
                            memory: json.total_memory_mb || 0,
                            tools: [
                                { name: 'brain_manage_task', description: 'Hierarchical task management' },
                                { name: 'brain_manage_memory', description: 'Knowledge & Experience retrieval' }
                            ]
                        };
                        const childServers = (json.processes || []).map((p) => ({
                            name: p.name,
                            status: 'active',
                            cpu: 0,
                            memory: Math.round(p.rss_mb * 10) / 10,
                            pid: p.pid,
                            tools: []
                        }));
                        const allServers = [brainServer, ...childServers];
                        const uniqueServers = Array.from(new Map(allServers.map(s => [s.name, s])).values());
                        resolve(uniqueServers);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', (err) => {
                reject(err);
            });
            req.setTimeout(2000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
    _getOfflineStatus() {
        return [{
                name: 'brain-mcp',
                status: 'stopped',
                cpu: 0,
                memory: 0,
                tools: []
            }];
    }
    watchConfig(callback) {
        if (this._watcher) {
            this._watcher.close();
        }
        try {
            this._watcher = fs.watch(this._configPath, async (event) => {
                if (event === 'change') {
                    const servers = await this.getServers();
                    callback(servers);
                }
            });
        }
        catch (error) {
            console.error('Error watching mcp_config.json:', error);
            this._logDebug(`Error watching config: ${error}`);
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