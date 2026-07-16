// ==========================================
// THEME TOGGLE (Dark / Light Mode) - SAFE VERSION
// ==========================================
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (!themeToggle || !body) return; // Skip if not on a page with theme toggle

    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
})();

// ==========================================
// HAMBURGER MENU - SAFE VERSION
// ==========================================
(function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });
})();

// ==========================================
// SIDEBAR TOGGLE (Mobile) - SAFE VERSION
// ==========================================
(function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (!sidebarToggle || !sidebar || !sidebarOverlay) return;

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('show');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    });

    // Close sidebar when clicking a link on mobile
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
            }
        });
    });
})();

// ==========================================
// SIDEBAR NAVIGATION - ROLE BASED (SAFE VERSION)
// ==========================================
function updateSidebarNavigation() {
    const role = localStorage.getItem('userRole');
    const sidebarNav = document.querySelector('.sidebar-nav ul');
    if (!sidebarNav) return;

    let links = '';

    if (role === 'customer') {
        links = `
            <li><a href="customer-dashboard.html"><i class="fas fa-gauge-high"></i> Dashboard</a></li>
            <li><a href="post-request.html"><i class="fas fa-plus-circle"></i> Post Request</a></li>            
            <li><a href="my-orders.html"><i class="fas fa-list-check"></i> My Orders</a></li>
            <li><a href="chat.html"><i class="fas fa-comments"></i> Messages</a></li>
            <li><a href="customer-profile.html"><i class="fas fa-user"></i> Profile</a></li>
        `;
    } else if (role === 'provider') {
        links = `
            <li><a href="provider-dashboard.html"><i class="fas fa-gauge-high"></i> Dashboard</a></li>
            <li><a href="orders.html"><i class="fas fa-list-check"></i> Orders</a></li>
            <li><a href="schedule.html"><i class="fas fa-calendar-days"></i> Schedule</a></li>
            <li><a href="chat.html"><i class="fas fa-comments"></i> Messages</a></li>
            <li><a href="subscription.html"><i class="fas fa-crown"></i> Subscription</a></li>
            <li><a href="examination.html"><i class="fas fa-file-medical"></i> Examination</a></li>
            <li><a href="profile.html"><i class="fas fa-user-gear"></i> Profile</a></li>
        `;
    } else {
        // Guest - show login/signup
        links = `
            <li><a href="login.html"><i class="fas fa-right-to-bracket"></i> Login</a></li>
            <li><a href="register.html"><i class="fas fa-user-plus"></i> Sign Up</a></li>
        `;
    }

    // Add logout at the bottom for logged-in users - returns to HOME page
    if (role) {
        links += `
            <li style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px;">
                <a href="index.html" onclick="handleLogout(event)" style="color: #ef4444; font-weight: 600;">
                    <i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i> Logout
                </a>
            </li>
        `;
    }

    sidebarNav.innerHTML = links;
}

// ==========================================
// LOGOUT FUNCTION - redirects to HOME page
// ==========================================
function handleLogout(event) {
    if (event) event.preventDefault();

    if (typeof Auth !== 'undefined' && Auth.logout) {
        Auth.logout();   // Clears everything via TokenManager.clearTokens
        return;
    }

    // Fallback if auth.js is not loaded on this page
    if (typeof TokenManager !== 'undefined') {
        TokenManager.clearTokens();
    }
    ['providerActive', 'providerStatus', 'rememberMe', 'providerData'].forEach(function (k) {
        localStorage.removeItem(k);
    });
    window.location.href = 'index.html';
}

