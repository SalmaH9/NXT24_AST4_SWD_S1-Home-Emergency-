// ==========================================
// REGISTER.JS - Sign Up (متكامل مع الـ API)
// ==========================================
// الترتيب في الـ HTML:
//   config.js → tokenManager.js → loading.js → errorHandler.js → api.js → auth.js → register.js

// ===== TABS (Customer / Provider) =====
const customerTab = document.getElementById('customerTab');
const providerTab = document.getElementById('providerTab');
const providerNote = document.getElementById('providerNote');

customerTab.addEventListener('click', function () {
    this.classList.add('active');
    providerTab.classList.remove('active');
    document.querySelector('input[name="role"][value="customer"]').checked = true;
    providerNote.classList.remove('show');
});

providerTab.addEventListener('click', function () {
    this.classList.add('active');
    customerTab.classList.remove('active');
    document.querySelector('input[name="role"][value="provider"]').checked = true;
    providerNote.classList.add('show');
});

// ===== TOGGLE PASSWORD =====
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// ==========================================
// خريطة الأدوار
// ==========================================
// ⚠️ قاعدة ثابتة في المشروع:
//   - الـ API بيتوقّع  "Customer" / "Provider" / "Company"  (حرف كبير)
//   - الـ frontend بيقارن  'customer' / 'provider'          (حروف صغيرة)
const ROLE_TO_API = { customer: 'Customer', provider: 'Provider' };

// ==========================================
// استخراج رسالة الخطأ الحقيقية من رد السيرفر
// ==========================================
// api.js بيعمل `throw response` (الـ Response object نفسه)،
// فبنقراه هنا عشان نعرض السبب الحقيقي بدل رسالة عامة.
async function extractErrorMessage(err, fallback) {
    if (err instanceof Response) {
        try {
            const data = await err.clone().json();
            if (data.errors) {
                // ValidationProblemDetails → { errors: { Field: ["msg"] } }
                return Object.values(data.errors).flat().join(' ');
            }
            return data.detail || data.title || fallback;
        } catch (_) {
            return fallback;
        }
    }
    if (err && err.message) return err.message;
    return fallback;
}

// ===== HANDLE REGISTER =====
async function handleRegister(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const roleUi = document.querySelector('input[name="role"]:checked').value; // customer | provider

    const showError = (msg) => {
        errorText.textContent = msg;
        errorMessage.classList.add('show');
    };

    // ===== التحقق من جهة العميل =====
    if (fullName === '' || email === '' || phone === '' || password === '') {
        return showError('Please fill in all fields');
    }
    if (password.length < 8) {
        return showError('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
        return showError('Passwords do not match');
    }
    // ✅ مطابق لـ RegisterRequestValidator في الـ Backend:
    //    6 حروف على الأقل + حرف صغير + رقم
    //    (ملاحظة: ASP.NET Identity ممكن يطلب شروط إضافية — رسالته هتظهر تلقائيًا لو رفض)
    if (!/[a-z]/.test(password)) {
        return showError('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
        return showError('Password must contain at least one digit.');
    }

    errorMessage.classList.remove('show');

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Creating account...'; }

    try {
        const apiRole = ROLE_TO_API[roleUi] || 'Customer';

        // ---- 1) إنشاء الحساب (RegisterRequestDto) — بيرجّع true فقط، من غير توكن
        Loading.show('Creating your account...');
        await api.post('/Auth/register', {
            email: email,
            password: password,
            fullName: fullName,
            role: apiRole
        }, { showLoader: false });

        // ---- 2) تسجيل دخول تلقائي للحصول على التوكن (LoginResponseDto)
        Loading.show('Signing you in...');
        const loginRes = await api.post('/Auth/login', {
            email: email,
            password: password
        }, { showLoader: false });

        TokenManager.saveAccessToken(loginRes.accessToken);
        TokenManager.saveRefreshToken(loginRes.refreshToken);

        // ---- 3) جلب بيانات المستخدم
        // مهم: LoginResponseDto مفيهوش الدور ولا الاسم → لازم /Profile/me
        Loading.show('Loading your profile...');
        const me = await api.get('/Profile/me', { showLoader: false });

        // ⚠️ نخزّن الدور صغير عشان يطابق script.js و Auth.checkAuth
        TokenManager.setUserRole((me.role || apiRole).toLowerCase());
        TokenManager.setUserEmail(me.email || email);
        localStorage.setItem('userName', me.fullName || fullName);
        localStorage.setItem('userPhone', phone);

        // ---- 4) حفظ رقم التليفون (register مش بياخد phone)
        if (phone) {
            try {
                await api.put('/Profile', { fullName: fullName, phoneNumber: phone }, { showLoader: false });
            } catch (e) {
                console.warn('تعذّر حفظ رقم التليفون:', e);
            }
        }

        // ---- 5) حالة الحساب (AccountStatus: Pending | Active | Suspended | Inactive)
        const status = me.status;

        if (roleUi === 'provider') {
            // مقدم الخدمة الجديد بييجي Pending → لازم يكمّل التوثيق
            localStorage.setItem('providerVerified', status === 'Active' ? 'approved' : 'pending');
            localStorage.setItem('providerStatus', status === 'Active' ? 'approved' : 'under_review');
        }

        Loading.hide();
        ErrorHandler.showNotification('Welcome!', 'Your account has been created successfully.', 'success');

        // ---- 6) التوجيه حسب الدور
        setTimeout(() => {
            if (roleUi === 'customer') {
                window.location.href = 'customer-dashboard.html';
            } else {
                window.location.href = 'provider-verification.html';
            }
        }, 900);

    } catch (err) {
        Loading.forceHide();
        console.error('Registration failed:', err);

        // نظّف أي توكن ناقص لو الفشل حصل بعد الـ register
        TokenManager.clearTokens();

        const msg = await extractErrorMessage(err, 'Registration failed. Please check your details and try again.');
        showError(msg);
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalHtml; }
    }
}

// ===== REAL-TIME VALIDATION =====
document.querySelectorAll('#registerForm input').forEach(input => {
    input.addEventListener('input', () => {
        document.getElementById('errorMessage').classList.remove('show');
    });
});

window.handleRegister = handleRegister;