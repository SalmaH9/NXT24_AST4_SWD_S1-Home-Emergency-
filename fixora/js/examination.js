// ==========================================
// EXAMINATION.JS - Inspection Report Logic
// ==========================================

var examPhotos = [];
var currentRole = null;
var currentRequest = null;
var currentExamination = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    currentRole = localStorage.getItem('userRole');
    if (!currentRole) {
        window.location.href = 'login.html';
        return;
    }
    
    // Resolve Request ID from query params or localStorage
    var params = new URLSearchParams(window.location.search);
    var reqId = params.get('id');
    if (!reqId) {
        var savedRequest = localStorage.getItem('currentRequest');
        if (savedRequest) {
            try {
                var parsed = JSON.parse(savedRequest);
                reqId = parsed.id;
            } catch(e) {}
        }
    }
    
    if (!reqId) {
        ErrorHandler.showNotification('Error', 'No service request ID context found.', 'error');
        return;
    }

    try {
        // Fetch fresh request state
        currentRequest = await api.get(`/service-requests/${reqId}`);
        if (currentRequest) {
            localStorage.setItem('currentRequest', JSON.stringify(currentRequest));

            // Load Request Banner details
            await loadRequestBanner();

            // Determine and load the appropriate view (Tech or Customer)
            await determineView();
        }
    } catch (err) {
        console.error('Failed to load examination request:', err);
    }
    
    updateFooterDate();
});

