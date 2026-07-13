// ==========================================
// THEME TOGGLE (Dark / Light Mode)
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

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

// ==========================================
// HAMBURGER MENU
// ==========================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

// Close menu on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('open');
    });
});

// ==========================================
// SIDEBAR TOGGLE (Mobile)
// ==========================================
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('show');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
    });
}

// Close sidebar when clicking a link on mobile
document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        }
    });
});

// ==========================================
// SIDEBAR NAVIGATION - ROLE BASED (UPDATED)
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
    
    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('providerVerified');
    localStorage.removeItem('currentRequest');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
    localStorage.removeItem('fixoraSubscription');
    
    // Redirect to HOME page (index.html)
    window.location.href = 'index.html';
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Update sidebar based on role
    updateSidebarNavigation();

    // Update auth link in navbar
    const authLink = document.getElementById('authLink');
    const role = localStorage.getItem('userRole');
    if (authLink) {
        if (role) {
            authLink.innerHTML = `<a href="index.html" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> Logout</a>`;
        } else {
            authLink.innerHTML = `<a href="login.html"><i class="fas fa-right-to-bracket"></i> Login</a>`;
        }
    }

    // Protect dashboard pages
    const currentPage = window.location.pathname.split('/').pop();
    
    // ✅ صفحات محمية للـ Customer
    const protectedCustomerPages = ['customer-dashboard.html', 'my-orders.html', 'customer-profile.html', 'post-request.html'];
    
    // ✅ صفحات محمية للـ Provider
    const protectedProviderPages = ['provider-dashboard.html', 'orders.html', 'schedule.html', 'profile.html', 'subscription.html'];
    
    // ✅ صفحات مشتركة (يدخلها الـ Customer والـ Provider)
    const sharedPages = ['examination.html', 'execution.html', 'rating.html', 'order-details.html', 'chat.html'];

    // Allow access to index.html and public pages for everyone
    const publicPages = ['index.html', 'services.html', 'about.html', 'contact.html', 'login.html', 'register.html'];
    if (publicPages.includes(currentPage)) return;

    // ✅ إذا كانت الصفحة مشتركة، نسمح بالدخول للمستخدمين المسجلين فقط
    if (sharedPages.includes(currentPage)) {
        if (!role) {
            window.location.href = 'login.html';
        }
        return;
    }

    // select-technician.html is accessible only when there's a current request
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
// SET ACTIVE LINK IN SIDEBAR (لون ثابت)
// ==========================================
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.sidebar-nav ul li a');
    
    links.forEach(link => {
        // شيل الـ active من كل الروابط
        link.classList.remove('active');
        
        // لو الرابط هو الصفحة الحالية، ضيف active
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// تشغيلها عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setActiveLink();
});