// ==========================================
// RATING.JS - Rating & Review Logic
// ==========================================

var selectedRating = 0;
var customerRating = 0;
var categoryRatings = {
    quality: 0,
    communication: 0,
    punctuality: 0,
    value: 0
};
var reviewPhotos = [];
var currentOrder = null;
var currentRequest = null;
var currentRole = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
    currentRole = localStorage.getItem('userRole');
    if (!currentRole) {
        window.location.href = 'login.html';
        return;
    }

    // ✅ محاولة جلب الـ orderId من مصادر متعددة
    var orderId = null;
    
    // 1. من localStorage (currentOrderDetails)
    var saved = localStorage.getItem('currentOrderDetails');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            if (parsed && parsed.id) {
                orderId = parsed.id;
                currentOrder = parsed;
            }
        } catch(e) {}
    }
    
    // 2. من URL parameters (لو دخلت من مكان تاني)
    if (!orderId) {
        var params = new URLSearchParams(window.location.search);
        orderId = params.get('id');
    }
    
    // 3. من currentRequest في localStorage
    if (!orderId) {
        var req = localStorage.getItem('currentRequest');
        if (req) {
            try {
                var parsed = JSON.parse(req);
                if (parsed && parsed.id) {
                    orderId = parsed.id;
                }
            } catch(e) {}
        }
    }

    if (!orderId) {
        var orderIdEl = document.getElementById('orderId');
        if (orderIdEl) orderIdEl.textContent = 'No order to rate';
        ErrorHandler.showNotification('Info', 'No completed order found to rate. Complete a service first.', 'warning');
        return;
    }

    await loadOrderData(orderId);
    
    if (typeof updateFooterDate === 'function') {
        updateFooterDate();
    } else {
        var fd = document.getElementById('footer-date');
        if (fd) {
            fd.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        }
    }
    
    checkRole();
});

async function loadOrderData(orderId) {
    try {
        // ✅ جلب البيانات من الـ API مباشرة
        currentRequest = await api.get(`/service-requests/${orderId}`, { showLoader: false, silent: true });
        if (!currentRequest) {
            ErrorHandler.showNotification('Error', 'Order not found.', 'error');
            return;
        }
        
        // Resolve Category Name
        const categories = await api.get('/categories', { showLoader: false, silent: true });
        let categoryName = 'Emergency Repair';
        if (categories) {
            const cat = categories.find(c => c.id === currentRequest.categoryId);
            if (cat) categoryName = cat.name;
        }

        // Resolve Provider Profile and stats
        let providerName = 'Technician';
        let providerRating = '0.0';
        let providerReviews = '0';

        if (currentRequest.selectedProviderId) {
            try {
                const profile = await api.get(`/Profile/${currentRequest.selectedProviderId}`, { showLoader: false, silent: true });
                if (profile) {
                    providerName = profile.fullName || providerName;
                    const pp = profile.providerProfile || profile.companyProfile || {};
                    if (typeof pp.averageRating === 'number') {
                        providerRating = pp.averageRating.toFixed(1);
                    }
                }

                const summary = await api.get(
                    `/users/${currentRequest.selectedProviderId}/rating-summary`,
                    { showLoader: false, silent: true }
                ).catch(() => null);

                if (summary) {
                    if (typeof summary.averageRating === 'number') {
                        providerRating = summary.averageRating.toFixed(1);
                    }
                    providerReviews = summary.totalRatings ?? 0;
                }
            } catch(e) {}
        }

        // ✅ تحديث كل العناصر في الصفحة
        var orderIdEl = document.getElementById('orderId');
        if (orderIdEl) orderIdEl.textContent = `#ID-${currentRequest.id.substring(0, 8).toUpperCase()}`;
        
        var orderServiceEl = document.getElementById('orderService');
        if (orderServiceEl) orderServiceEl.textContent = categoryName;
        
        var orderDateEl = document.getElementById('orderDate');
        if (orderDateEl) orderDateEl.textContent = currentRequest.createdAt ? currentRequest.createdAt.split('T')[0] : 'Today';
        
        var orderTechnicianEl = document.getElementById('orderTechnician');
        if (orderTechnicianEl) orderTechnicianEl.textContent = providerName;
        
        var techNameEl = document.getElementById('techName');
        if (techNameEl) techNameEl.textContent = providerName;
        
        // ✅ اسم العميل الحقيقي بدل "Customer #E8710"
        var customerLabel = 'Customer #' + currentRequest.customerId.substring(0, 5).toUpperCase();
        try {
            var custProfile = await api.get('/Profile/' + currentRequest.customerId,
                                            { showLoader: false, silent: true });
            if (custProfile && custProfile.fullName) {
                customerLabel = custProfile.fullName;
            }
        } catch (e) { /* البروفايل مش متاح */ }
        
        var customerNameEl = document.getElementById('customerName');
        if (customerNameEl) customerNameEl.textContent = customerLabel;

        // Populate reviews statistics on header
        const headerRatingEl = document.querySelector('.tech-details .rating');
        if (headerRatingEl) {
            headerRatingEl.textContent = `★ ${providerRating} (${providerReviews} reviews)`;
        }
        
        // ✅ تمكين الزر بعد تحميل البيانات
        var submitBtn = document.querySelector('.btn-submit-rating');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        
    } catch (err) {
        console.error('Failed to load order ratings context:', err);
        ErrorHandler.showNotification('Error', 'Failed to load order details.', 'error');
    }
}

