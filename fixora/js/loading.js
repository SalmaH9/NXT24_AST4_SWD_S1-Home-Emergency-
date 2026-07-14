// ==========================================
// LOADING.JS - Global Request Loader
// ==========================================

const Loading = {
    _activeRequests: 0,

    _getOrCreateLoader() {
        let loader = document.getElementById("fixora-global-loader");
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "fixora-global-loader";
            
            // Add custom inline CSS style for Loader Overlay
            const style = document.createElement("style");
            style.textContent = `
                #fixora-global-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(10, 15, 30, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                #fixora-global-loader.show {
                    opacity: 1;
                    pointer-events: auto;
                }
                .loader-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-left-color: var(--accent, #667eea);
                    border-radius: 50%;
                    animation: loader-spin 1s linear infinite;
                    margin-bottom: 16px;
                }
                .loader-text {
                    color: #ffffff;
                    font-size: 0.95rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                @keyframes loader-spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            loader.innerHTML = `
                <div class="loader-spinner"></div>
                <div class="loader-text">Please wait...</div>
            `;
            document.body.appendChild(loader);
        }
        return loader;
    },

    show(text = "Please wait...") {
        this._activeRequests++;
        const loader = this._getOrCreateLoader();
        loader.querySelector(".loader-text").textContent = text;
        loader.classList.add("show");
    },

    hide() {
        if (this._activeRequests > 0) {
            this._activeRequests--;
        }
        
        if (this._activeRequests === 0) {
            const loader = document.getElementById("fixora-global-loader");
            if (loader) {
                loader.classList.remove("show");
            }
        }
    },

    forceHide() {
        this._activeRequests = 0;
        const loader = document.getElementById("fixora-global-loader");
        if (loader) {
            loader.classList.remove("show");
        }
    }
};

window.Loading = Loading;
