// ==========================================
// SUBSCRIPTION.JS - Subscription Logic
// ==========================================

var selectedPlan = null;
var currentUserPlan = 'free';
var currentUser = null;

// ===== DEMO DATA =====
var plansData = {
    free: {
        name: 'Free',
        price: 0,
        features: ['View service requests', 'Basic profile', '1 active request at a time']
    },
    pro: {
        name: 'Pro',
        price: 50,
        features: ['View service requests', 'Professional profile', 'Unlimited active requests', 'Accept service requests', 'Priority support']
    },
    premium: {
        name: 'Premium',
        price: 100,
        features: ['View service requests', 'Premium profile with badge', 'Unlimited active requests', 'Accept service requests', 'Priority support', 'Featured listing']
    }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    currentUser = {
        id: localStorage.getItem('userEmail') || 'provider@fixora.com',
        name: localStorage.getItem('userName') || 'Provider',
        role: localStorage.getItem('userRole') || 'provider'
    };

    // Check if user is provider
    if (currentUser.role !== 'provider') {
        window.location.href = 'login.html';
        return;
    }

    // ✅ Check verification status first
    const verified = localStorage.getItem('providerVerified');
    if (verified !== 'approved') {
        alert('⚠️ You must complete verification before subscribing.\n\nPlease complete your profile verification first.');
        window.location.href = 'provider-verification.html';
        return;
    }

    loadSubscriptionStatus();
    updateUI();
    updateFooterDate();
});

function loadSubscriptionStatus() {
    var saved = localStorage.getItem('fixoraSubscription');
    if (saved) {
        try {
            var data = JSON.parse(saved);
            currentUserPlan = data.plan || 'free';
        } catch(e) {
            currentUserPlan = 'free';
        }
    } else {
        currentUserPlan = 'free';
    }
}

function saveSubscriptionStatus(plan) {
    var data = {
        plan: plan,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem('fixoraSubscription', JSON.stringify(data));
    currentUserPlan = plan;
}

function updateUI() {
    // Update current status
    var planName = plansData[currentUserPlan].name;
    var planPrice = plansData[currentUserPlan].price;
    
    document.getElementById('currentPlan').textContent = planName + (planPrice > 0 ? ' (' + planPrice + ' EGP/month)' : '');
    document.getElementById('currentStatusText').textContent = planPrice === 0 ? 
        'You are currently on the Free plan. Upgrade to unlock more features.' :
        'You are on the ' + planName + ' plan. Enjoy all the premium features!';
    
    var badge = document.getElementById('statusBadge');
    if (planPrice === 0) {
        badge.textContent = 'Free';
        badge.className = 'status-badge inactive';
    } else {
        badge.textContent = 'Active';
        badge.className = 'status-badge';
    }

    // Update expiry
    var saved = localStorage.getItem('fixoraSubscription');
    if (saved) {
        try {
            var data = JSON.parse(saved);
            if (data.expiresAt) {
                var expiry = new Date(data.expiresAt);
                document.getElementById('expiryDate').textContent = 'Expires: ' + expiry.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                });
            }
        } catch(e) {}
    }

    // Update plan cards
    document.querySelectorAll('.plan-card').forEach(function(card) {
        var plan = card.dataset.plan;
        var btn = card.querySelector('.btn-plan');
        
        if (plan === currentUserPlan) {
            btn.textContent = 'Current Plan';
            btn.disabled = true;
            btn.className = 'btn-plan current';
        } else {
            var planData = plansData[plan];
            btn.textContent = 'Upgrade to ' + planData.name;
            btn.disabled = false;
            btn.className = 'btn-plan';
            btn.onclick = function() { selectPlan(plan); };
        }
    });

    // Update provider status
    updateProviderStatus();
}

function updateProviderStatus() {
    var isSubscribed = currentUserPlan !== 'free';
    localStorage.setItem('providerActive', isSubscribed ? 'true' : 'false');
}

function selectPlan(plan) {
    if (plan === currentUserPlan) {
        alert('You are already on the ' + plansData[plan].name + ' plan.');
        return;
    }

    selectedPlan = plan;
    var planData = plansData[plan];
    
    document.getElementById('paymentPlan').textContent = planData.name;
    document.getElementById('paymentPrice').textContent = planData.price + ' EGP';
    document.getElementById('paymentTotal').textContent = planData.price + ' EGP';
    
    document.getElementById('paymentModal').classList.add('show');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
    document.getElementById('cardNumber').value = '';
    document.getElementById('cardExpiry').value = '';
    document.getElementById('cardCvv').value = '';
    document.getElementById('cardName').value = '';
}

function formatCardNumber(input) {
    var value = input.value.replace(/\D/g, '');
    var formatted = '';
    for (var i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    input.value = formatted;
}

function formatCardExpiry(input) {
    var value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        var month = parseInt(value.substring(0, 2));
        if (month > 12) {
            input.value = '12' + (value.length > 2 ? '/' + value.substring(2, 4) : '');
            return;
        }
        input.value = value.substring(0, 2) + (value.length > 2 ? '/' + value.substring(2, 4) : '');
    } else {
        input.value = value;
    }
}

function processPayment() {
    var cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    var cardExpiry = document.getElementById('cardExpiry').value;
    var cardCvv = document.getElementById('cardCvv').value;
    var cardName = document.getElementById('cardName').value.trim();

    if (cardNumber.length < 16) {
        alert('⚠️ Please enter a valid card number (16 digits).');
        return;
    }

    if (cardExpiry.length < 5) {
        alert('⚠️ Please enter a valid expiry date (MM/YY).');
        return;
    }

    if (cardCvv.length < 3) {
        alert('⚠️ Please enter a valid CVV (3-4 digits).');
        return;
    }

    if (!cardName) {
        alert('⚠️ Please enter the cardholder name.');
        return;
    }

    var btn = document.querySelector('.btn-pay');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(function() {
        btn.textContent = '✅ Payment Successful!';
        
        saveSubscriptionStatus(selectedPlan);
        
        setTimeout(function() {
            closePaymentModal();
            btn.textContent = 'Pay Now';
            btn.disabled = false;
            updateUI();
            showSuccess(selectedPlan);
        }, 1000);
    }, 2000);
}

function showSuccess(plan) {
    document.querySelector('.plans-grid').style.display = 'none';
    document.querySelector('.comparison-section').style.display = 'none';
    document.getElementById('currentStatus').style.display = 'none';
    document.getElementById('subscriptionSuccess').style.display = 'block';
    document.getElementById('successPlan').textContent = plansData[plan].name;
    localStorage.setItem('providerActive', 'true');
}

// ===== LOGOUT =====
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
window.selectPlan = selectPlan;
window.closePaymentModal = closePaymentModal;
window.formatCardNumber = formatCardNumber;
window.formatCardExpiry = formatCardExpiry;
window.processPayment = processPayment;
window.handleLogout = handleLogout;