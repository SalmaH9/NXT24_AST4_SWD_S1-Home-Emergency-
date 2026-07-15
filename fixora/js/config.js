// ==========================================
// CONFIG.JS - Global Project Configurations
// ==========================================

// ✅ كشف البيئة تلقائياً
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

const CONFIG = {
    // ===== API Endpoints =====
    // ✅ يتغير تلقائياً حسب البيئة
    API_BASE_URL: isProduction 
        ? "https://your-domain.com/api"      // ⚠️ غير الرابط لرابط السيرفر
        : "https://localhost:7220/api",
    
    SIGNALR_BASE_URL: isProduction
        ? "https://your-domain.com"           // ⚠️ غير الرابط لرابط السيرفر
        : "https://localhost:7220",
    
    // ===== Environment =====
    ENV: isProduction ? "production" : "development",
    
    // ===== Feature Flags =====
    FEATURES: {
        enableChatbot: true,
        enableNotifications: true,
        enableRealTimeTracking: true,
        enableAIAssistant: true
    },
    
    // ===== External Services =====
    MAPS_API_KEY: "",  // أضف مفتاح Google Maps هنا
    
    // ===== Performance =====
    POLLING_INTERVAL_MS: 5000,
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB limit
    MAX_IMAGE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB limit
    
    // ===== Pagination =====
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    
    // ===== Timeouts =====
    API_TIMEOUT_MS: 30000,
    SIGNALR_TIMEOUT_MS: 30000,
    
    // ===== Debug =====
    DEBUG: !isProduction,  // ✅ تشغيل الـ Debug في التطوير فقط
    
    // ===== Supported Languages =====
    SUPPORTED_LANGUAGES: ['en', 'ar'],
    DEFAULT_LANGUAGE: 'en'
};

// ✅ تجميد الكائن لمنع التعديل عليه
Object.freeze(CONFIG);

// Make it globally accessible
window.CONFIG = CONFIG;

// ==========================================
// Log configuration on load (development only)
// ==========================================
if (CONFIG.DEBUG) {
    console.log('🚀 Fixora Config loaded:');
    console.log(`   📡 API: ${CONFIG.API_BASE_URL}`);
    console.log(`   🔌 SignalR: ${CONFIG.SIGNALR_BASE_URL}`);
    console.log(`   🌍 Environment: ${CONFIG.ENV}`);
    console.log(`   🐛 Debug: ${CONFIG.DEBUG ? 'ON' : 'OFF'}`);
}