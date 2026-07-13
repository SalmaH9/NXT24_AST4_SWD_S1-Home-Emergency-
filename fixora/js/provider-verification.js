// ==========================================
// PROVIDER-VERIFICATION.JS - Provider Onboarding Logic
// ==========================================

// ===== STEP MANAGEMENT =====
var currentStep = 1;
var totalSteps = 4;

function updateProgress() {
    const progressLine = document.getElementById('progressLine');
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressLine.style.width = percentage + '%';

    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < currentStep) {
            step.classList.add('completed');
            step.querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNum === currentStep) {
            step.classList.add('active');
            step.querySelector('.step-circle').textContent = stepNum;
        } else {
            step.querySelector('.step-circle').textContent = stepNum;
        }
    });
}

function showStep(stepNum) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('step' + stepNum).classList.add('active');
    currentStep = stepNum;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(stepNum) {
    if (validateStep(currentStep)) {
        if (stepNum === 4) {
            populateReview();
        }
        showStep(stepNum);
    }
}

function prevStep(stepNum) {
    showStep(stepNum);
}

// ===== VALIDATION =====
function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('vFullName').value.trim();
        const dob = document.getElementById('vDob').value;
        const nationalId = document.getElementById('vNationalId').value.trim();
        const country = document.getElementById('vCountry').value;
        const city = document.getElementById('vCity').value.trim();
        const address = document.getElementById('vAddress').value.trim();

        if (!name || !dob || !nationalId || !country || !city || !address) {
            alert('⚠️ Please fill in all required fields');
            return false;
        }
        if (nationalId.length !== 14) {
            alert('⚠️ National ID must be exactly 14 digits');
            return false;
        }
        if (!/^\d{14}$/.test(nationalId)) {
            alert('⚠️ National ID must contain only numbers');
            return false;
        }
    }

    if (step === 2) {
        const selected = document.querySelectorAll('.specialty-tag.selected');
        const experience = document.getElementById('vExperience').value;
        const rate = document.getElementById('vRate').value;

        if (selected.length === 0) {
            alert('⚠️ Please select at least one specialty');
            return false;
        }
        if (!experience || !rate) {
            alert('⚠️ Please fill in experience and rate');
            return false;
        }
    }

    if (step === 3) {
        const idFile = document.getElementById('idFile').files.length;
        const criminalFile = document.getElementById('criminalFile').files.length;

        if (idFile === 0 || criminalFile === 0) {
            alert('⚠️ Please upload both required documents');
            return false;
        }
    }

    return true;
}

// ===== SPECIALTY TAGS =====
document.querySelectorAll('.specialty-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        this.classList.toggle('selected');
    });
});

// ===== FILE UPLOAD =====
function handleFileSelect(input, previewId) {
    const file = input.files[0];
    if (!file) return;

    const preview = document.getElementById(previewId);
    const fileName = preview.querySelector('.file-name');
    const fileSize = preview.querySelector('.file-size');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    preview.classList.add('show');
}

