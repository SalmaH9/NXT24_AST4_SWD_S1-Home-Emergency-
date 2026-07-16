// ==========================================
// ADMIN-UTILS.JS - Shared Admin Page Utilities
// Safe to load on all admin pages. No conflicts with script.js
// ==========================================

// Make script.js functions available if needed, but safely
(function() {
    'use strict';

    // Only run on admin pages
    const currentPage = window.location.pathname.split('/').pop();
    const adminPages = ['admin-dashboard.html', 'admin-customers.html', 'admin-providers.html', 
                        'admin-orders.html', 'admin-reports.html', 'admin-settings.html'];

    if (!adminPages.includes(currentPage)) return;

    // ==========================================
    // SAFE THEME TOGGLE (for admin pages)
    // Uses 'themeToggle' ID (camelCase) - different from script.js 'theme-toggle'
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (themeToggle) {
        // Check saved admin theme
        if (localStorage.getItem('adminTheme') === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        }

        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('adminTheme', 'dark');
                this.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            } else {
                localStorage.setItem('adminTheme', 'light');
                this.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            }
        });
    }

    // ==========================================
    // SAFE SIDEBAR TOGGLE (for admin pages)
    // Uses 'sidebarToggle' ID (camelCase) - different from script.js 'sidebar-toggle'
    // ==========================================
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('open');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('open');
    }

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // ==========================================
    // SAFE LOGOUT
    // ==========================================
    window.handleLogout = function(event) {
        if (event) event.preventDefault();
        if (typeof Auth !== 'undefined' && Auth.logout) {
            Auth.logout();
        } else {
            if (typeof TokenManager !== 'undefined') TokenManager.clearTokens();
            window.location.href = 'index.html';
        }
    };

    // ==========================================
    // SET ACTIVE SIDEBAR LINK
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

    setActiveLink();

})();