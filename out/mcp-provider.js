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
        // mcp_config.json は親ディレクトリにあると想定
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
        this._configPath = path.join(workspacePath, '..', 'mcp_config.json');
    }
    getServers() {
        try {
            if (!fs.existsSync(this._configPath)) {
                return [];
            }
            const configRaw = fs.readFileSync(this._configPath, 'utf8');
            const config = JSON.parse(configRaw);
            const mcpServers = config.mcpServers || {};
            return Object.keys(mcpServers).map(name => ({
                name,
                status: 'active',
                cpu: Math.floor(Math.random() * 20) // ダミーの CPU 使用率
            }));
        }
        catch (error) {
            console.error('Error reading mcp_config.json:', error);
            return [];
        }
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