function updateFooterDate() {
    const el = document.getElementById('footer-date');
    if (el) {
        el.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
}

// ===== LOAD REQUEST BANNER =====
async function loadRequestBanner() {
    if (!currentRequest) return;

    var reqId = document.getElementById('reqId');
    if (reqId) reqId.textContent = `#ID-${currentRequest.id.substring(0, 8).toUpperCase()}`;

    // Resolve category name
    const categories = await api.get('/categories', { showLoader: false });
    let categoryName = 'Emergency Repair';
    if (categories) {
        const cat = categories.find(c => c.id === currentRequest.categoryId);
        if (cat) categoryName = cat.name;
    }
    
    var categoryEl = document.getElementById('reqCategory');
    if (categoryEl) categoryEl.textContent = categoryName;
    
    var locationEl = document.getElementById('reqLocation');
    if (locationEl) locationEl.textContent = currentRequest.address || 'Cairo';
    
    var customerEl = document.getElementById('reqCustomer');
    if (customerEl) customerEl.textContent = 'Customer #' + currentRequest.customerId.substring(0, 5).toUpperCase();
    
    var descEl = document.getElementById('reqDesc');
    if (descEl) descEl.textContent = currentRequest.description || 'No description';

    // Update status badge dynamically
    var statusEl = document.getElementById('reqStatus');
    if (statusEl) {
        if (currentRequest.status === 'ProviderSelected') {
            statusEl.innerHTML = '<i class="fas fa-user-check"></i> Technician Assigned';
            statusEl.style.background = '#dbeafe';
            statusEl.style.color = '#1e40af';
        } else if (currentRequest.status === 'WaitingCustomerApproval') {
            statusEl.innerHTML = '<i class="fas fa-file-medical"></i> Examination Submitted';
            statusEl.style.background = '#fef3c7';
            statusEl.style.color = '#b45309';
        } else if (currentRequest.status === 'InProgress') {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> In Progress';
            statusEl.style.background = '#d1fae5';
            statusEl.style.color = '#065f46';
        } else {
            statusEl.innerHTML = `<i class="fas fa-info-circle"></i> Status: ${currentRequest.status}`;
            statusEl.style.background = 'var(--bg-primary)';
            statusEl.style.color = 'var(--text-primary)';
        }
    }
}

// ===== DETERMINE WHICH VIEW TO SHOW =====
async function determineView() {
    var techView = document.getElementById('techView');
    var customerView = document.getElementById('customerView');
    var historyView = document.getElementById('historyView');
    var acceptedView = document.getElementById('acceptedView');

    if (!currentRequest) return;

    // Check if request is in InProgress or Completed state
    if (currentRequest.status === 'InProgress' || currentRequest.status === 'Completed') {
        if (techView) techView.style.display = 'none';
        if (customerView) customerView.style.display = 'none';
        if (historyView) historyView.style.display = 'none';
        if (acceptedView) acceptedView.style.display = 'block';
        return;
    }

    try {
        // Query the examination report from backend
        let hasReport = false;
        try {
            // silent: مفيش تقرير لسه = حالة عادية مش خطأ، فمانطلّعش إشعار أحمر
            currentExamination = await api.get(`/service-requests/${currentRequest.id}/examination`, { showLoader: false, silent: true });
            if (currentExamination && currentExamination.id) {
                hasReport = true;
            }
        } catch (e) {
            currentExamination = null;
        }

        if (currentRole === 'provider' || currentRole === 'company') {
            if (hasReport) {
                // If report was already submitted by this provider, display it in history
                if (techView) techView.style.display = 'none';
                if (customerView) customerView.style.display = 'none';
                if (historyView) historyView.style.display = 'block';
                if (acceptedView) acceptedView.style.display = 'none';
                
                loadHistoryView([currentExamination]);
            } else {
                // Otherwise show the form to submit a new report
                if (techView) techView.style.display = 'block';
                if (customerView) customerView.style.display = 'none';
                if (historyView) historyView.style.display = 'none';
                if (acceptedView) acceptedView.style.display = 'none';
            }
        } else if (currentRole === 'customer') {
            if (hasReport) {
                // If a report exists, show it for decision making
                if (techView) techView.style.display = 'none';
                if (customerView) customerView.style.display = 'block';
                if (historyView) historyView.style.display = 'none';
                if (acceptedView) acceptedView.style.display = 'none';
                
                loadCustomerView(currentExamination);
            } else {
                // Awaiting examination report
                if (techView) techView.style.display = 'none';
                if (customerView) customerView.style.display = 'none';
                if (historyView) historyView.style.display = 'none';
                if (acceptedView) acceptedView.style.display = 'none';
                
                renderAwaitingState();
            }
        }
    } catch (err) {
        console.error('Failed in determineView:', err);
    }
}

function renderAwaitingState() {
    var container = document.querySelector('.exam-container');
    if (container) {
        var existingEmpty = container.querySelector('.empty-state');
        if (existingEmpty) existingEmpty.remove();
        
        var emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.style.cssText = 'text-align:center;padding:60px 20px;';
        emptyDiv.innerHTML = `
            <i class="fas fa-clock" style="font-size:4rem;color:var(--border);margin-bottom:16px;"></i>
            <h3>Awaiting Examination</h3>
            <p style="color:var(--text-secondary);">The technician is inspecting the issue. Check back soon for the report.</p>
            <a href="customer-dashboard.html" class="btn-step btn-next" style="text-decoration:none;margin-top:20px;display:inline-block;padding:12px 32px;background:var(--gradient-primary);color:white;border-radius:14px;font-weight:700;">
                <i class="fas fa-gauge-high"></i> Dashboard
            </a>
        `;
        container.appendChild(emptyDiv);
    }
}

// ===== LOAD HISTORY VIEW (for technicians) =====
function loadHistoryView(exams) {
    var prevExams = document.getElementById('prevExams');
    var prevList = document.getElementById('prevList');
    var prevCount = document.getElementById('prevCount');
    var historyList = document.getElementById('historyList');

    if (prevExams) {
        prevExams.style.display = 'block';
        if (prevCount) prevCount.textContent = exams.length + ' submitted report(s)';
        if (prevList) {
            prevList.innerHTML = exams.map(function(e) {
                var createdStr = e.createdAt ? e.createdAt.split('T')[0] : 'Today';
                return `
                    <div class="prev-item">
                        <div class="prev-item-header">
                            <h4><i class="fas fa-user-check"></i> Report Details</h4>
                            <span class="prev-date">${createdStr}</span>
                        </div>
                        <p>${e.report.substring(0, 100)}...</p>
                        <span class="prev-price">${e.estimatedPrice} EGP</span>
                    </div>
                `;
            }).join('');
        }
    }

    if (historyList) {
        historyList.innerHTML = exams.map(function(e) {
            return `
                <div class="history-item">
                    <div class="history-header">
                        <h4><i class="fas fa-file-invoice"></i> Inspection Report</h4>
                        <span class="history-status ${e.isApproved ? 'accepted' : 'pending'}">${e.isApproved ? 'APPROVED' : 'AWAITING APPROVAL'}</span>
                    </div>
                    <div class="report-section">
                        <h4><i class="fas fa-magnifying-glass"></i> Details</h4>
                        <p style="white-space: pre-line;">${e.report}</p>
                    </div>
                    <div class="report-price-box">
                        <div class="price-row total">
                            <span class="label">Estimated Price</span>
                            <span class="value">${e.estimatedPrice} EGP</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function showTechView() {
    var historyView = document.getElementById('historyView');
    var techView = document.getElementById('techView');
    if (historyView) historyView.style.display = 'none';
    if (techView) techView.style.display = 'block';
}

// ===== LOAD CUSTOMER VIEW =====
async function loadCustomerView(exam) {
    currentExamination = exam;

    // Resolve provider details
    let techName = 'Service Provider';
    let techRating = '4.8';
    let techExp = '5 years exp';
    
    try {
        const providerProfile = await api.get(`/profile/${exam.providerId}`, { showLoader: false });
        if (providerProfile) {
            techName = providerProfile.fullName || techName;
            techRating = providerProfile.rating || techRating;
            const years = providerProfile.providerProfile?.experienceYears || providerProfile.companyProfile?.experienceYears;
            if (years) techExp = years + ' years exp';
        }
    } catch (e) {}

    var techNameEl = document.getElementById('reportTechName');
    if (techNameEl) techNameEl.textContent = techName;
    
    var ratingEl = document.getElementById('reportTechRating');
    if (ratingEl) ratingEl.textContent = '★ ' + techRating;
    
    var expEl = document.getElementById('reportTechExp');
    if (expEl) expEl.textContent = techExp;
    
    var dateEl = document.getElementById('reportDate');
    if (dateEl) {
        var createdStr = exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'Today';
        dateEl.innerHTML = '<i class="fas fa-calendar"></i> ' + createdStr;
    }

    // Split report text to distribute to placeholders
    var rawReport = exam.report || '';
    var diagnosis = rawReport;
    var solution = 'Listed in details';
    var materials = 'N/A';
    var estTime = 'Not specified';

    if (rawReport.includes('DIAGNOSIS:')) {
        const parts = rawReport.split('\n');
        parts.forEach(p => {
            if (p.startsWith('DIAGNOSIS:')) diagnosis = p.replace('DIAGNOSIS:', '').trim();
            if (p.startsWith('SOLUTION:')) solution = p.replace('SOLUTION:', '').trim();
            if (p.startsWith('MATERIALS:')) materials = p.replace('MATERIALS:', '').trim();
            if (p.startsWith('ESTIMATED TIME:')) estTime = p.replace('ESTIMATED TIME:', '').trim();
        });
    }

    var diagnosisEl = document.getElementById('reportDiagnosis');
    if (diagnosisEl) diagnosisEl.textContent = diagnosis;
    
    var solutionEl = document.getElementById('reportSolution');
    if (solutionEl) solutionEl.textContent = solution;
    
    var materialsEl = document.getElementById('reportMaterials');
    if (materialsEl) materialsEl.textContent = materials;
    
    var estTimeEl = document.getElementById('reportEstTime');
    if (estTimeEl) estTimeEl.textContent = estTime;
    
    var priceEl = document.getElementById('reportPrice');
    if (priceEl) priceEl.textContent = exam.estimatedPrice + ' EGP';

    // Decision block control
    var decisionBox = document.getElementById('decisionBox');
    if (decisionBox) {
        if (currentRequest.status === 'InProgress' || currentRequest.status === 'Completed' || currentRequest.status === 'Cancelled') {
            decisionBox.style.display = 'none';
        } else {
            decisionBox.style.display = 'flex';
        }
    }
}

// ===== HANDLE EXAM PHOTOS =====
function handleExamPhotos(input) {
    var files = Array.from(input.files);
    var grid = document.getElementById('examPhotoGrid');

    files.forEach(function(file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ File "' + file.name + '" exceeds 5MB limit');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var item = document.createElement('div');
            item.className = 'media-preview-item';
            item.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" />
                <button class="remove-media" onclick="this.parentElement.remove(); removeExamPhoto('${file.name}')"><i class="fas fa-times"></i></button>
            `;
            if (grid) grid.appendChild(item);
            examPhotos.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    input.value = '';
}

function removeExamPhoto(filename) {
    examPhotos = examPhotos.filter(function(p) { return !p.includes(filename); });
}

// Drag and drop setup
var examMediaUpload = document.getElementById('examMediaUpload');
if (examMediaUpload) {
    examMediaUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        examMediaUpload.style.borderColor = 'var(--accent)';
        examMediaUpload.style.background = 'rgba(102, 126, 234, 0.08)';
    });
    examMediaUpload.addEventListener('dragleave', function() {
        examMediaUpload.style.borderColor = 'var(--border)';
        examMediaUpload.style.background = 'var(--bg-primary)';
    });
    examMediaUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        examMediaUpload.style.borderColor = 'var(--border)';
        examMediaUpload.style.background = 'var(--bg-primary)';
        var input = document.getElementById('examPhotos');
        if (input) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// ===== SUBMIT EXAMINATION (TECHNICIAN) =====
async function submitExamination() {
    var diagnosis = document.getElementById('diagnosis').value.trim();
    var solution = document.getElementById('solution').value.trim();
    var priceInput = document.getElementById('initialPrice');
    var estTimeInput = document.getElementById('estTime');
    var materialsInput = document.getElementById('materials');

    var price = priceInput ? parseFloat(priceInput.value) : 0;
    var estTime = estTimeInput ? estTimeInput.value.trim() : 'N/A';
    var materials = materialsInput ? materialsInput.value.trim() : 'N/A';

    if (!diagnosis || !solution || isNaN(price) || price <= 0) {
        ErrorHandler.showNotification('Validation Error', 'Please fill in all required fields (Diagnosis, Solution, Price).', 'error');
        return;
    }

    const reportContent = `DIAGNOSIS: ${diagnosis}
SOLUTION: ${solution}
MATERIALS: ${materials}
ESTIMATED TIME: ${estTime}`;

    try {
        await api.post('/examinations', {
            serviceRequestId: currentRequest.id,
            report: reportContent,
            estimatedPrice: price
        });

        ErrorHandler.showNotification('Success', 'Examination report submitted successfully! Customer will review it.', 'success');
        
        setTimeout(() => {
            window.location.href = 'provider-dashboard.html';
        }, 1500);
    } catch (err) {
        console.error('Failed to submit examination:', err);
    }
}

// ===== ACCEPT EXAMINATION =====
async function acceptExamination() {
    if (!currentExamination) return;

    try {
        // Approve examination report
        await api.put(`/examinations/${currentExamination.id}/approve`, { isApproved: true });
        
        ErrorHandler.showNotification('Success', 'Examination report approved successfully! Starting service execution.', 'success');

        // Fetch fresh request state to update localStorage
        const req = await api.get(`/service-requests/${currentRequest.id}`, { showLoader: false });
        if (req) {
            localStorage.setItem('currentRequest', JSON.stringify(req));
        }

        setTimeout(() => {
            window.location.href = `execution.html?id=${currentRequest.id}`;
        }, 1500);
    } catch (err) {
        console.error('Failed to approve examination:', err);
    }
}

// ===== REJECT EXAMINATION =====
async function rejectExamination() {
    if (!currentExamination) return;

    try {
        // Reject examination report
        await api.put(`/examinations/${currentExamination.id}/approve`, { isApproved: false });
        
        ErrorHandler.showNotification('Notification', 'Examination report rejected. The request is returned to bidding.', 'success');

        setTimeout(() => {
            window.location.href = 'customer-dashboard.html';
        }, 1500);
    } catch (err) {
        console.error('Failed to reject examination:', err);
    }
}

// ===== LOGOUT =====
function handleLogout(event) {
    if (event) event.preventDefault();
    Auth.logout();
}