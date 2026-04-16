/**
 * HOMEFIX - Home Emergency Service Platform
 * Main JavaScript File
 * Features: Smooth scrolling, form validation, animations, localStorage management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initScrollAnimations();
    initLoginForm();
    initMobileMenu();
    initPasswordToggle();
});

/**
 * Navigation functionality
 * Handles sticky navbar and scroll effects
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class for styling
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();

        lastScroll = currentScroll;
    });
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    let current = '';
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navLinks = document.getElementById('navLinks');
                if (navLinks?.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
}

/**
 * Intersection Observer for scroll animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.service-card, .step-card, .testimonial-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/**
 * Mobile menu toggle functionality
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Toggle icon
        const icon = this.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

/**
 * Login form handling with validation
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        // Validate inputs
        let isValid = true;
        
        // Email validation
        if (!email) {
            showError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            showError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            showError('password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        const submitBtn = document.getElementById('loginBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnIcon = submitBtn.querySelector('.fa-arrow-right');
        const spinner = submitBtn.querySelector('.spinner');
        
        submitBtn.disabled = true;
        btnText.textContent = 'Signing in...';
        btnIcon.classList.add('hidden');
        spinner.classList.remove('hidden');
        
        // Simulate API call
        setTimeout(() => {
            // Store user data in localStorage
            const userData = {
                email: email,
                role: role,
                isLoggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            // If remember me is checked, store permanently, otherwise use session
            if (rememberMe) {
                localStorage.setItem('homefix_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('homefix_user', JSON.stringify(userData));
            }
            
            // Show success toast
            showToast('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                if (role === 'provider') {
                    window.location.href = 'provider-dashboard.html';
                } else {
                    window.location.href = 'customer-dashboard.html';
                }
            }, 1500);
            
        }, 1500);
    });
}

/**
 * Password visibility toggle
 */
function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (!toggleBtn || !passwordInput) return;
    
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
}

/**
 * Helper function to validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Helper function to show error message
 */
function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    if (input) {
        input.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Helper function to clear all errors
 */
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error');
    });
}

/**
 * Toast notification system
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // Set message and icon based on type
    toastMessage.textContent = message;
    const icon = toast.querySelector('i');
    
    // Reset classes
    toast.className = 'toast';
    if (type === 'success') {
        toast.style.background = 'var(--success)';
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toast.style.background = 'var(--danger)';
        icon.className = 'fas fa-exclamation-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Check if user is logged in (utility function for other pages)
 */
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('homefix_user') || sessionStorage.getItem('homefix_user') || '{}');
    return user.isLoggedIn || false;
}

/**
 * Logout functionality
 */
function logout() {
    localStorage.removeItem('homefix_user');
    sessionStorage.removeItem('homefix_user');
    window.location.href = 'index.html';
}

// Expose utility functions globally
window.homefix = {
    checkAuth,
    logout,
    showToast
};