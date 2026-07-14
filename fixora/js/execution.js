// ==========================================
// EXECUTION.JS - Service Execution Logic
// ==========================================

var executionTimer = null;
var seconds = 0;
var currentRole = null;
var currentRequest = null;
var currentExamination = null;
var currentExecutionRecord = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
    currentRole = localStorage.getItem('userRole');
    if (!currentRole) {
        window.location.href = 'login.html';
        return;
    }

    await loadExecutionData();
    updateFooterDate();
    startSimulatedTracking();
});

async function loadExecutionData() {
    var params = new URLSearchParams(window.location.search);
    var reqId = params.get('id');
    if (!reqId) {
        var saved = localStorage.getItem('currentRequest');
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                reqId = parsed.id;
            } catch (e) {}
        }
    }

    if (!reqId) {
        ErrorHandler.showNotification('Error', 'No active service request context found.', 'error');
        return;
    }

    try {
        // Fetch service request detail
        currentRequest = await api.get(`/service-requests/${reqId}`);
        if (!currentRequest) return;

        localStorage.setItem('currentRequest', JSON.stringify(currentRequest));

        // Fetch execution record
        try {
            currentExecutionRecord = await api.get(`/service-requests/${reqId}/execution`, { showLoader: false });
        } catch (e) {
            currentExecutionRecord = null;
        }

        // Fetch examination report
        try {
            currentExamination = await api.get(`/service-requests/${reqId}/examination`, { showLoader: false });
        } catch (e) {
            currentExamination = null;
        }

        // Fetch categories to resolve category name
        const categories = await api.get('/categories', { showLoader: false });
        let categoryName = 'Emergency Repair';
        if (categories) {
            const cat = categories.find(c => c.id === currentRequest.categoryId);
            if (cat) categoryName = cat.name;
        }

        // Fetch provider profile
        let providerName = 'Assigned Provider';
        let providerExp = '5 years experience';
        if (currentRequest.selectedProviderId) {
            try {
                const profile = await api.get(`/profile/${currentRequest.selectedProviderId}`, { showLoader: false });
                if (profile) {
                    providerName = profile.fullName || providerName;
                    const years = profile.providerProfile?.experienceYears || profile.companyProfile?.experienceYears;
                    if (years) providerExp = years + ' years experience';
                }
            } catch (e) {}
        }

        // Bind DOM nodes
        document.getElementById('orderId').textContent = `#ID-${currentRequest.id.substring(0, 8).toUpperCase()}`;
        document.getElementById('orderCategory').textContent = categoryName;

        // Parse examination details
        var diagnosis = 'Diagnosis report not submitted yet.';
        var solution = 'Awaiting technician inspection report.';
        var materials = 'N/A';
        var price = 0;

        if (currentExamination) {
            var rawReport = currentExamination.report || '';
            diagnosis = rawReport;
            solution = 'Refer to details';
            price = currentExamination.estimatedPrice;

            if (rawReport.includes('DIAGNOSIS:')) {
                const parts = rawReport.split('\n');
                parts.forEach(p => {
                    if (p.startsWith('DIAGNOSIS:')) diagnosis = p.replace('DIAGNOSIS:', '').trim();
                    if (p.startsWith('SOLUTION:')) solution = p.replace('SOLUTION:', '').trim();
                    if (p.startsWith('MATERIALS:')) materials = p.replace('MATERIALS:', '').trim();
                });
            }
        }

        document.getElementById('reportDiagnosis').textContent = diagnosis;
        document.getElementById('reportSolution').textContent = solution;
        document.getElementById('reportMaterials').textContent = materials;
        document.getElementById('examFee').innerHTML = '100 EGP <span style="font-size: 0.75rem; color: #48bb78;">(Paid)</span>';
        document.getElementById('repairCost').innerHTML = price + ' EGP <span style="font-size: 0.75rem; color: #f6ad55;">(Pending)</span>';

        document.getElementById('techName').textContent = providerName;
        document.getElementById('techExp').textContent = providerExp;

        updateStatusUI();
    } catch (err) {
        console.error('Failed to load execution data:', err);
    }
}

