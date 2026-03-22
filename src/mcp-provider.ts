import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as http from 'http';

export interface MCPServerStatus {
    name: string;
    status: 'active' | 'stopped';
    cpu: number;
    memory: number;
    tools?: { name: string; description?: string }[];
    pid?: number;
}

export class MCPProvider {
    private _configPath: string;
    private _watcher?: fs.FSWatcher;
    public sessionId: string = 'unknown';

    constructor() {
        this._configPath = this._resolveConfigPath();
        this._loadSessionId();
    }

    private _loadSessionId() {
        try {
            if (fs.existsSync(this._configPath)) {
                const config = JSON.parse(fs.readFileSync(this._configPath, 'utf8'));
                this.sessionId = config.ANTIGRAVITY_SESSION_ID || config.mcpServers?.ANTIGRAVITY_SESSION_ID || 'unified';
            }
        } catch (e) {}
    }

    private _resolveConfigPath(): string {
        // 1. VS Code 
        const userConfigPath = vscode.workspace.getConfiguration('mcpMonitor').get<string>('configPath');
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
                if (fs.existsSync(p)) return p;
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
            if (fs.existsSync(p)) return p;
        }

        //  ()
        return path.join(homeDir, 'mcp_config.json');
    }


    private _logDebug(message: string) {
        try {
            const homeDir = process.env.HOME || process.env.USERPROFILE || '';
            const logPath = path.join(homeDir, 'mcp-monitor-debug.log');
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
        } catch (e) {
            console.error('Failed to write debug log:', e);
        }
    }

    public async getServers(): Promise<MCPServerStatus[]> {
        const port = process.env.ANTIGRAVITY_HUB_PORT || '8000';
        const hosts = ['127.0.0.1', 'localhost'];
        
        for (const host of hosts) {
            try {
                const servers = await this._fetchFromHost(host, port);
                if (servers) {
                    this._logDebug(`Successfully fetched status from ${host}:${port}`);
                    return servers;
                }
            } catch (e: any) {
                this._logDebug(`Fetch failed from ${host}:${port}: ${e.message || e}`);
            }
        }
        
        this._logDebug(`All hosts failed. Returning offline status.`);
        return this._getOfflineStatus();
    }

    private _fetchFromHost(host: string, port: string): Promise<MCPServerStatus[] | null> {
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

                        const brainServer: MCPServerStatus = {
                            name: 'brain-mcp',
                            status: 'active',
                            cpu: 0,
                            memory: json.total_memory_mb || 0,
                            tools: [
                                { name: 'brain_manage_task', description: 'Hierarchical task management' },
                                { name: 'brain_manage_memory', description: 'Knowledge & Experience retrieval' }
                            ]
                        };

                        const childServers: MCPServerStatus[] = (json.processes || []).map((p: any) => ({
                            name: p.name,
                            status: 'active' as const,
                            cpu: 0,
                            memory: Math.round(p.rss_mb * 10) / 10,
                            pid: p.pid,
                            tools: []
                        }));

                        const allServers = [brainServer, ...childServers];
                        const uniqueServers = Array.from(new Map(allServers.map(s => [s.name, s])).values());
                        resolve(uniqueServers);
                    } catch (e) {
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

    private _getOfflineStatus(): MCPServerStatus[] {
        return [{
            name: 'brain-mcp',
            status: 'stopped' as const,
            cpu: 0,
            memory: 0,
            tools: []
        }];
    }

    public watchConfig(callback: (servers: MCPServerStatus[]) => void) {
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
        } catch (error) {
            console.error('Error watching mcp_config.json:', error);
            this._logDebug(`Error watching config: ${error}`);
        }
    }

    public dispose() {
        if (this._watcher) {
            this._watcher.close();
        }
    }
}
