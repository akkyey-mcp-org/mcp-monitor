(function () {
    const vscode = acquireVsCodeApi();
    const serverList = document.getElementById('server-list');

    // モックデータ (初期表示用)
    const mockServers = [
        { name: 'context-server', status: 'active', cpu: 12 },
        { name: 'memory-server', status: 'active', cpu: 45 },
        { name: 'sqlite-server', status: 'stopped', cpu: 0 },
        { name: 'puppeteer-server', status: 'active', cpu: 8 }
    ];

    function renderServers(servers) {
        serverList.innerHTML = '';
        servers.forEach(server => {
            const card = document.createElement('div');
            card.className = 'server-card';

            const statusClass = server.status === 'active' ? 'status-active' : 'status-stopped';

            card.innerHTML = `
                <div class="server-header">
                    <span class="server-name">${server.name}</span>
                    <span class="server-status ${statusClass}">${server.status.toUpperCase()}</span>
                </div>
                <div class="resource-bar">
                    <div class="resource-progress" style="width: ${server.cpu}%"></div>
                </div>
            `;
            serverList.appendChild(card);
        });
    }

    // 初回レンダリング
    setTimeout(() => {
        renderServers(mockServers);
    }, 1000);

    // 拡張機能からのメッセージ受信
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'update':
                renderServers(message.data);
                break;
        }
    });
}());