// ==========================================
// INIT - SAFE VERSION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Update sidebar based on role
    updateSidebarNavigation();

    // Update auth link in navbar
    const authLink = document.getElementById('authLink');
    const role = localStorage.getItem('userRole');
    const currentPage = window.location.pathname.split('/').pop();

    // Public pages (not protected)
    const publicPages = ['index.html', 'services.html', 'about.html', 'contact.html', 'login.html', 'register.html'];

    if (authLink) {
        // If on public page, always show Login
        if (publicPages.includes(currentPage)) {
            authLink.innerHTML = `<a href="login.html"><i class="fas fa-right-to-bracket"></i> Login</a>`;
        } else if (role) {
            // If on protected page and logged in → Logout
            authLink.innerHTML = `<a href="index.html" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> Logout</a>`;
        } else {
            // If on protected page and not logged in → Login
            authLink.innerHTML = `<a href="login.html"><i class="fas fa-right-to-bracket"></i> Login</a>`;
        }
    }

    // Protect dashboard pages
    const protectedCustomerPages = ['customer-dashboard.html', 'my-orders.html', 'customer-profile.html', 'post-request.html'];
    const protectedProviderPages = ['provider-dashboard.html', 'orders.html', 'schedule.html', 'profile.html', 'subscription.html'];
    const protectedAdminPages = ['admin-dashboard.html', 'admin-customers.html', 'admin-providers.html', 'admin-orders.html', 'admin-reports.html', 'admin-settings.html'];
    const sharedPages = ['examination.html', 'execution.html', 'rating.html', 'order-details.html', 'chat.html'];

    // Allow access to index.html and public pages for everyone
    if (publicPages.includes(currentPage)) return;

    // Strict authentication check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('accessToken');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Role-based Admin check
    if (protectedAdminPages.includes(currentPage)) {
        if (role !== 'admin' && role !== 'Admin') {
            window.location.href = 'login.html';
            return;
        }
    }

    // Global Provider Onboarding Flow Enforcement
    if (role === 'provider' || role === 'company') {
        const verified = localStorage.getItem('providerVerified');
        const active = localStorage.getItem('providerActive') === 'true';

        if (verified !== 'approved') {
            // Unverified providers are locked to verification
            if (currentPage !== 'provider-verification.html' && currentPage !== 'profile.html') {
                window.location.href = 'provider-verification.html';
                return;
            }
        } else if (!active) {
            // Verified but unpaid/unsubscribed are locked to subscription page
            const allowedPages = ['subscription.html', 'profile.html', 'provider-verification.html'];
            if (!allowedPages.includes(currentPage)) {
                window.location.href = 'subscription.html';
                return;
            }
        }
    }

    // Shared pages - allow for logged in users only
    if (sharedPages.includes(currentPage)) {
        return;
    }

    // select-technician.html accessible only when there's a current request
    if (currentPage === 'select-technician.html') {
        const currentRequest = localStorage.getItem('currentRequest');
        if (!currentRequest && role !== 'customer') {
            window.location.href = 'index.html';
        }
        return;
    }

    if (protectedCustomerPages.includes(currentPage) && role !== 'customer') {
        window.location.href = 'login.html';
    }
    if (protectedProviderPages.includes(currentPage) && role !== 'provider') {
        window.location.href = 'login.html';
    }
});

// ==========================================
// SET ACTIVE LINK IN SIDEBAR
// ==========================================
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.sidebar-nav ul li a');

    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    setActiveLink();
});

// ==========================================
// DYNAMIC SIGNALR LOADER & REAL-TIME NOTIFICATIONS - SAFE VERSION
// ==========================================
var notificationConnection = null;

function initNotificationHub() {
    // Only init if RealTime and signalR are available
    if (typeof RealTime === "undefined" || typeof signalR === "undefined") {
        console.log("SignalR not available yet, skipping notification hub init");
        return;
    }

    notificationConnection = RealTime.createConnection("hubs/notifications");
    if (notificationConnection) {
        notificationConnection.on("ReceiveNotification", function(notificationDto) {
            console.log("Real-time notification received:", notificationDto);

            // Show Toast Alert
            if (typeof ErrorHandler !== "undefined" && ErrorHandler.showNotification) {
                ErrorHandler.showNotification(
                    notificationDto.title || "Notification",
                    notificationDto.body || "You have a new update.",
                    "success"
                );
            }

            // Dispatch custom event for page-level updates
            const event = new CustomEvent("realtimeNotification", { detail: notificationDto });
            document.dispatchEvent(event);
        });

        RealTime.startConnection("hubs/notifications").catch(err => {
            console.error("Failed to start Notification Hub connection:", err);
        });
    }
}

function loadSignalRDependencies(callback) {
    if (typeof signalR !== "undefined" && typeof RealTime !== "undefined") {
        if (callback) callback();
        return;
    }

    if (typeof signalR === "undefined") {
        const srScript = document.createElement("script");
        srScript.src = "https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js";
        srScript.onload = () => {
            if (typeof RealTime === "undefined") {
                const rtScript = document.createElement("script");
                rtScript.src = "../js/signalr.js";
                rtScript.onload = () => {
                    if (callback) callback();
                };
                document.head.appendChild(rtScript);
            } else {
                if (callback) callback();
            }
        };
        document.head.appendChild(srScript);
    } else if (typeof RealTime === "undefined") {
        const rtScript = document.createElement("script");
        rtScript.src = "../js/signalr.js";
        rtScript.onload = () => {
            if (callback) callback();
        };
        document.head.appendChild(rtScript);
    }
}

// Only init SignalR on non-admin pages (admin pages handle their own)
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    const adminPages = ['admin-dashboard.html', 'admin-customers.html', 'admin-providers.html', 
                        'admin-orders.html', 'admin-reports.html', 'admin-settings.html'];

    if (adminPages.includes(currentPage)) return; // Skip for admin pages

    const isLoggedInUser = localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('accessToken');
    if (isLoggedInUser) {
        loadSignalRDependencies(() => {
            initNotificationHub();
        });
    }
});

window.loadSignalRDependencies = loadSignalRDependencies;
window.initNotificationHub = initNotificationHub;