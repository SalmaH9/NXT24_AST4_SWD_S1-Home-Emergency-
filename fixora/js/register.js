// ==========================================
// REGISTER.JS - Sign Up Page Logic
// ==========================================

// ===== ROLE SELECTOR =====
const customerRole = document.getElementById('customerRole');
const providerRole = document.getElementById('providerRole');
const providerNote = document.getElementById('providerNote');

customerRole.addEventListener('click', function() {
    this.classList.add('active');
    providerRole.classList.remove('active');
    document.querySelector('input[name="role"][value="customer"]').checked = true;
    providerNote.classList.remove('show');
});

providerRole.addEventListener('click', function() {
    this.classList.add('active');
    customerRole.classList.remove('active');
    document.querySelector('input[name="role"][value="provider"]').checked = true;
    providerNote.classList.add('show');
});

// ===== TOGGLE PASSWORD =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// ===== HANDLE REGISTER =====
function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const role = document.querySelector('input[name="role"]:checked').value;

    // Validation
    if (fullName === '' || email === '' || phone === '' || password === '') {
        errorText.textContent = 'Please fill in all fields';
        errorMessage.classList.add('show');
        return;
    }

    if (password.length < 8) {
        errorText.textContent = 'Password must be at least 8 characters';
        errorMessage.classList.add('show');
        return;
    }

    if (password !== confirmPassword) {
        errorText.textContent = 'Passwords do not match';
        errorMessage.classList.add('show');
        return;
    }

    // Simulate registration success
    errorMessage.classList.remove('show');

    // Store user data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('isVerified', 'false'); // Provider needs verification

    // Show success and redirect
    alert('✅ Account created successfully!');

    if (role === 'customer') {
        window.location.href = 'customer-dashboard.html';
    } else if (role === 'provider') {
        // Provider goes to verification page first
        window.location.href = 'provider-verification.html';
    }
}

// ===== REAL-TIME VALIDATION =====
document.querySelectorAll('#registerForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('errorMessage').classList.remove('show');
    });
});