function checkRole() {
    var rateProviderCard = document.querySelector('.rating-card');
    var rateCustomerCard = document.getElementById('rateCustomerCard');

    if (currentRole === 'provider' || currentRole === 'company') {
        if (rateProviderCard) rateProviderCard.style.display = 'none';
        if (rateCustomerCard) rateCustomerCard.style.display = 'block';
    } else {
        if (rateProviderCard) rateProviderCard.style.display = 'block';
        if (rateCustomerCard) rateCustomerCard.style.display = 'none';
    }
}

// ===== STAR RATING =====
function setRating(value) {
    selectedRating = value;
    document.getElementById('selectedRating').value = value;

    var stars = document.querySelectorAll('#starContainer i');
    stars.forEach(function(star, index) {
        if (index < value) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });

    var ratingText = document.getElementById('ratingText');
    var labels = {
        1: 'Poor - Needs improvement',
        2: 'Fair - Could be better',
        3: 'Good - Satisfactory',
        4: 'Great - Very satisfied',
        5: 'Excellent - Outstanding!'
    };
    ratingText.textContent = labels[value] || 'Select a rating';
    ratingText.className = 'rating-text ' + (value >= 4 ? 'high' : value >= 3 ? 'medium' : 'low');
}

function setCustomerRating(value) {
    customerRating = value;
    document.getElementById('selectedCustomerRating').value = value;

    var stars = document.querySelectorAll('#customerStarContainer i');
    stars.forEach(function(star, index) {
        if (index < value) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });

    var ratingText = document.getElementById('customerRatingText');
    var labels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Great',
        5: 'Excellent'
    };
    ratingText.textContent = labels[value] || 'Select a rating';
    ratingText.className = 'rating-text ' + (value >= 4 ? 'high' : value >= 3 ? 'medium' : 'low');
}

