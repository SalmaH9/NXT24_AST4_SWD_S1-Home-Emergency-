// ==========================================
// ERRORHANDLER.JS - API Error Parsing & Toast Notifications
// ==========================================

const ErrorHandler = {
    // Dynamically ensures the Toast container exists on the body
    _getOrCreateToastContainer() {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            
            // Add custom inline CSS style for Toast Container
            const style = document.createElement("style");
            style.textContent = `
                #toast-container {
                    position: fixed;
                    top: 24px;
                    right: 24px;
                    z-index: 999999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    max-width: 420px;
                    width: 100%;
                    pointer-events: none;
                }
                .fixora-toast {
                    background: var(--bg-secondary, #ffffff);
                    color: var(--text-primary, #2d3748);
                    border-left: 5px solid var(--accent, #667eea);
                    padding: 16px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    transform: translateY(-20px);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                    pointer-events: auto;
                }
                .fixora-toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                .fixora-toast.error {
                    border-left-color: #ef4444;
                }
                .fixora-toast.success {
                    border-left-color: #10b981;
                }
                .fixora-toast.warning {
                    border-left-color: #f59e0b;
                }
                .toast-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                .toast-icon.error { color: #ef4444; }
                .toast-icon.success { color: #10b981; }
                .toast-icon.warning { color: #f59e0b; }
                .toast-content {
                    flex-grow: 1;
                }
                .toast-title {
                    font-weight: 700;
                    font-size: 0.95rem;
                    margin-bottom: 4px;
                }
                .toast-message {
                    font-size: 0.85rem;
                    color: var(--text-secondary, #718096);
                    line-height: 1.4;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: var(--text-light, #a0aec0);
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0;
                    flex-shrink: 0;
                    transition: color 0.2s;
                }
                .toast-close:hover {
                    color: var(--text-primary, #2d3748);
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(container);
        }
        return container;
    },

    showNotification(title, message, type = "error") {
        const container = this._getOrCreateToastContainer();
        const toast = document.createElement("div");
        toast.className = `fixora-toast ${type}`;
        
        let iconClass = "fa-circle-info";
        if (type === "error") iconClass = "fa-circle-xmark";
        if (type === "success") iconClass = "fa-circle-check";
        if (type === "warning") iconClass = "fa-circle-exclamation";

        toast.innerHTML = `
            <div class="toast-icon ${type}"><i class="fas ${iconClass}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-xmark"></i></button>
        `;

        toast.querySelector(".toast-close").addEventListener("click", () => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        });

        container.appendChild(toast);
        
        // Trigger reflow for transition
        toast.offsetHeight;
        toast.classList.add("show");

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove("show");
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },

    // Handles raw response errors and parses them
    async parseAndHandleError(errorResponse) {
        let title = "API Error";
        let message = "An unexpected error occurred.";

        try {
            if (errorResponse && typeof errorResponse.json === "function") {
                const errorData = await errorResponse.json().catch(() => null);
                if (errorData) {
                    title = errorData.title || title;
                    
                    // Parse validation error details if they exist
                    if (errorData.errors) {
                        message = Object.entries(errorData.errors)
                            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
                            .join("<br>");
                    } else {
                        message = errorData.detail || errorData.message || message;
                    }
                }
            } else if (errorResponse instanceof Error) {
                title = "Network Error";
                message = errorResponse.message;
            }
        } catch (e) {
            console.error("Failed to parse API error", e);
        }

        this.showNotification(title, message, "error");
        return { title, message };
    }
};

window.ErrorHandler = ErrorHandler;