function updateStatusUI() {
    var statusEl = document.getElementById('orderStatus');
    var actionBtns = document.getElementById('actionButtons');
    var timerDisplay = document.getElementById('timerDisplay');
    var completedState = document.getElementById('completedState');
    var rejectionNote = document.getElementById('rejectionNote');
    var reopenSection = document.getElementById('reopenSection');
    var completeSection = document.getElementById('completeSection');

    // Reset status badges
    statusEl.className = 'status-badge';

    // Map backend status enums to UI statuses
    var status = currentRequest.status;

    if (status === 'WaitingCustomerApproval') {
        statusEl.innerHTML = '<i class="fas fa-clock"></i> Pending Approval';
        statusEl.classList.add('pending');
        completedState.style.display = 'none';
        rejectionNote.style.display = 'none';
        reopenSection.style.display = 'none';
        completeSection.style.display = 'none';
        timerDisplay.style.display = 'none';

        if (currentRole === 'customer') {
            actionBtns.style.display = 'grid';
        } else {
            actionBtns.style.display = 'block';
            actionBtns.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 10px;"><i class="fas fa-spinner fa-spin"></i> Awaiting customer approval of your report.</div>`;
        }
    } 
    else if (status === 'InProgress') {
        statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> In Progress';
        statusEl.classList.add('in-progress');
        actionBtns.style.display = 'none';
        timerDisplay.style.display = 'block';
        completedState.style.display = 'none';
        rejectionNote.style.display = 'none';
        reopenSection.style.display = 'none';

        if (currentRole === 'provider' || currentRole === 'company') {
            completeSection.style.display = 'block';
            completeSection.innerHTML = `
                <button class="btn-action btn-accept btn-full" onclick="completeExecutionWork()" style="background: linear-gradient(135deg, #48bb78, #38a169);">
                    <i class="fas fa-check-circle"></i> Complete Service Execution
                </button>
            `;
        } else {
            completeSection.style.display = 'none';
        }

        // Start timer counts based on startedAt timestamp if available
        if (currentExecutionRecord && currentExecutionRecord.startedAt) {
            var diffMs = new Date() - new Date(currentExecutionRecord.startedAt);
            seconds = Math.max(0, Math.floor(diffMs / 1000));
        }
        startTimer();
    } 
    else if (status === 'Completed') {
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
        statusEl.classList.add('completed');
        actionBtns.style.display = 'none';
        timerDisplay.style.display = 'none';
        completedState.style.display = 'block';
        rejectionNote.style.display = 'none';
        reopenSection.style.display = 'none';
        completeSection.style.display = 'none';
        stopTimer();
    } 
    else if (status === 'ProviderSelected' || (currentExamination && currentExamination.isApproved)) {
        statusEl.innerHTML = '<i class="fas fa-user-check"></i> Approved - Awaiting Execution';
        statusEl.classList.add('in-progress');
        completedState.style.display = 'none';
        rejectionNote.style.display = 'none';
        reopenSection.style.display = 'none';
        completeSection.style.display = 'none';
        timerDisplay.style.display = 'none';

        if (currentRole === 'provider' || currentRole === 'company') {
            actionBtns.style.display = 'block';
            actionBtns.innerHTML = `
                <button class="btn-action btn-accept btn-full" onclick="startExecutionWork()">
                    <i class="fas fa-play"></i> Start Repair Work
                </button>
            `;
        } else {
            actionBtns.style.display = 'block';
            actionBtns.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 10px;"><i class="fas fa-circle-play"></i> Awaiting technician to start repair.</div>`;
        }
    }
    else {
        // Fallback for draft/open/cancelled
        statusEl.innerHTML = `<i class="fas fa-info-circle"></i> Status: ${status}`;
        statusEl.style.background = 'var(--bg-primary)';
        statusEl.style.color = 'var(--text-primary)';
        actionBtns.style.display = 'none';
        timerDisplay.style.display = 'none';
        completedState.style.display = 'none';
        rejectionNote.style.display = 'none';
        reopenSection.style.display = 'none';
        completeSection.style.display = 'none';
    }
}

// ===== TIMER =====
function startTimer() {
    if (executionTimer) return;
    executionTimer = setInterval(function() {
        seconds++;
        var hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        var minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        var secs = String(seconds % 60).padStart(2, '0');
        document.getElementById('executionTimer').textContent = hours + ':' + minutes + ':' + secs;
    }, 1000);
}

function stopTimer() {
    if (executionTimer) {
        clearInterval(executionTimer);
        executionTimer = null;
    }
}

// ===== ACTIONS (CUSTOMER DECISIONS) =====
async function acceptRepair() {
    if (!currentExamination) return;

    if (confirm('✅ Are you sure you want to approve the repair cost? The technician will start repair immediately.')) {
        try {
            await api.put(`/examinations/${currentExamination.id}/approve`, { isApproved: true });
            ErrorHandler.showNotification('Success', 'Examination approved! Awaiting technician to start repair.', 'success');
            setTimeout(() => { location.reload(); }, 1500);
        } catch (err) {
            console.error('Failed to approve examination:', err);
        }
    }
}

async function rejectRepair() {
    if (!currentExamination) return;

    if (confirm('❌ Are you sure you want to reject the repair cost? You will pay only the examination fee.')) {
        try {
            await api.put(`/examinations/${currentExamination.id}/approve`, { isApproved: false });
            ErrorHandler.showNotification('Notification', 'Examination rejected. The request is returned to bidding.', 'success');
            
            // Show rejection views
            document.getElementById('orderStatus').innerHTML = '<i class="fas fa-xmark-circle"></i> Rejected';
            document.getElementById('orderStatus').className = 'status-badge rejected';
            document.getElementById('actionButtons').style.display = 'none';
            document.getElementById('rejectionNote').style.display = 'flex';
            document.getElementById('reopenSection').style.display = 'block';
        } catch (err) {
            console.error('Failed to reject examination:', err);
        }
    }
}

