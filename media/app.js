(function () {
    const vscode = acquireVsCodeApi();
    const serverList = document.getElementById('server-list');

    // サーバーごとの折りたたみ状態を保持 (true = collapsed)
    const collapsedStates = new Map();

    // グローバルに公開
    window.toggleCollapse = function (name) {
        const current = collapsedStates.get(name) || false;
        collapsedStates.set(name, !current);
        if (window.lastServers) {
            renderServers(window.lastServers);
        }
    };

    function renderServers(servers) {
        window.lastServers = servers;
        if (!servers || servers.length === 0) {
            serverList.innerHTML = '<div class="loading">No MCP servers configured or found.</div>';
            return;
        }

        serverList.innerHTML = servers.map(server => {
            // デフォルトを true (collapsed) に変更
            const isCollapsed = collapsedStates.has(server.name) ? collapsedStates.get(server.name) : true;
            const statusClass = server.status === 'active' ? 'status-online' : 'status-offline';
            const statusText = server.status === 'active' ? 'ACTIVE' : 'STOPPED';

            // ツールリストの構築（ある場合のみ）
            const toolsHtml = (server.tools && server.tools.length > 0) ? `
                <div class="tool-list">
                    ${server.tools.map(tool => `<span class="tool-tag" title="${tool.description || ''}">${tool.name}</span>`).join('')}
                </div>
            ` : '';

            return `
                <div class="server-card ${isCollapsed ? 'collapsed' : ''}">
                    <div class="server-header" onclick="toggleCollapse('${server.name}')">
                        <div class="server-name">${server.name}</div>
                        <div class="status-indicator ${statusClass}">
                            <span>${statusText}</span>
                        </div>
                    </div>
                    <div class="metrics-container">
                        <div class="metrics-grid">
                            <div class="metric-row">
                                <div class="metric-label">
                                    <span>CPU</span>
                                    <span class="metric-value">${server.cpu}%</span>
                                </div>
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${server.cpu}%"></div>
                                </div>
                            </div>
                            <div class="metric-row">
                                <div class="metric-label">
                                    <span>MEM</span>
                                    <span class="metric-value">${server.memory}%</span>
                                </div>
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${server.memory}%"></div>
                                </div>
                            </div>
                        </div>
                        ${toolsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                renderServers(message.servers);
                break;
        }
    });

    vscode.postMessage({ type: 'ready' });
}());
