(function () {
    const vscode = acquireVsCodeApi();
    const serverList = document.getElementById('server-list');


    function renderServers(servers) {
        window.lastServers = servers;
        if (!servers || servers.length === 0) {
            serverList.innerHTML = '<div class="loading">No MCP servers configured or found.</div>';
            return;
        }

        serverList.innerHTML = servers.map(server => {
            const statusClass = server.status === 'active' ? 'status-online' : 'status-offline';
            const statusText = server.status === 'active' ? 'ACTIVE' : 'STOPPED';

            return `
                <div class="server-card">
                    <div class="server-header">
                        <div class="server-name">${server.name}</div>
                        <div class="status-indicator ${statusClass}">
                            <span>${statusText}</span>
                        </div>
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
