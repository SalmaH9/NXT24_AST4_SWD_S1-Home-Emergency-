// ==========================================
// SUBSCRIPTION.JS - Subscription Logic
// ==========================================

var selectedPlan = null;
var currentUserPlan = 'free';
var currentUser = null;
var backendPlans = {}; // Map planName.toLowerCase() to backend plan object

// ===== DEMO DATA (Fallback for rendering UI attributes if needed) =====
var plansData = {
    free: { name: 'Free', price: 0 },
    pro: { name: 'Pro', price: 50 },
    premium: { name: 'Premium', price: 100 }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
    if (!Auth.checkAuth(['provider', 'company'])) {
        return;
    }

    currentUser = {
        email: TokenManager.getUserEmail(),
        role: TokenManager.getUserRole()
    };

    // Check verification status
    const verified = localStorage.getItem('providerVerified');
    if (verified !== 'approved') {
        ErrorHandler.showNotification('Verification Required', 'You must complete verification before subscribing.', 'warning');
        setTimeout(() => {
            window.location.href = 'provider-verification.html';
        }, 1500);
        return;
    }

    try {
        // 1. Fetch available plans from backend
        const plans = await api.get('/Subscriptions');
        if (plans) {
            plans.forEach(p => {
                // بنطابق اسم الخطة من السيرفر مع data-plan في الكارت.
                // بنشيل أي كلام زيادة زي "Plan" وبنخليها حروف صغيرة.
                // ⚠️ SubscriptionPlanDto فيه "name" مش "planName"
                // (الـ planName موجود في UserSubscriptionDto بس)
                const key = (p.name || '').toLowerCase().replace(/\s*plan\s*$/, '').trim();
                if (!key) return;
                backendPlans[key] = p;
                
                // Dynamically update the price text on cards
                const card = document.querySelector(`.plan-card[data-plan="${key}"]`);
                if (card) {
                    const priceEl = card.querySelector('.price span');
                    if (priceEl) priceEl.textContent = p.price;
                }
            });
        }

        // 2. Fetch current subscription status
        await loadSubscriptionStatus();
        updateUI();
        updateFooterDate();
    } catch (err) {
        console.error('Failed to initialize subscription details:', err);
    }
});

async function loadSubscriptionStatus() {
    try {
        const sub = await api.get('/Subscriptions/my-subscription');
        if (sub && sub.status === 'Active') {
            // UserSubscriptionDto فيه planName (مش name) — ده صح هنا
            currentUserPlan = (sub.planName || '').toLowerCase().replace(/\s*plan\s*$/, '').trim();
            localStorage.setItem('fixoraSubscription', JSON.stringify({
                plan: currentUserPlan,
                activatedAt: sub.startDate,
                expiresAt: sub.endDate
            }));
            localStorage.setItem('providerActive', 'true');
        } else {
            currentUserPlan = 'free';
            localStorage.setItem('providerActive', 'false');
            localStorage.removeItem('fixoraSubscription');
        }
    } catch (err) {
        console.error('Failed to fetch subscription status:', err);
        currentUserPlan = 'free';
        localStorage.setItem('providerActive', 'false');
    }
}

function updateUI() {
    const planObj = backendPlans[currentUserPlan] || { name: 'Free', price: 0 };
    const planName = planObj.name || 'Free';
    const planPrice = planObj.price || 0;
    
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
    } else {
        document.getElementById('expiryDate').textContent = 'N/A';
    }

    // Update plan cards
    document.querySelectorAll('.plan-card').forEach(function(card) {
        var plan = card.dataset.plan;
        var btn = card.querySelector('.btn-plan');
        
        if (plan === currentUserPlan) {
            btn.textContent = 'Current Plan';
            btn.disabled = true;
            btn.className = 'btn-plan current';
            btn.onclick = null;
        } else {
            const planDetails = backendPlans[plan] || { name: plan.toUpperCase() };
            btn.textContent = 'Upgrade to ' + planDetails.name;
            btn.disabled = false;
            btn.className = 'btn-plan';
            btn.onclick = function() { selectPlan(plan); };
        }
    });

    // Update provider status
    updateProviderStatus();
}

