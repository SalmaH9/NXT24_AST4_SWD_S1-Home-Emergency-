// ==========================================
// EXECUTION.JS - Service Execution Logic
// ==========================================

var executionTimer = null;
var seconds = 0;
var isExecuting = false;

// ===== DEMO DATA =====
var currentExecution = {
    id: 'REQ-001',
    category: 'Plumbing',
    status: 'pending', // pending | in-progress | completed | rejected
    examination: {
        diagnosis: 'The PVC pipe under the kitchen sink has a 2cm crack due to corrosion. The rubber gasket is completely worn out.',
        solution: 'Replace the cracked PVC pipe section (approximately 30cm) with new piping. Install new rubber gasket and apply pipe sealant.',
        materials: 'PVC pipe 1/2 inch (30cm), Rubber gasket, Pipe sealant, Teflon tape',
        examFee: 100,
        repairCost: 500
    },
    technician: {
        name: 'Ahmed Al-Rashid',
        rating: 4.9,
        reviews: 128,
        experience: '8 years',
        phone: '+966 50 123 4567'
    },
    location: {
        lat: 30.0444,
        lng: 31.2357,
        address: '123 Main Street, Al-Malaz, Riyadh'
    }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadExecutionData();
    updateFooterDate();
    startSimulatedTracking();
});

function loadExecutionData() {
    // Load from localStorage if exists
    var saved = localStorage.getItem('currentExecution');
    if (saved) {
        currentExecution = JSON.parse(saved);
    }

    document.getElementById('orderId').textContent = currentExecution.id;
    document.getElementById('orderCategory').textContent = currentExecution.category;
    document.getElementById('reportDiagnosis').textContent = currentExecution.examination.diagnosis;
    document.getElementById('reportSolution').textContent = currentExecution.examination.solution;
    document.getElementById('reportMaterials').textContent = currentExecution.examination.materials;
    document.getElementById('examFee').innerHTML = currentExecution.examination.examFee + ' EGP <span style="font-size: 0.75rem; color: #48bb78;">(Paid)</span>';
    document.getElementById('repairCost').innerHTML = currentExecution.examination.repairCost + ' EGP <span style="font-size: 0.75rem; color: #f6ad55;">(Pending)</span>';

    document.getElementById('techName').textContent = currentExecution.technician.name;
    document.getElementById('techExp').textContent = currentExecution.technician.experience;

    updateStatus(currentExecution.status);
}

function updateStatus(status) {
    var statusEl = document.getElementById('orderStatus');
    var actionBtns = document.getElementById('actionButtons');
    var timerDisplay = document.getElementById('timerDisplay');
    var completedState = document.getElementById('completedState');
    var rejectionNote = document.getElementById('rejectionNote');
    var reopenSection = document.getElementById('reopenSection');
    var completeSection = document.getElementById('completeSection');

    // Reset all
    statusEl.className = 'status-badge';

    switch(status) {
        case 'pending':
            statusEl.innerHTML = '<i class="fas fa-clock"></i> Pending Approval';
            statusEl.classList.add('pending');
            actionBtns.style.display = 'grid';
            timerDisplay.style.display = 'none';
            completedState.style.display = 'none';
            rejectionNote.style.display = 'none';
            reopenSection.style.display = 'none';
            if (completeSection) completeSection.style.display = 'none';
            break;

        case 'in-progress':
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> In Progress';
            statusEl.classList.add('in-progress');
            actionBtns.style.display = 'none';
            timerDisplay.style.display = 'block';
            completedState.style.display = 'none';
            rejectionNote.style.display = 'none';
            reopenSection.style.display = 'none';
            if (completeSection) completeSection.style.display = 'block';
            startTimer();
            break;

        case 'completed':
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
            statusEl.classList.add('completed');
            actionBtns.style.display = 'none';
            timerDisplay.style.display = 'none';
            completedState.style.display = 'block';
            rejectionNote.style.display = 'none';
            reopenSection.style.display = 'none';
            if (completeSection) completeSection.style.display = 'none';
            stopTimer();
            break;

        case 'rejected':
            statusEl.innerHTML = '<i class="fas fa-xmark-circle"></i> Rejected';
            statusEl.classList.add('rejected');
            actionBtns.style.display = 'none';
            timerDisplay.style.display = 'none';
            completedState.style.display = 'none';
            rejectionNote.style.display = 'flex';
            reopenSection.style.display = 'block';
            if (completeSection) completeSection.style.display = 'none';
            stopTimer();
            break;
    }
}

