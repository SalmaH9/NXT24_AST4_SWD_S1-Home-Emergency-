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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    loadOrderData();
    updateFooterDate();
    checkRole();
});

function loadOrderData() {
    // Load order from localStorage
    var saved = localStorage.getItem('currentOrderDetails');
    if (saved) {
        try {
            currentOrder = JSON.parse(saved);
        } catch(e) {}
    }

    // If no saved order, use demo data
    if (!currentOrder) {
        currentOrder = {
            id: '#ORD-001',
            service: 'Plumbing',
            status: 'completed',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            technician: {
                name: 'Ahmed Al-Rashid',
                rating: 4.9,
                reviews: 128
            },
            customer: {
                name: localStorage.getItem('userName') || 'Customer'
            }
        };
    }

    // Display order info
    document.getElementById('orderId').textContent = currentOrder.id || '#ORD-001';
    document.getElementById('orderService').textContent = currentOrder.service || 'Service';
    document.getElementById('orderDate').textContent = currentOrder.date || 'Today';
    document.getElementById('orderTechnician').textContent = currentOrder.technician ? currentOrder.technician.name : 'Technician';
    document.getElementById('techName').textContent = currentOrder.technician ? currentOrder.technician.name : 'Technician';
    document.getElementById('customerName').textContent = currentOrder.customer ? currentOrder.customer.name : 'Customer';
}

function checkRole() {
    var role = localStorage.getItem('userRole');
    // Show customer rating section for providers
    if (role === 'provider') {
        document.getElementById('rateCustomerCard').style.display = 'block';
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

// Drag and drop for photos
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
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
    });
}

// ===== SUBMIT RATING =====
function submitRating() {
    // Check if rating is selected
    if (selectedRating === 0) {
        alert('⚠️ Please rate the technician before submitting.');
        return;
    }

    var reviewText = document.getElementById('reviewText').value.trim();
    var customerReviewText = document.getElementById('customerReviewText').value.trim();

    // Check if review is too short
    if (reviewText && reviewText.length < 10) {
        alert('⚠️ Please write a more detailed review (at least 10 characters).');
        return;
    }

    // Build rating data
    var ratingData = {
        orderId: currentOrder.id || 'ORD-001',
        technician: {
            name: currentOrder.technician ? currentOrder.technician.name : 'Technician',
            rating: selectedRating,
            categories: categoryRatings,
            review: reviewText || 'No review provided',
            photos: reviewPhotos
        },
        customer: {
            name: currentOrder.customer ? currentOrder.customer.name : 'Customer',
            rating: customerRating,
            review: customerReviewText || 'No review provided'
        },
        date: new Date().toISOString(),
        role: localStorage.getItem('userRole') || 'customer'
    };

    // Save to localStorage
    var ratings = JSON.parse(localStorage.getItem('fixoraRatings') || '[]');
    ratings.push(ratingData);
    localStorage.setItem('fixoraRatings', JSON.stringify(ratings));

    // Update technician rating in localStorage
    updateTechnicianRating(ratingData.technician.name, selectedRating);

    // Update customer rating if provider
    if (ratingData.role === 'provider' && customerRating > 0) {
        updateCustomerRating(ratingData.customer.name, customerRating);
    }

    // Update order with rating flag
    var orders = JSON.parse(localStorage.getItem('fixoraOrders') || '[]');
    var orderIndex = orders.findIndex(function(o) { return o.id === currentOrder.id; });
    if (orderIndex > -1) {
        orders[orderIndex].rated = true;
        localStorage.setItem('fixoraOrders', JSON.stringify(orders));
    }

    // Show success
    document.querySelector('.rating-card').style.display = 'none';
    var customerCard = document.getElementById('rateCustomerCard');
    if (customerCard) customerCard.style.display = 'none';
    document.querySelector('.rating-actions').style.display = 'none';
    document.getElementById('ratingSuccess').style.display = 'block';

    // Clear order details after rating
    localStorage.removeItem('currentOrderDetails');

    console.log('⭐ Rating submitted:', ratingData);
}

function updateTechnicianRating(techName, newRating) {
    var techs = JSON.parse(localStorage.getItem('fixoraBids') || '[]');
    var techIndex = techs.findIndex(function(t) { return t.name === techName; });
    if (techIndex > -1) {
        var tech = techs[techIndex];
        var totalReviews = tech.reviews || 0;
        var currentRating = tech.rating || 0;
        var newTotal = ((currentRating * totalReviews) + newRating) / (totalReviews + 1);
        tech.rating = Math.round(newTotal * 10) / 10;
        tech.reviews = totalReviews + 1;
        localStorage.setItem('fixoraBids', JSON.stringify(techs));
    }
}

function updateCustomerRating(customerName, newRating) {
    var customers = JSON.parse(localStorage.getItem('fixoraCustomers') || '[]');
    var customerIndex = customers.findIndex(function(c) { return c.name === customerName; });
    if (customerIndex > -1) {
        var customer = customers[customerIndex];
        var totalReviews = customer.reviews || 0;
        var currentRating = customer.rating || 0;
        var newTotal = ((currentRating * totalReviews) + newRating) / (totalReviews + 1);
        customer.rating = Math.round(newTotal * 10) / 10;
        customer.reviews = totalReviews + 1;
        localStorage.setItem('fixoraCustomers', JSON.stringify(customers));
    }
}

// ===== SKIP RATING =====
function skipRating() {
    if (confirm('⚠️ Are you sure you want to skip rating? You can always rate later from your orders page.')) {
        window.location.href = 'customer-dashboard.html';
    }
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
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
window.setRating = setRating;
window.setCustomerRating = setCustomerRating;
window.setCategoryRating = setCategoryRating;
window.handleReviewPhotos = handleReviewPhotos;
window.removePhoto = removePhoto;
window.submitRating = submitRating;
window.skipRating = skipRating;
window.handleLogout = handleLogout;