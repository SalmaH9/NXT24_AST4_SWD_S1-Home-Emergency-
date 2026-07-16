// ==========================================
// TOKENMANAGER.JS - Token & Session Management
// ==========================================

const TokenManager = {
    saveAccessToken(token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("isLoggedIn", "true");
    },

    getAccessToken() {
        return localStorage.getItem("accessToken");
    },

    saveRefreshToken(token) {
        localStorage.setItem("refreshToken", token);
    },

    getRefreshToken() {
        return localStorage.getItem("refreshToken");
    },

    clearTokens() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("providerVerified");

        // ⚠️ دول كانوا ناسيين — والنتيجة ثغرة حقيقية:
        //    مزوّد يخرج، ومزوّد جديد يدخل على نفس المتصفح فيورث
        //    providerActive = 'true' من الأول، وبكده يعدّي بوابة
        //    الاشتراك في script.js من غير ما يدفع:
        //        const active = localStorage.getItem('providerActive') === 'true';
        //    script.js بيمسحهم بس في المسار الاحتياطي (لما Auth مش موجود).
        localStorage.removeItem("providerActive");
        localStorage.removeItem("providerStatus");
        localStorage.removeItem("providerData");
        localStorage.removeItem("rememberMe");

        localStorage.removeItem("currentRequest");
        localStorage.removeItem("currentExecution");
        localStorage.removeItem("currentOrderDetails");
        localStorage.removeItem("fixoraSubscription");
    },

    isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true" && !!this.getAccessToken();
    },

    getUserRole() {
        return localStorage.getItem("userRole");
    },

    setUserRole(role) {
        localStorage.setItem("userRole", role);
    },

    getUserEmail() {
        return localStorage.getItem("userEmail");
    },

    setUserEmail(email) {
        localStorage.setItem("userEmail", email);
    }
};

window.TokenManager = TokenManager;