// ==========================================
// EXAMINATION.JS - Inspection Report Logic
// ==========================================

var examPhotos = [];
var currentRole = null;
var currentRequest = null;
var currentExamination = null;

// ===== DEMO EXAMINATION DATA =====
var demoPrevExams = [
    {
        id: 'EXAM_001',
        techId: 'TECH_003',
        techName: 'Faisal Al-Harbi',
        diagnosis: 'The main water pipe under the kitchen sink has a 2cm crack due to corrosion. The rubber gasket is completely worn out and needs replacement.',
        solution: 'Replace the cracked PVC pipe section (approximately 30cm) with new piping. Install new rubber gasket and apply pipe sealant. Test for leaks after installation.',
        materials: 'PVC pipe 1/2 inch (30cm), Rubber gasket, Pipe sealant, Teflon tape',
        price: 220,
        estTime: '1-2 hours',
        status: 'pending',
        date: '2 days ago',
        photos: []
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Examination page loaded');
    
    // ✅ التحقق من وجود userRole
    currentRole = localStorage.getItem('userRole');
    console.log('📌 User Role:', currentRole);
    
    // ✅ إذا لم يكن المستخدم مسجلاً، نوجهه إلى login
    if (!currentRole) {
        console.log('❌ No user role found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // ✅ تحميل currentRequest من localStorage
    var savedRequest = localStorage.getItem('currentRequest');
    console.log('📌 Saved Request:', savedRequest);
    
    if (savedRequest) {
        try {
            currentRequest = JSON.parse(savedRequest);
            console.log('✅ Current Request loaded:', currentRequest);
        } catch(e) {
            console.log('❌ Error parsing currentRequest:', e);
            currentRequest = null;
        }
    }
    
    // ✅ إذا لم يكن موجود، ننشئ بيانات افتراضية
    if (!currentRequest || !currentRequest.id) {
        console.log('⚠️ No currentRequest found, creating default');
        currentRequest = {
            id: 'REQ_001',
            category: 'plumbing',
            city: 'Cairo',
            description: 'Kitchen sink leaking from pipe under counter...',
            customerEmail: localStorage.getItem('userEmail') || 'customer@fixora.com',
            status: 'selected',
            examinations: demoPrevExams,
            selectedTechnician: 'Faisal Al-Harbi'
        };
        console.log('✅ Created default request:', currentRequest);
        localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    }

    // ✅ تحميل الـ Banner و تحديد الـ View
    loadRequestBanner();
    determineView();
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
function loadRequestBanner() {
    if (!currentRequest || !currentRequest.id) {
        currentRequest = {
            id: 'REQ_001',
            category: 'plumbing',
            city: 'Cairo',
            description: 'Kitchen sink leaking from pipe under counter...',
            customerEmail: localStorage.getItem('userEmail') || 'customer@fixora.com',
            status: 'selected',
            examinations: demoPrevExams,
            selectedTechnician: 'Faisal Al-Harbi'
        };
        localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    }

    var reqId = document.getElementById('reqId');
    if (reqId) reqId.textContent = currentRequest.id;

    var catMap = {
        'plumbing': 'Plumbing', 'electrical': 'Electrical', 'ac-repair': 'AC Repair',
        'carpentry': 'Carpentry', 'painting': 'Painting', 'masonry': 'Masonry',
        'cleaning': 'Cleaning', 'gardening': 'Gardening', 'appliance': 'Appliance Repair',
        'pest-control': 'Pest Control', 'other': 'Other'
    };
    
    var categoryEl = document.getElementById('reqCategory');
    if (categoryEl) categoryEl.textContent = catMap[currentRequest.category] || 'General';
    
    var locationEl = document.getElementById('reqLocation');
    if (locationEl) locationEl.textContent = currentRequest.city || 'Unknown';
    
    var customerEl = document.getElementById('reqCustomer');
    if (customerEl) customerEl.textContent = currentRequest.customerEmail ? currentRequest.customerEmail.split('@')[0] : 'Customer';
    
    var descEl = document.getElementById('reqDesc');
    if (descEl) descEl.textContent = currentRequest.description || 'No description';

    // Update status
    var statusEl = document.getElementById('reqStatus');
    if (statusEl) {
        if (currentRequest.status === 'selected') {
            statusEl.innerHTML = '<i class="fas fa-user-check"></i> Technician Assigned';
            statusEl.style.background = '#dbeafe';
            statusEl.style.color = '#1e40af';
        } else if (currentRequest.status === 'examined') {
            statusEl.innerHTML = '<i class="fas fa-file-medical"></i> Examination Submitted';
            statusEl.style.background = '#fef3c7';
            statusEl.style.color = '#b45309';
        } else if (currentRequest.status === 'accepted') {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Accepted - In Progress';
            statusEl.style.background = '#d1fae5';
            statusEl.style.color = '#065f46';
        }
    }
}

// ===== DETERMINE WHICH VIEW TO SHOW =====
function determineView() {
    var techView = document.getElementById('techView');
    var customerView = document.getElementById('customerView');
    var historyView = document.getElementById('historyView');
    var acceptedView = document.getElementById('acceptedView');

    console.log('🔍 determineView called, currentRole:', currentRole);

    // ✅ استخدام currentRole مباشرة بدلاً من قراءته مرة أخرى
    var role = currentRole || localStorage.getItem('userRole');
    
    if (!role) {
        console.log('❌ No role found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // ✅ Check if request exists
    if (!currentRequest || !currentRequest.id) {
        console.log('⚠️ No request, creating default');
        currentRequest = {
            id: 'REQ_001',
            category: 'plumbing',
            city: 'Cairo',
            description: 'Kitchen sink leaking from pipe under counter...',
            customerEmail: localStorage.getItem('userEmail') || 'customer@fixora.com',
            status: 'selected',
            examinations: demoPrevExams,
            selectedTechnician: 'Faisal Al-Harbi'
        };
        localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    }

    console.log('📌 Current Request Status:', currentRequest.status);

    // ✅ Check if request is already accepted
    if (currentRequest.status === 'accepted') {
        console.log('✅ Request is accepted, showing accepted view');
        if (techView) techView.style.display = 'none';
        if (customerView) customerView.style.display = 'none';
        if (historyView) historyView.style.display = 'none';
        if (acceptedView) acceptedView.style.display = 'block';
        return;
    }

    // ✅ Check for previous examinations
    var prevExams = getPreviousExaminations();
    console.log('📌 Previous Examinations:', prevExams);

    if (role === 'provider') {
        console.log('👷 Provider view');
        if (prevExams && prevExams.length > 0) {
            if (techView) techView.style.display = 'none';
            if (customerView) customerView.style.display = 'none';
            if (historyView) historyView.style.display = 'block';
            if (acceptedView) acceptedView.style.display = 'none';
            loadHistoryView(prevExams);
        } else {
            if (techView) techView.style.display = 'block';
            if (customerView) customerView.style.display = 'none';
            if (historyView) historyView.style.display = 'none';
            if (acceptedView) acceptedView.style.display = 'none';
        }
    } else if (role === 'customer') {
        console.log('👤 Customer view');
        var latestExam = getLatestExamination();
        console.log('📌 Latest Examination:', latestExam);
        
        if (latestExam) {
            console.log('✅ Showing examination report');
            if (techView) techView.style.display = 'none';
            if (customerView) customerView.style.display = 'block';
            if (historyView) historyView.style.display = 'none';
            if (acceptedView) acceptedView.style.display = 'none';
            loadCustomerView(latestExam);
        } else {
            console.log('ℹ️ No examination found, showing awaiting message');
            if (techView) techView.style.display = 'none';
            if (customerView) customerView.style.display = 'none';
            if (historyView) historyView.style.display = 'none';
            if (acceptedView) acceptedView.style.display = 'none';
            
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
                    <p style="color:var(--text-secondary);">The technician is on their way to inspect the problem. Check back soon.</p>
                    <a href="customer-dashboard.html" class="btn-step btn-next" style="text-decoration:none;margin-top:20px;display:inline-block;padding:12px 32px;background:var(--gradient-primary);color:white;border-radius:14px;font-weight:700;">
                        <i class="fas fa-gauge-high"></i> Dashboard
                    </a>
                `;
                container.appendChild(emptyDiv);
            }
        }
    } else {
        console.log('❌ Unknown role:', role, 'redirecting to login');
        window.location.href = 'login.html';
    }
}

// ===== GET PREVIOUS EXAMINATIONS =====
function getPreviousExaminations() {
    if (!currentRequest) return demoPrevExams || [];
    return currentRequest.examinations || demoPrevExams || [];
}

function getLatestExamination() {
    var exams = getPreviousExaminations();
    return exams.length > 0 ? exams[exams.length - 1] : null;
}

// ===== LOAD HISTORY VIEW (for new technicians) =====
function loadHistoryView(exams) {
    var prevExams = document.getElementById('prevExams');
    var prevList = document.getElementById('prevList');
    var prevCount = document.getElementById('prevCount');
    var historyList = document.getElementById('historyList');

    if (prevExams) {
        prevExams.style.display = 'block';
        if (prevCount) prevCount.textContent = exams.length + ' previous report(s)';
        if (prevList) {
            prevList.innerHTML = exams.map(function(e) {
                return `
                    <div class="prev-item" onclick="viewPrevExam('${e.id}')">
                        <div class="prev-item-header">
                            <h4><i class="fas fa-user"></i> ${e.techName}</h4>
                            <span class="prev-date">${e.date}</span>
                        </div>
                        <p>${e.diagnosis.substring(0, 100)}...</p>
                        <span class="prev-price">${e.price} EGP</span>
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
                        <h4><i class="fas fa-user"></i> ${e.techName}</h4>
                        <span class="history-status ${e.status}">${e.status.toUpperCase()}</span>
                    </div>
                    <div class="report-section">
                        <h4><i class="fas fa-magnifying-glass"></i> Diagnosis</h4>
                        <p>${e.diagnosis}</p>
                    </div>
                    <div class="report-section">
                        <h4><i class="fas fa-lightbulb"></i> Solution</h4>
                        <p>${e.solution}</p>
                    </div>
                    <div class="report-price-box">
                        <div class="price-row total">
                            <span class="label">Initial Price</span>
                            <span class="value">${e.price} EGP</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function viewPrevExam(examId) {
    var exams = getPreviousExaminations();
    var exam = exams.find(function(e) { return e.id === examId; });
    if (!exam) return;
    alert('Previous Examination by ' + exam.techName + '\n\nDiagnosis: ' + exam.diagnosis + '\n\nPrice: ' + exam.price + ' EGP');
}

function showTechView() {
    var historyView = document.getElementById('historyView');
    var techView = document.getElementById('techView');
    if (historyView) historyView.style.display = 'none';
    if (techView) techView.style.display = 'block';
}

// ===== LOAD CUSTOMER VIEW =====
function loadCustomerView(exam) {
    console.log('📋 Loading customer view with exam:', exam);
    currentExamination = exam;

    // Tech info
    var techNameEl = document.getElementById('reportTechName');
    if (techNameEl) techNameEl.textContent = exam.techName || 'Technician';
    
    var ratingEl = document.getElementById('reportTechRating');
    if (ratingEl) ratingEl.textContent = '★★★★★ ' + (exam.techRating || '4.9');
    
    var expEl = document.getElementById('reportTechExp');
    if (expEl) expEl.textContent = exam.techExp || '10 years exp';
    
    var dateEl = document.getElementById('reportDate');
    if (dateEl) dateEl.innerHTML = '<i class="fas fa-calendar"></i> ' + (exam.date || 'Today');

    // Report content
    var diagnosisEl = document.getElementById('reportDiagnosis');
    if (diagnosisEl) diagnosisEl.textContent = exam.diagnosis || '--';
    
    var solutionEl = document.getElementById('reportSolution');
    if (solutionEl) solutionEl.textContent = exam.solution || '--';
    
    var materialsEl = document.getElementById('reportMaterials');
    if (materialsEl) materialsEl.textContent = exam.materials || 'No materials specified';
    
    var estTimeEl = document.getElementById('reportEstTime');
    if (estTimeEl) estTimeEl.textContent = exam.estTime || '--';
    
    var priceEl = document.getElementById('reportPrice');
    if (priceEl) priceEl.textContent = (exam.price || '--') + ' EGP';

    // Photos
    var photosContainer = document.getElementById('reportPhotos');
    if (photosContainer) {
        if (exam.photos && exam.photos.length > 0) {
            photosContainer.innerHTML = exam.photos.map(function(p) {
                return '<img src="' + p + '" alt="Inspection photo" />';
            }).join('');
        } else {
            photosContainer.innerHTML = '<p style="color:var(--text-light);">No photos provided</p>';
        }
    }

    // If already decided, hide decision buttons
    var decisionBox = document.getElementById('decisionBox');
    if (decisionBox) {
        if (exam.status === 'accepted' || exam.status === 'rejected') {
            decisionBox.style.display = 'none';
            if (exam.status === 'rejected') {
                showRejectionNote();
            }
        }
    }
}

function showRejectionNote() {
    var note = document.getElementById('rejectionNote');
    if (note) note.style.display = 'flex';
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

// Drag and drop
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
function submitExamination() {
    var diagnosis = document.getElementById('diagnosis');
    var solution = document.getElementById('solution');
    var price = document.getElementById('initialPrice');
    var estTime = document.getElementById('estTime');
    var materials = document.getElementById('materials');

    if (!diagnosis || !solution || !price) {
        alert('⚠️ Please fill in all required fields');
        return;
    }

    var examination = {
        id: 'EXAM_' + Date.now(),
        techId: localStorage.getItem('userEmail') || 'TECH_001',
        techName: localStorage.getItem('userName') || 'Technician',
        techRating: '4.8',
        techExp: '5 years',
        diagnosis: diagnosis.value.trim(),
        solution: solution.value.trim(),
        materials: materials ? materials.value.trim() || 'No materials specified' : 'No materials specified',
        price: parseFloat(price.value),
        estTime: estTime ? estTime.value || 'Not specified' : 'Not specified',
        photos: examPhotos,
        status: 'pending',
        date: 'Just now'
    };

    if (!currentRequest.examinations) currentRequest.examinations = [];
    currentRequest.examinations.push(examination);
    currentRequest.status = 'examined';

    localStorage.setItem('currentRequest', JSON.stringify(currentRequest));

    var requests = JSON.parse(localStorage.getItem('fixoraRequests') || '[]');
    var idx = requests.findIndex(function(r) { return r.id === currentRequest.id; });
    if (idx > -1) requests[idx] = currentRequest;
    localStorage.setItem('fixoraRequests', JSON.stringify(requests));

    alert('✅ Examination report submitted! The customer will review it shortly.');
    window.location.href = 'provider-dashboard.html';
}

// ==========================================
// CUSTOMER DECISIONS
// ==========================================

// ===== ACCEPT EXAMINATION =====
function acceptExamination() {
    if (!currentExamination) return;

    currentExamination.status = 'accepted';
    currentRequest.status = 'accepted';
    currentRequest.acceptedExamination = currentExamination;

    localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    localStorage.setItem('currentExecution', JSON.stringify({
        id: currentRequest.id,
        category: currentRequest.category,
        status: 'pending',
        examination: {
            diagnosis: currentExamination.diagnosis,
            solution: currentExamination.solution,
            materials: currentExamination.materials,
            examFee: currentExamination.price || 100,
            repairCost: currentExamination.repairCost || 500
        },
        technician: {
            name: currentExamination.techName || 'Technician',
            phone: '+966 50 123 4567',
            rating: currentExamination.techRating || '4.9',
            experience: currentExamination.techExp || '5 years'
        }
    }));

    var requests = JSON.parse(localStorage.getItem('fixoraRequests') || '[]');
    var idx = requests.findIndex(function(r) { return r.id === currentRequest.id; });
    if (idx > -1) requests[idx] = currentRequest;
    localStorage.setItem('fixoraRequests', JSON.stringify(requests));

    alert('✅ Examination accepted! Redirecting to service execution...');
    window.location.href = 'execution.html';
}

// ===== REJECT EXAMINATION =====
function rejectExamination() {
    if (!currentExamination) return;

    currentExamination.status = 'rejected';
    currentRequest.status = 'open';

    localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    var requests = JSON.parse(localStorage.getItem('fixoraRequests') || '[]');
    var idx = requests.findIndex(function(r) { return r.id === currentRequest.id; });
    if (idx > -1) requests[idx] = currentRequest;
    localStorage.setItem('fixoraRequests', JSON.stringify(requests));

    var decisionBox = document.getElementById('decisionBox');
    if (decisionBox) decisionBox.style.display = 'none';
    showRejectionNote();

    alert('❌ Examination rejected. The request remains open for other technicians.');
}

// ===== TECH CHAT =====
function sendTechChatMessage() {
    var input = document.getElementById('techChatInput');
    var messages = document.getElementById('techChatMessages');
    if (!input || !messages) return;
    
    var text = input.value.trim();
    if (!text) return;

    var msg = document.createElement('div');
    msg.className = 'chat-message sent';
    msg.innerHTML = text + '<span class="msg-time">' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</span>';
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';

    setTimeout(function() {
        var reply = document.createElement('div');
        reply.className = 'chat-message received';
        reply.innerHTML = 'I checked the previous report. The crack was near the joint, so make sure to inspect that area carefully.<span class="msg-time">' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</span>';
        messages.appendChild(reply);
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// Enter key to send
document.addEventListener('DOMContentLoaded', function() {
    var chatInput = document.getElementById('techChatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendTechChatMessage();
        });
    }
});

// ===== LOGOUT =====
function handleLogout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
    localStorage.removeItem('currentRequest');
    window.location.href = 'index.html';
}