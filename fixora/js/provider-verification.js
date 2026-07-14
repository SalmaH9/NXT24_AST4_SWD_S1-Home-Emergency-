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
async function submitVerification() {
    const name = document.getElementById('vFullName').value.trim();
    const experience = parseInt(document.getElementById('vExperience').value) || 0;
    const specialties = Array.from(document.querySelectorAll('.specialty-tag.selected'))
        .map(tag => tag.textContent.trim()).join(', ');
    const bio = document.getElementById('vBio').value.trim();

    const idFileInput = document.getElementById('idFile');
    const criminalFileInput = document.getElementById('criminalFile');
    const licenseFileInput = document.getElementById('licenseFile');

    if (idFileInput.files.length === 0 || criminalFileInput.files.length === 0) {
        ErrorHandler.showNotification('Validation Error', 'ID Card and Criminal Record files are required.', 'error');
        return;
    }

    try {
        Loading.show("Updating profile details...");
        
        // Update Profile Details
        await api.put('/profile', {
            fullName: name,
            bio: bio,
            serviceCategory: specialties || 'General Maintenance',
            experienceYears: experience,
            availabilityStatus: 'Offline',
            serviceRadiusKm: 25
        }, { showLoader: false });

        // Upload ID Card
        Loading.show("Uploading ID Card...");
        const idFormData = new FormData();
        idFormData.append("type", "0"); // DocumentType.IDCard is 0
        idFormData.append("files", idFileInput.files[0]);
        await api.post('/documents/upload', idFormData, { showLoader: false });

        // Upload Criminal Record (ProfessionalCertificate is 2)
        Loading.show("Uploading Criminal Record...");
        const crimFormData = new FormData();
        crimFormData.append("type", "2"); // DocumentType.ProfessionalCertificate is 2
        crimFormData.append("files", criminalFileInput.files[0]);
        await api.post('/documents/upload', crimFormData, { showLoader: false });

        // Upload License if provided
        if (licenseFileInput.files.length > 0) {
            Loading.show("Uploading License...");
            const licFormData = new FormData();
            licFormData.append("type", "2"); 
            licFormData.append("files", licenseFileInput.files[0]);
            await api.post('/documents/upload', licFormData, { showLoader: false });
        }

        Loading.hide();

        localStorage.setItem('providerVerified', 'pending');
        localStorage.setItem('providerStatus', 'under_review');
        
        // Hide form, show success
        document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
        const pSteps = document.querySelector('.progress-steps');
        if (pSteps) pSteps.style.display = 'none';
        const wBox = document.querySelector('.warning-box');
        if (wBox) wBox.style.display = 'none';
        
        const formCard = document.querySelector('.form-card');
        if (formCard) formCard.style.display = 'none';
        const stepNav = document.querySelector('.step-nav');
        if (stepNav) stepNav.style.display = 'none';
        
        document.getElementById('successState').classList.add('show');

        // Unlock navbar on success
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.classList.remove('nav-locked');
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.removeAttribute('onclick');
        });

    } catch (err) {
        Loading.forceHide();
        console.error('Failed to submit verification details:', err);
    }
}

// ==========================================
// 🔧 DEVELOPMENT MODE: Simulate Admin Approval
// ==========================================
function simulateAdminApproval() {
    if (confirm('⚠️ Development Mode: Simulate admin approval?\n\nThis will mark your verification as APPROVED.')) {
        localStorage.setItem('providerVerified', 'approved');
        localStorage.setItem('providerStatus', 'approved');
        
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
document.addEventListener('DOMContentLoaded', async function() {
    if (!Auth.checkAuth(['provider', 'company'])) {
        return;
    }

    // Set footer date
    const dateEl = document.getElementById('footer-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    try {
        const profile = await api.get('/profile');
        if (profile) {
            localStorage.setItem('userName', profile.fullName);
            document.getElementById('vFullName').value = profile.fullName;

            const verified = profile.status; // 'Active', 'Pending', 'Suspended', 'Inactive'
            console.log('📌 Backend Verification Status:', verified);

            if (verified === 'Active') {
                localStorage.setItem('providerVerified', 'approved');
                localStorage.setItem('providerStatus', 'approved');
                
                try {
                    const sub = await api.get('/subscriptions/my-subscription', { showLoader: false });
                    if (sub && sub.status === 'Active') {
                        localStorage.setItem('fixoraSubscription', JSON.stringify({ plan: sub.planName.toLowerCase(), expiresAt: sub.endDate }));
                        localStorage.setItem('providerActive', 'true');
                        window.location.href = 'provider-dashboard.html';
                    } else {
                        localStorage.setItem('providerActive', 'false');
                        window.location.href = 'subscription.html';
                    }
                } catch (subErr) {
                    localStorage.setItem('providerActive', 'false');
                    window.location.href = 'subscription.html';
                }
                return;
            } else if (verified === 'Pending') {
                const docs = await api.get('/documents/my-documents', { showLoader: false });
                if (docs && docs.length > 0) {
                    localStorage.setItem('providerVerified', 'pending');
                    localStorage.setItem('providerStatus', 'under_review');
                    
                    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
                    const pSteps = document.querySelector('.progress-steps');
                    if (pSteps) pSteps.style.display = 'none';
                    const wBox = document.querySelector('.warning-box');
                    if (wBox) wBox.style.display = 'none';
                    
                    const formCard = document.querySelector('.form-card');
                    if (formCard) formCard.style.display = 'none';
                    const stepNav = document.querySelector('.step-nav');
                    if (stepNav) stepNav.style.display = 'none';
                    
                    document.getElementById('waitingState').style.display = 'block';
                    
                    const simDiv = document.getElementById('adminSimulation');
                    if (simDiv) simDiv.style.display = 'block';
                    return;
                }
            }
        }
    } catch (e) {
        console.error('Error fetching verification status:', e);
    }

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
    Auth.logout();
}