// ===== TIMER =====
function startTimer() {
    if (executionTimer) return;
    seconds = 0;
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

// ===== ACTIONS =====
function acceptRepair() {
    if (confirm('✅ Are you sure you want to accept the repair cost of ' + currentExecution.examination.repairCost + ' EGP? The technician will start the repair immediately.')) {
        currentExecution.status = 'in-progress';
        localStorage.setItem('currentExecution', JSON.stringify(currentExecution));
        updateStatus('in-progress');
        alert('🔧 Repair started! The technician is now working on your service.');
    }
}

function rejectRepair() {
    if (confirm('❌ Are you sure you want to reject the repair cost? You will pay only the examination fee (' + currentExecution.examination.examFee + ' EGP).')) {
        currentExecution.status = 'rejected';
        localStorage.setItem('currentExecution', JSON.stringify(currentExecution));
        updateStatus('rejected');
        alert('⚠️ You have rejected the repair. You will pay only the examination fee.');
    }
}

function reopenRequest() {
    if (confirm('🔄 A new technician will review the previous examination and submit a new report. Continue?')) {
        // Clear current execution
        localStorage.removeItem('currentExecution');
        // Keep the request open
        var request = JSON.parse(localStorage.getItem('currentRequest') || '{}');
        request.status = 'open';
        request.examinations = request.examinations || [];
        localStorage.setItem('currentRequest', JSON.stringify(request));
        
        alert('🔄 Request reopened. New technicians can now submit examinations.');
        window.location.href = 'select-technician.html';
    }
}

// ==========================================
// ✅ COMPLETE SERVICE - Save for Rating
// ==========================================
function completeService() {
    if (!currentExecution) return;

    // Update status
    currentExecution.status = 'completed';
    localStorage.setItem('currentExecution', JSON.stringify(currentExecution));
    updateStatus('completed');

    // Save order details for rating page
    var orderDetails = {
        id: currentExecution.id,
        service: currentExecution.category,
        status: 'completed',
        date: new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        technician: {
            name: currentExecution.technician.name,
            rating: currentExecution.technician.rating || 4.9,
            reviews: currentExecution.technician.reviews || 128,
            phone: currentExecution.technician.phone || '+966 50 123 4567'
        },
        customer: {
            name: localStorage.getItem('userName') || 'Customer'
        },
        price: currentExecution.examination.repairCost || 500
    };

    localStorage.setItem('currentOrderDetails', JSON.stringify(orderDetails));

    // Update orders list
    var orders = JSON.parse(localStorage.getItem('fixoraOrders') || '[]');
    var orderIndex = orders.findIndex(function(o) { return o.id === currentExecution.id; });
    if (orderIndex > -1) {
        orders[orderIndex].status = 'completed';
        orders[orderIndex].technician = currentExecution.technician.name;
        localStorage.setItem('fixoraOrders', JSON.stringify(orders));
    }

    // Update request status
    var requests = JSON.parse(localStorage.getItem('fixoraRequests') || '[]');
    var reqIndex = requests.findIndex(function(r) { return r.id === currentExecution.id; });
    if (reqIndex > -1) {
        requests[reqIndex].status = 'completed';
        localStorage.setItem('fixoraRequests', JSON.stringify(requests));
    }

    alert('✅ Service completed! Please rate your technician.');
    window.location.href = 'rating.html';
}

// ===== CHAT & CALL =====
function openChat() {
    alert('💬 Chat with ' + currentExecution.technician.name + '\n\nThis will open the chat window.');
    // window.location.href = 'chat.html?tech=' + currentExecution.technician.name;
}

function callTechnician() {
    alert('📞 Call ' + currentExecution.technician.name + '\nPhone: ' + currentExecution.technician.phone);
    // window.location.href = 'tel:' + currentExecution.technician.phone;
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

        if (currentExecution.status === 'in-progress' || currentExecution.status === 'pending') {
            var idx = Math.min(count % distances.length, distances.length - 1);
            if (locationEl) locationEl.textContent = distances[idx];
            if (etaEl) etaEl.textContent = etas[idx];
        }
    }, 5000);
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
    window.location.href = '../index.html';
}

// ===== FOOTER =====
function updateFooterDate() {
    var el = document.getElementById('footer-date');
    if (el) {
        el.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
}

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.acceptRepair = acceptRepair;
window.rejectRepair = rejectRepair;
window.reopenRequest = reopenRequest;
window.completeService = completeService;
window.openChat = openChat;
window.callTechnician = callTechnician;
window.handleLogout = handleLogout;