function removeFile(inputId, previewId) {
    document.getElementById(inputId).value = '';
    document.getElementById(previewId).classList.remove('show');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Drag and drop
document.querySelectorAll('.file-upload').forEach(upload => {
    upload.addEventListener('dragover', (e) => {
        e.preventDefault();
        upload.classList.add('dragover');
    });
    upload.addEventListener('dragleave', () => {
        upload.classList.remove('dragover');
    });
    upload.addEventListener('drop', (e) => {
        e.preventDefault();
        upload.classList.remove('dragover');
        const input = upload.querySelector('input[type="file"]');
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
    });
});

// ===== POPULATE REVIEW =====
function populateReview() {
    document.getElementById('reviewName').textContent = document.getElementById('vFullName').value;
    document.getElementById('reviewId').textContent = document.getElementById('vNationalId').value;

    const countrySelect = document.getElementById('vCountry');
    document.getElementById('reviewCountry').textContent = countrySelect.options[countrySelect.selectedIndex].text;

    document.getElementById('reviewCity').textContent = document.getElementById('vCity').value;
    document.getElementById('reviewExp').textContent = document.getElementById('vExperience').value;

    const selectedTags = Array.from(document.querySelectorAll('.specialty-tag.selected'))
        .map(tag => tag.textContent.trim()).join(', ');
    document.getElementById('reviewServices').textContent = selectedTags;
    document.getElementById('reviewRate').textContent = document.getElementById('vRate').value + ' EGP/hour';

    const licenseFile = document.getElementById('licenseFile').files.length;
    document.getElementById('reviewLicense').innerHTML = licenseFile > 0 
        ? '<i class="fas fa-check-circle"></i> Uploaded' 
        : '<i class="fas fa-minus-circle"></i> Not provided';
    document.getElementById('reviewLicense').style.color = licenseFile > 0 ? '#48bb78' : 'var(--text-light)';
}

// ==========================================
// ✅ SUBMIT VERIFICATION
// ==========================================
function submitVerification() {
    // ✅ حفظ حالة التحقق
    localStorage.setItem('providerVerified', 'pending');
    localStorage.setItem('providerStatus', 'under_review');
    
    // ✅ حفظ بيانات مقدم الخدمة
    const providerData = {
        fullName: document.getElementById('vFullName').value,
        nationalId: document.getElementById('vNationalId').value,
        country: document.getElementById('vCountry').value,
        city: document.getElementById('vCity').value,
        address: document.getElementById('vAddress').value,
        bio: document.getElementById('vBio').value,
        experience: document.getElementById('vExperience').value,
        rate: document.getElementById('vRate').value,
        specialties: Array.from(document.querySelectorAll('.specialty-tag.selected'))
            .map(tag => tag.dataset.value),
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };
    
    localStorage.setItem('providerData', JSON.stringify(providerData));

    // Hide form, show success
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.progress-steps').style.display = 'none';
    document.querySelector('.warning-box').style.display = 'none';
    document.getElementById('successState').classList.add('show');

    // Unlock navbar on success
    document.getElementById('navbar').classList.remove('nav-locked');
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.removeAttribute('onclick');
    });
}

// ==========================================
// 🔧 DEVELOPMENT MODE: Simulate Admin Approval
// ==========================================
function simulateAdminApproval() {
    if (confirm('⚠️ Development Mode: Simulate admin approval?\n\nThis will mark your verification as APPROVED.')) {
        localStorage.setItem('providerVerified', 'approved');
        localStorage.setItem('providerStatus', 'approved');
        
        // ✅ تحديث حالة مقدم الخدمة
        const providerData = JSON.parse(localStorage.getItem('providerData') || '{}');
        providerData.status = 'approved';
        localStorage.setItem('providerData', JSON.stringify(providerData));
        
        alert('✅ Admin approval simulated!\n\nYou can now access the subscription page.');
        window.location.href = 'subscription.html';
    }
}

// ===== NAVBAR LOCK =====
function blockNav(event) {
    event.preventDefault();
    const overlay = document.getElementById('lockOverlay');
    overlay.classList.add('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2000);
    return false;
}

// ==========================================
// CHECK LOGIN & VERIFICATION STATUS
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const role = localStorage.getItem('userRole');
    if (role !== 'provider') {
        window.location.href = 'login.html';
        return;
    }

    // Pre-fill name if available
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('vFullName').value = userName;
    }

    // ✅ Check verification status
    const verified = localStorage.getItem('providerVerified');
    console.log('📌 Verification Status:', verified);
    
    if (verified === 'approved') {
        // ✅ إذا كان verified، نتحقق من الاشتراك
        const subscription = localStorage.getItem('fixoraSubscription');
        if (subscription) {
            try {
                const subData = JSON.parse(subscription);
                if (subData.plan && subData.plan !== 'free') {
                    // ✅ Verified + Subscribed → Dashboard
                    window.location.href = 'provider-dashboard.html';
                    return;
                }
            } catch(e) {}
        }
        // ✅ Verified but not subscribed → Subscription page
        window.location.href = 'subscription.html';
        return;
    } else if (verified === 'pending') {
        // ✅ قيد المراجعة - إظهار حالة الانتظار
        document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.progress-steps').style.display = 'none';
        document.querySelector('.warning-box').style.display = 'none';
        document.querySelector('.form-card')?.parentElement?.remove();
        document.querySelector('.step-nav')?.remove();
        
        document.getElementById('waitingState').style.display = 'block';
        
        // إظهار زر المحاكاة
        const simDiv = document.getElementById('adminSimulation');
        if (simDiv) simDiv.style.display = 'block';
        return;
    }

    // ✅ Show admin simulation button for development
    setTimeout(function() {
        const simDiv = document.getElementById('adminSimulation');
        if (simDiv) {
            simDiv.style.display = 'block';
        }
    }, 1000);
});

// ==========================================
// ✅ LOGOUT - redirects to HOME page
// ==========================================
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
    localStorage.removeItem('currentRequest');
    window.location.href = 'index.html';
}