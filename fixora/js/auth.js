// ==========================================
// AUTH.JS - Authentication & Authorization Helpers
// ==========================================

const Auth = {
    // Check if the user is authenticated and has the required role
    checkAuth(allowedRoles = []) {
        if (!TokenManager.isLoggedIn()) {
            this.logout();
            return false;
        }

        if (allowedRoles.length > 0) {
            const role = TokenManager.getUserRole();

            
            const normalized = String(role || '').toLowerCase();
            const allowed = allowedRoles.map(function (r) {
                return String(r || '').toLowerCase();
            });

            if (!allowed.includes(normalized)) {
                console.error(`Access denied. Role "${role}" is not authorized.`);
                window.location.href = "index.html";
                return false;
            }
        }

        return true;
    },

    // Orchestrates logout and redirects
    logout() {
        TokenManager.clearTokens();
        window.location.href = "index.html";
    }
};

window.Auth = Auth;