(function () {
    const vscode = acquireVsCodeApi();
    const serverList = document.getElementById('server-list');

    function renderServers(servers) {
        if (!servers || servers.length === 0) {
            serverList.innerHTML = '<div class="loading-spinner">No MCP servers configured or found.</div>';
            return;
        }

        serverList.innerHTML = '';
        servers.forEach(server => {
            const card = document.createElement('div');
            card.className = 'server-card';

            const statusClass = server.status === 'active' ? 'status-active' : 'status-stopped';
            const statusText = server.status === 'active' ? '● Online' : '○ Offline';

            // ツール情報の構築
            const toolsHtml = server.tools ? `
                <div class="tool-list">
                    ${server.tools.map(tool => `<span class="tool-tag" title="${tool.description || ''}">${tool.name}</span>`).join('')}
                </div>
            ` : '';

            card.innerHTML = `
                <div class="server-header">
                    <span class="server-name">${server.name}</span>
                    <span class="server-status-tag ${statusClass}">${statusText}</span>
                </div>
                <div class="metrics-container">
                    <div class="metric">
                        <div class="metric-label">
                            <span>CPU</span>
                            <span>${server.cpu || 0}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-bar" style="width: ${server.cpu || 0}%"></div>
                        </div>
                    </div>
                    <div class="metric">
                        <div class="metric-label">
                            <span>Memory</span>
                            <span>${server.memory || 0}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-bar" style="width: ${server.memory || 0}%; background: linear-gradient(90deg, #818cf8, #c084fc);"></div>
                        </div>
                    </div>
                </div>
                ${toolsHtml}
            `;
            serverList.appendChild(card);
        });
    }

    // 拡張機能からのメッセージ受信
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                renderServers(message.data);
                break;
        }
    });

    // 初期化通知
    vscode.postMessage({ type: 'ready' });
}());
