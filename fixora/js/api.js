// ==========================================
// API.JS - Centralized REST Client with Auth & Refresh Token Interceptors
// ==========================================

const api = {
    async request(endpoint, options = {}) {
        options.headers = options.headers || {};

        // ✅ دعم silent لمنع عرض الأخطاء للمستخدم
        //    بيستخدم في الطلبات الداخلية (مثل التحقق من وجود فحص)
        const isSilent = options.silent === true;

        // 1. Show Global Loading Spinner
        if (options.showLoader !== false && !isSilent) {
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
                    options.headers["Authorization"] = `Bearer ${TokenManager.getAccessToken()}`;
                    response = await fetch(url, options);
                } else {
                    console.error("❌ Token refresh failed. Logging out user...");
                    this.handleSessionExpiry();
                    throw new Error("Your session has expired. Please log in again.");
                }
            }

            // Hide loader after response
            if (options.showLoader !== false && !isSilent) {
                Loading.hide();
            }

            // 6. Handle HTTP errors
            if (!response.ok) {
                // ✅ لو silent، متعرضش إشعار للمستخدم (لأن 404 متوقعة)
                if (!isSilent) {
                    await ErrorHandler.parseAndHandleError(response);
                }
                throw response;
            }

            // 7. Parse the body — لو موجود أصلًا
            // ⚠️ باج قديم: الكود كان بيتعامل مع 204 بس وبينادي response.json()
            //    على طول. بس الـ Backend بيرجّع `return Ok();` في حاجات كتير
            //    (سحب العرض، اختيار المزوّد...) = 200 بجسم فاضي.
            //    response.json() على جسم فاضي بيرمي:
            //      "SyntaxError: Unexpected end of JSON input"
            //    فالعملية كانت بتنجح على السيرفر والواجهة تقول "فشل"!
            if (response.status === 204 || response.status === 205) {
                return null;
            }

            // ✅ التحقق من وجود محتوى قبل محاولة قراءته
            const contentLength = response.headers.get("content-length");
            if (contentLength === "0") {
                return null;
            }

            // ✅ قراءة النص أولاً عشان نعرف إذا كان فاضي
            const rawBody = await response.text();
            if (!rawBody || rawBody.trim() === "") {
                return null;   // 200 بجسم فاضي = نجاح من غير بيانات
            }

            // ✅ محاولة تحويل JSON
            try {
                return JSON.parse(rawBody);
            } catch (parseError) {
                // بعض الـ endpoints بترجّع text/plain (مثلًا register بيرجّع "true")
                return rawBody;
            }

        } catch (error) {
            // Hide loader in case of exceptions/network errors
            if (options.showLoader !== false && !isSilent) {
                Loading.hide();
            }

            // ✅ لو silent، متعرضش إشعار للمستخدم
            if (!isSilent) {
                if (!(error instanceof Response)) {
                    // Network or connection errors
                    ErrorHandler.showNotification("Network Error", error.message || "Failed to reach backend server.");
                }
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