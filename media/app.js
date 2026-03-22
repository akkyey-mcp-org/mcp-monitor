(function () {
    const vscode = acquireVsCodeApi();
    const serverList = document.getElementById('server-list');

    function renderServers(servers) {
        if (!servers || servers.length === 0) {
            serverList.innerHTML = '<div class="loading">No MCP servers tracking active.</div>';
            return;
        }

        serverList.innerHTML = servers.map(server => {
            const statusClass = server.status === 'active' ? 'status-online' : 'status-offline';
            const statusText = server.status === 'active' ? 'ACTIVE' : 'STOPPED';
            
            const statsHtml = server.status === 'active' ? `
                <div class="server-stats">
                    <div class="stat-item">
                        <div class="stat-label">CPU</div>
                        <div class="stat-bar-bg">
                            <div class="stat-bar-fill" style="width: ${Math.min(server.cpu * 5, 100)}%;"></div>
                        </div>
                        <div class="stat-value">${server.cpu}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">MEM</div>
                        <div class="stat-bar-bg">
                            <div class="stat-bar-fill" style="width: ${Math.min(server.memory * 2, 100)}%; background: var(--accent-purple);"></div>
                        </div>
                        <div class="stat-value">${server.memory}%</div>
                    </div>
                </div>
            ` : '';

            const toolsHtml = (server.tools && server.tools.length > 0) ? `
                <div class="server-tools">
                    ${server.tools.map(t => `<span class="tool-tag" title="${t.description || ''}">${t.name}</span>`).join('')}
                </div>
            ` : '';

            return `
                <div class="server-card">
                    <div class="server-header">
                        <div class="server-name">
                            ${server.name}
                            ${server.pid ? `<span class="server-pid">#${server.pid}</span>` : ''}
                        </div>
                        <div class="status-indicator ${statusClass}">
                            <span>${statusText}</span>
                        </div>
                    </div>
                    ${statsHtml}
                    ${toolsHtml}
                </div>
            `;
        }).join('');
    }

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'update') {
            renderServers(message.servers);
        }
    });

    vscode.postMessage({ type: 'ready' });
}());
