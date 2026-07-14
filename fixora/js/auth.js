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
            if (!allowedRoles.includes(role)) {
                console.error(`Access denied. Role "${role}" is not authorized.`);
                // Redirect to home page or unauthorized page
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
