// ==========================================
// API.JS - Centralized REST Client with Auth & Refresh Token Interceptors
// ==========================================

const api = {
    async request(endpoint, options = {}) {
        options.headers = options.headers || {};

        // 1. Show Global Loading Spinner
        if (options.showLoader !== false) {
            Loading.show(options.loaderText || "Loading...");
        }

        // 2. Attach JWT Access Token if present
        const token = TokenManager.getAccessToken();
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        // 3. Auto Content-Type header if not FormData and not already set
        if (!(options.body instanceof FormData) && !options.headers["Content-Type"]) {
            options.headers["Content-Type"] = "application/json";
        }

        // 4. Resolve full path
        const url = `${CONFIG.API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

        try {
            let response = await fetch(url, options);

            // 5. Handle 401 Unauthorized (Trigger Token Refresh Flow)
            if (response.status === 401) {
                console.warn("⚠️ Access token expired (401). Attempting token refresh...");
                const refreshed = await this.attemptTokenRefresh();

                if (refreshed) {
                    console.log("✅ Token refresh succeeded. Retrying original request...");
                    // Re-inject the new token
                    options.headers["Authorization"] = `Bearer ${TokenManager.getAccessToken()}`;
                    response = await fetch(url, options);
                } else {
                    console.error("❌ Token refresh failed. Logging out user...");
                    this.handleSessionExpiry();
                    throw new Error("Your session has expired. Please log in again.");
                }
            }

            // Hide loader after response
            if (options.showLoader !== false) {
                Loading.hide();
            }

            // 6. Handle HTTP errors
            if (!response.ok) {
                // Let the ErrorHandler parse and notify the user
                await ErrorHandler.parseAndHandleError(response);
                throw response;
            }

            // 7. Parse and return JSON (204 No Content has no body)
            if (response.status === 204) {
                return null;
            }

            return await response.json();

        } catch (error) {
            // Hide loader in case of exceptions/network errors
            if (options.showLoader !== false) {
                Loading.hide();
            }

            if (!(error instanceof Response)) {
                // Network or connection errors
                ErrorHandler.showNotification("Network Error", error.message || "Failed to reach backend server.");
            }
            throw error;
        }
    },

    async attemptTokenRefresh() {
        const accessToken = TokenManager.getAccessToken();
        const refreshToken = TokenManager.getRefreshToken();
        
        if (!accessToken || !refreshToken) {
            return false;
        }

        try {
            // We use raw fetch here to bypass the recursive interceptor loop
            const refreshUrl = `${CONFIG.API_BASE_URL.replace(/\/$/, '')}/auth/refresh-token`;
            const response = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ accessToken, refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                TokenManager.saveAccessToken(data.accessToken);
                TokenManager.saveRefreshToken(data.refreshToken);
                return true;
            }
        } catch (e) {
            console.error("Critical error during token refresh:", e);
        }

        return false;
    },

    handleSessionExpiry() {
        TokenManager.clearTokens();
        // Redirect to login page if we aren't already there
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== "login.html" && currentPage !== "index.html") {
            window.location.href = "login.html";
        }
    },

    // HTTP methods helpers
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    },

    post(endpoint, body, options = {}) {
        const reqBody = body instanceof FormData ? body : JSON.stringify(body);
        return this.request(endpoint, { ...options, method: "POST", body: reqBody });
    },

    put(endpoint, body, options = {}) {
        const reqBody = body instanceof FormData ? body : JSON.stringify(body);
        return this.request(endpoint, { ...options, method: "PUT", body: reqBody });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
};

window.api = api;