async function reopenRequest() {
    if (!currentRequest) return;
    if (confirm('🔄 A new technician will review the previous examination and submit a new report. Continue?')) {
        try {
            await api.post(`/service-requests/${currentRequest.id}/reopen`);
            ErrorHandler.showNotification('Success', 'Request reopened. New technicians can now submit offers.', 'success');
            
            setTimeout(() => {
                window.location.href = 'select-technician.html';
            }, 1500);
        } catch (err) {
            console.error('Failed to reopen request:', err);
        }
    }
}

// ===== START/COMPLETE SERVICE =====
async function startExecutionWork() {
    if (!currentRequest) return;
    try {
        await api.post('/service-executions/start', { serviceRequestId: currentRequest.id });
        ErrorHandler.showNotification('Success', 'Service execution started!', 'success');
        setTimeout(() => { location.reload(); }, 1500);
    } catch (err) {
        console.error('Failed to start execution:', err);
    }
}

async function completeExecutionWork() {
    if (!currentExecutionRecord || !currentExecutionRecord.id) return;
    try {
        await api.post('/service-executions/complete', { serviceExecutionId: currentExecutionRecord.id });
        ErrorHandler.showNotification('Success', 'Service marked as completed successfully!', 'success');
        
        // Save order details for rating page
        var orderDetails = {
            id: currentRequest.id,
            service: document.getElementById('orderCategory').textContent,
            status: 'completed',
            date: new Date().toLocaleDateString(),
            technician: {
                name: document.getElementById('techName').textContent,
                phone: '+966 50 123 4567'
            },
            price: currentExamination ? currentExamination.estimatedPrice : 500
        };
        localStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));

        setTimeout(() => {
            if (currentRole === 'customer') {
                window.location.href = 'rating.html';
            } else {
                window.location.href = 'provider-dashboard.html';
            }
        }, 1500);
    } catch (err) {
        console.error('Failed to complete execution:', err);
    }
}

// ===== CHAT & CALL =====
async function openChat() {
    if (!currentRequest) {
        alert("No active request found.");
        return;
    }
    try {
        const participantIds = [currentRequest.customerId];
        if (currentRequest.selectedProviderId) {
            participantIds.push(currentRequest.selectedProviderId);
        }
        
        const chatRoom = await api.post('chats', {
            serviceRequestId: currentRequest.id,
            chatType: 1, // CustomerProvider = 1
            participantUserIds: participantIds
        });

        localStorage.setItem('activeChatId', chatRoom.id);
        window.location.href = 'chat.html';
    } catch (e) {
        console.error("Failed to create/open chat room:", e);
        alert("Failed to open chat room. Please try again.");
    }
}

function callTechnician() {
    var techName = document.getElementById('techName').textContent;
    alert('📞 Calling ' + techName + '\nPhone: +966 50 123 4567');
}

// ===== SIMULATED TRACKING =====
function startSimulatedTracking() {
    var locationEl = document.getElementById('techLocation');
    var etaEl = document.getElementById('techEta');
    var count = 0;

    setInterval(function() {
        count++;
        var distances = ['📍 En route to your location', '📍 3.2 km away', '📍 1.5 km away', '📍 0.8 km away', '📍 Near your location'];
        var etas = ['⏱️ Estimated arrival: 12 minutes', '⏱️ Estimated arrival: 8 minutes', '⏱️ Estimated arrival: 4 minutes', '⏱️ Estimated arrival: 2 minutes', '⏱️ Arriving soon!'];

        if (currentRequest && (currentRequest.status === 'InProgress' || currentRequest.status === 'ProviderSelected')) {
            var idx = Math.min(count % distances.length, distances.length - 1);
            if (locationEl) locationEl.textContent = distances[idx];
            if (etaEl) etaEl.textContent = etas[idx];
        } else if (currentRequest && currentRequest.status === 'Completed') {
            if (locationEl) locationEl.textContent = '📍 Arrived & Job Completed';
            if (etaEl) etaEl.textContent = '⏱️ Completed';
        } else {
            if (locationEl) locationEl.textContent = '📍 Pending Assignment';
            if (etaEl) etaEl.textContent = '⏱️ Awaiting Start';
        }
    }, 5000);
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    Auth.logout();
}

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.acceptRepair = acceptRepair;
window.rejectRepair = rejectRepair;
window.reopenRequest = reopenRequest;
window.openChat = openChat;
window.callTechnician = callTechnician;
window.handleLogout = handleLogout;
window.startExecutionWork = startExecutionWork;
window.completeExecutionWork = completeExecutionWork;

// ===== REAL-TIME STATUS AUTO-UPDATE =====
document.addEventListener('realtimeNotification', function(e) {
    const notification = e.detail;
    console.log("Execution page caught real-time notification:", notification);
    
    if (currentRequest) {
        const refIdStr = notification.referenceId ? notification.referenceId.toString().toLowerCase() : '';
        const reqIdStr = currentRequest.id.toString().toLowerCase();
        
        if (refIdStr === reqIdStr || (notification.body && notification.body.includes(currentRequest.id.substring(0, 8)))) {
            console.log("Reloading execution page data in real-time...");
            loadExecutionData();
        }
    }
});