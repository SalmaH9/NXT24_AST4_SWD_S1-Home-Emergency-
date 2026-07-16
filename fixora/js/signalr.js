// ==========================================
// SIGNALR.JS - Real-Time Communication Hub Wrapper
// ==========================================

const RealTime = {
    _connections: {},

    // Safe config access
    _getConfig() {
        if (typeof CONFIG === "undefined") {
            console.warn("CONFIG not loaded yet. SignalR will be disabled until config.js loads.");
            return null;
        }
        return CONFIG;
    },

    // Create a connection to a specific hub
    createConnection(hubPath) {
        const config = this._getConfig();
        if (!config) return null;

        if (this._connections[hubPath]) {
            return this._connections[hubPath];
        }

        if (typeof signalR === "undefined") {
            console.warn("SignalR library is not loaded yet. Please make sure the SignalR CDN script is included.");
            return null;
        }

        const hubUrl = `${config.SIGNALR_BASE_URL.replace(/\/$/, '')}/${hubPath.replace(/^\//, '')}`;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => {
                    if (typeof TokenManager !== "undefined") {
                        return TokenManager.getAccessToken();
                    }
                    return null;
                }
            })
            .withAutomaticReconnect()
            .build();

        this._connections[hubPath] = connection;
        return connection;
    },

    // Start a specific hub connection
    async startConnection(hubPath) {
        const connection = this.createConnection(hubPath);
        if (!connection) return false;

        if (connection.state === signalR.HubConnectionState.Disconnected) {
            try {
                await connection.start();
                console.log(`📡 Connected to SignalR Hub: ${hubPath}`);
                return true;
            } catch (err) {
                console.error(`❌ Failed to connect to SignalR Hub ${hubPath}:`, err);
                return false;
            }
        }
        return connection.state === signalR.HubConnectionState.Connected;
    },

    // Stop a specific hub connection
    async stopConnection(hubPath) {
        const connection = this._connections[hubPath];
        if (connection) {
            try {
                await connection.stop();
                console.log(`🔌 Disconnected from SignalR Hub: ${hubPath}`);
                delete this._connections[hubPath];
            } catch (err) {
                console.error(`❌ Error stopping SignalR Hub ${hubPath}:`, err);
            }
        }
    },

    // Stop all active hub connections
    async stopAll() {
        const paths = Object.keys(this._connections);
        for (const path of paths) {
            await this.stopConnection(path);
        }
    }
};

window.RealTime = RealTime;