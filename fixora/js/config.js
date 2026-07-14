// ==========================================
// CONFIG.JS - Global Project Configurations
// ==========================================

const CONFIG = {
    API_BASE_URL: "https://localhost:7220/api",
    SIGNALR_BASE_URL: "https://localhost:7220",
    ENV: "development", // "development" | "production"
    
    // Future constants
    MAPS_API_KEY: "",
    POLLING_INTERVAL_MS: 5000,
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024 // 5MB limit
};

// Make it globally accessible
window.CONFIG = CONFIG;