// ⚠️ الدالة دي كانت بتعيد حساب providerActive من اسم الكارت في الواجهة.
//    لو اسم الخطة في السيرفر مااتطابقش مع data-plan (مثلًا "Pro Plan" مقابل "pro")،
//    كانت بترجّعها false وتقفل المزوّد تاني بعد ما يدفع.
//    الحل: مصدر الحقيقة هو وجود اشتراك فعّال من السيرفر.
function updateProviderStatus() {
    var isSubscribed = currentUserPlan !== 'free' && !!backendPlans[currentUserPlan];
    // ماننزلش الحالة لـ false لو عندنا اشتراك محفوظ من السيرفر
    if (!isSubscribed && localStorage.getItem('fixoraSubscription')) {
        return;
    }
    localStorage.setItem('providerActive', isSubscribed ? 'true' : 'false');
}

function selectPlan(plan) {
    if (plan === currentUserPlan) {
        alert('You are already on this plan.');
        return;
    }

    selectedPlan = plan;
    const planDetails = backendPlans[plan];
    if (!planDetails) return;
    
    document.getElementById('paymentPlan').textContent = planDetails.name;
    document.getElementById('paymentPrice').textContent = planDetails.price + ' EGP';
    document.getElementById('paymentTotal').textContent = planDetails.price + ' EGP';
    
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

async function processPayment() {
    var cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    var cardExpiry = document.getElementById('cardExpiry').value;
    var cardCvv = document.getElementById('cardCvv').value;
    var cardName = document.getElementById('cardName').value.trim();

    if (cardNumber.length < 16) {
        ErrorHandler.showNotification('Validation Error', 'Please enter a valid card number (16 digits).', 'error');
        return;
    }

    if (cardExpiry.length < 5) {
        ErrorHandler.showNotification('Validation Error', 'Please enter a valid expiry date (MM/YY).', 'error');
        return;
    }

    if (cardCvv.length < 3) {
        ErrorHandler.showNotification('Validation Error', 'Please enter a valid CVV (3 digits).', 'error');
        return;
    }

    if (!cardName) {
        ErrorHandler.showNotification('Validation Error', 'Please enter the cardholder name.', 'error');
        return;
    }

    const planDetails = backendPlans[selectedPlan];
    if (!planDetails) {
        ErrorHandler.showNotification('Error', 'Selected plan is not available on the backend.', 'error');
        return;
    }

    var btn = document.querySelector('.btn-pay');
    btn.textContent = 'Processing Payment...';
    btn.disabled = true;

    try {
        // Execute subscribe API call on backend
        const response = await api.post(`/Subscriptions/${planDetails.id}/subscribe`);
        if (response) {
            btn.textContent = '✅ Payment Successful!';
            
            localStorage.setItem('fixoraSubscription', JSON.stringify({
                plan: selectedPlan,
                activatedAt: response.startDate,
                expiresAt: response.endDate
            }));
            currentUserPlan = selectedPlan;
            localStorage.setItem('providerActive', 'true');
            
            setTimeout(function() {
                closePaymentModal();
                btn.textContent = 'Pay Now';
                btn.disabled = false;
                updateUI();
                showSuccess(selectedPlan);
            }, 1000);
        }
    } catch (err) {
        console.error('Subscription purchase failed:', err);
        btn.textContent = 'Pay Now';
        btn.disabled = false;
    }
}

function showSuccess(plan) {
    const planName = (backendPlans[plan] || { name: plan }).name;
    document.querySelector('.plans-grid').style.display = 'none';
    document.querySelector('.comparison-section').style.display = 'none';
    document.getElementById('currentStatus').style.display = 'none';
    document.getElementById('subscriptionSuccess').style.display = 'block';
    document.getElementById('successPlan').textContent = planName;
    localStorage.setItem('providerActive', 'true');
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    Auth.logout();
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