// ===== CATEGORY RATING =====
function setCategoryRating(category, value) {
    categoryRatings[category] = value;

    var container = document.querySelector('.category-stars[data-category="' + category + '"]');
    if (!container) return;

    var stars = container.querySelectorAll('i');
    stars.forEach(function(star, index) {
        if (index < value) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// ===== PHOTOS =====
function handleReviewPhotos(input) {
    var files = Array.from(input.files);
    var grid = document.getElementById('photoPreviewGrid');

    files.forEach(function(file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ File "' + file.name + '" exceeds 5MB limit');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var item = document.createElement('div');
            item.className = 'photo-preview-item';
            item.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}" />
                <button class="remove-photo" onclick="removePhoto(this)"><i class="fas fa-times"></i></button>
            `;
            grid.appendChild(item);
            reviewPhotos.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    input.value = '';
}

function removePhoto(btn) {
    var item = btn.closest('.photo-preview-item');
    var img = item.querySelector('img');
    var src = img ? img.src : '';
    reviewPhotos = reviewPhotos.filter(function(p) { return p !== src; });
    item.remove();
}

// Setup drag and drop
var photoUpload = document.getElementById('photoUpload');
if (photoUpload) {
    photoUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--accent)';
        this.style.background = 'rgba(102, 126, 234, 0.08)';
    });
    photoUpload.addEventListener('dragleave', function() {
        this.style.borderColor = 'var(--border)';
        this.style.background = 'var(--bg-primary)';
    });
    photoUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border)';
        this.style.background = 'var(--bg-primary)';
        var input = document.getElementById('reviewPhotos');
        if (input) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// ===== SUBMIT RATING =====
async function submitRating() {
    console.log('submitRating called');
    
    if (!currentRequest) {
        ErrorHandler.showNotification('Error', 'No request found to rate.', 'error');
        return;
    }

    try {
        if (currentRole === 'customer') {
            // ✅ كود العميل - تقييم الفني
            if (selectedRating === 0) {
                ErrorHandler.showNotification('Validation Error', 'Please select a rating before submitting.', 'error');
                return;
            }

            var reviewText = document.getElementById('reviewText').value.trim();
            if (reviewText && reviewText.length < 10) {
                ErrorHandler.showNotification('Validation Error', 'Please write a review of at least 10 characters.', 'error');
                return;
            }

            const combinedComment = `[Quality: ${categoryRatings.quality}, Comm: ${categoryRatings.communication}, Punctuality: ${categoryRatings.punctuality}, Value: ${categoryRatings.value}] ${reviewText}`;

            await api.post('/ratings', {
                serviceRequestId: currentRequest.id,
                receiverUserId: currentRequest.selectedProviderId,
                providerId: currentRequest.selectedProviderId,
                ratingValue: selectedRating,
                comment: combinedComment,
                ratingStage: 2 // ServiceCompletion
            });
        } 
        else {
            // ✅ كود الـ Provider - تقييم العميل
            if (customerRating === 0) {
                ErrorHandler.showNotification('Validation Error', 'Please select a customer rating before submitting.', 'error');
                return;
            }

            var customerReviewText = document.getElementById('customerReviewText').value.trim();

            await api.post('/ratings', {
                serviceRequestId: currentRequest.id,
                receiverUserId: currentRequest.customerId,  // ✅ العميل هو المستقبل
                ratingValue: customerRating,
                comment: customerReviewText || 'Satisfactory client interaction.',
                ratingStage: 3 // CustomerExperience
            });
        }

        // ✅ إخفاء كل حاجة وعرض رسالة النجاح
        var rateProviderCard = document.querySelector('.rating-card');
        if (rateProviderCard) rateProviderCard.style.display = 'none';
        
        var rateCustomerCard = document.getElementById('rateCustomerCard');
        if (rateCustomerCard) rateCustomerCard.style.display = 'none';
        
        var actionsEl = document.querySelector('.rating-actions');
        if (actionsEl) actionsEl.style.display = 'none';
        
        var successEl = document.getElementById('ratingSuccess');
        if (successEl) {
            successEl.style.display = 'block';
            
            // ✅ أزرار التوجيه حسب الدور
            var role = localStorage.getItem('userRole');
            var dashboardLink = (role === 'customer') ? 'customer-dashboard.html' : 'provider-dashboard.html';
            var ordersLink = (role === 'customer') ? 'my-orders.html' : 'orders.html';
            
            successEl.innerHTML = `
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h2>Thank You for Your Feedback! ⭐</h2>
                <p>Your rating has been submitted successfully. Your feedback helps us improve our service quality.</p>
                <div class="success-actions" style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                    <a href="${dashboardLink}" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--gradient-primary); color: white; border-radius: 12px; font-weight: 600;">
                        <i class="fas fa-gauge-high"></i> Dashboard
                    </a>
                    <a href="${ordersLink}" class="btn-secondary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); border-radius: 12px; font-weight: 600;">
                        <i class="fas fa-list-check"></i> My Orders
                    </a>
                </div>
            `;
        }

        localStorage.removeItem('currentOrderDetails');
        ErrorHandler.showNotification('Success', 'Your rating has been submitted!', 'success');

    } catch (err) {
        console.error('Failed to submit rating:', err);
        ErrorHandler.showNotification('Error', 'Failed to submit rating. Please try again.', 'error');
    }
}

// ===== SKIP RATING =====
function skipRating() {
    if (confirm('Are you sure you want to skip rating? You can submit your rating later from your orders page.')) {
        if (currentRole === 'customer') {
            window.location.href = 'customer-dashboard.html';
        } else {
            window.location.href = 'provider-dashboard.html';
        }
    }
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
window.setRating = setRating;
window.setCustomerRating = setCustomerRating;
window.setCategoryRating = setCategoryRating;
window.handleReviewPhotos = handleReviewPhotos;
window.removePhoto = removePhoto;
window.submitRating = submitRating;
window.skipRating = skipRating;
window.handleLogout = handleLogout;