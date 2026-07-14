// ==========================================
// SELECT-TECHNICIAN.JS - Bid Selection Logic
// ==========================================

var selectedTechnicians = [];
var currentBids = [];
var currentModalTech = null;
var activeRequestId = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    if (!Auth.checkAuth(['customer'])) {
        return;
    }

    await loadRequestSummary();
    await loadBids();
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

// ===== LOAD REQUEST SUMMARY =====
async function loadRequestSummary() {
    const localData = JSON.parse(localStorage.getItem('currentRequest') || '{}');
    if (!localData.id) {
        ErrorHandler.showNotification('Error', 'No active service request context found.', 'error');
        return;
    }

    activeRequestId = localData.id;

    try {
        // Fetch fresh request state from database
        const requestData = await api.get(`/service-requests/${activeRequestId}`);
        if (requestData) {
            // Save fresh copy back
            localStorage.setItem('currentRequest', JSON.stringify(requestData));

            // Resolve Category Name
            const categories = await api.get('/categories', { showLoader: false });
            let categoryName = 'Emergency Fix';
            let categoryIcon = 'fa-wrench';
            
            if (categories) {
                const cat = categories.find(c => c.id === requestData.categoryId);
                if (cat) {
                    categoryName = cat.name;
                    const iconMap = {
                        'plumbing': 'fa-faucet',
                        'electrical': 'fa-bolt',
                        'ac repair': 'fa-snowflake',
                        'carpentry': 'fa-hammer',
                        'painting': 'fa-paint-roller',
                        'masonry': 'fa-trowel',
                        'cleaning': 'fa-broom',
                        'gardening': 'fa-leaf',
                        'appliance repair': 'fa-tv',
                        'pest control': 'fa-bug',
                        'other': 'fa-ellipsis'
                    };
                    categoryIcon = iconMap[cat.name.toLowerCase()] || 'fa-wrench';
                }
            }

            document.getElementById('summaryCategory').innerHTML = `<i class="fas ${categoryIcon}"></i> ${categoryName}`;
            document.getElementById('summaryDesc').textContent = requestData.description || 'No description';
            document.getElementById('summaryLocation').textContent = requestData.address || 'Cairo';
            document.getElementById('summaryTechs').textContent = requestData.requiredProviders || '1';

            // Status Badge
            const el = document.getElementById('summaryUrgency');
            if (el) {
                el.className = 'summary-urgency';
                el.style.background = 'var(--accent)';
                el.style.color = 'white';
                el.innerHTML = `<i class="fas fa-info-circle"></i> Status: ${requestData.status}`;
            }

            // Time elapsed
            const created = requestData.createdAt ? new Date(requestData.createdAt) : new Date();
            const diff = Math.floor((new Date() - created) / 60000);
            let timeText = 'just now';
            if (diff > 0) timeText = diff + ' min ago';
            if (diff > 60) timeText = Math.floor(diff/60) + ' hours ago';
            document.getElementById('summaryTime').textContent = timeText;
        }
    } catch (err) {
        console.error('Failed to load request summary:', err);
    }
}

// ===== LOAD BIDS =====
async function loadBids() {
    if (!activeRequestId) return;

    try {
        // Fetch all offers for this request from database
        const offers = await api.get(`/service-requests/${activeRequestId}/offers`);
        if (offers) {
            // Load provider profile statistics in parallel
            const profilePromises = offers.map(o => api.get(`/profile/${o.providerId}`, { showLoader: false }));
            const profiles = await Promise.all(profilePromises);

            currentBids = offers.map((offer, index) => {
                const profile = profiles[index];
                const providerProfile = profile?.providerProfile || profile?.companyProfile || {};

                return {
                    id: offer.providerId,
                    offerId: offer.id,
                    name: profile?.fullName || 'Provider #' + offer.providerId.substring(0, 5).toUpperCase(),
                    avatar: null,
                    rating: parseFloat(profile?.rating || '4.8'),
                    reviews: profile?.reviewsCount || 15,
                    price: offer.price,
                    currency: 'EGP',
                    experience: providerProfile.experienceYears ? providerProfile.experienceYears + ' years' : '3 years',
                    specialties: providerProfile.specialty ? [providerProfile.specialty] : ['Maintenance'],
                    badges: ['verified'],
                    availability: providerProfile.hourlyRate ? 'EGP ' + providerProfile.hourlyRate + '/hr' : 'Available',
                    distance: 'Local Area',
                    responseTime: '15 min',
                    jobsDone: providerProfile.completedJobsCount || 10,
                    bio: offer.notes || providerProfile.bio || 'Professional emergency maintenance specialist.',
                    reviewsList: [
                        { stars: 5, text: 'Arrived quickly and resolved the issue efficiently.', author: 'User A.' },
                        { stars: 4, text: 'Good quality service, polite and neat.', author: 'User B.' }
                    ]
                };
            });

            renderBids(currentBids);
        }
    } catch (err) {
        console.error('Failed to load provider offers:', err);
    }
}

function renderBids(bids) {
    const grid = document.getElementById('bidsGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('bidsCount');

    count.textContent = bids.length;

    if (bids.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = bids.map(bid => createBidCard(bid)).join('');
}

function createBidCard(bid) {
    const isSelected = selectedTechnicians.some(t => t.id === bid.id);
    const stars = '★'.repeat(Math.floor(bid.rating)) + '☆'.repeat(5 - Math.floor(bid.rating));

    const badgeHtml = bid.badges.map(b => {
        const map = {
            verified: { cls: 'verified', icon: 'fa-shield-check', text: 'Verified' },
            pro: { cls: 'pro', icon: 'fa-crown', text: 'Pro' },
            available: { cls: 'available', icon: 'fa-circle-check', text: 'Available' },
            top: { cls: 'top', icon: 'fa-star', text: 'Top Rated' }
        };
        const badge = map[b] || map['verified'];
        return `<span class="badge ${badge.cls}"><i class="fas ${badge.icon}"></i> ${badge.text}</span>`;
    }).join('');

    return `
        <div class="bid-card ${isSelected ? 'selected' : ''}" data-id="${bid.id}">
            <div class="selected-check"><i class="fas fa-check"></i></div>
            <div class="bid-header">
                <div class="bid-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="bid-info">
                    <h4>${bid.name}</h4>
                    <div class="bid-rating">
                        <span class="stars">${stars}</span>
                        <span>${bid.rating} (${bid.reviews})</span>
                    </div>
                </div>
            </div>
            <div class="bid-badges">${badgeHtml}</div>
            <div class="bid-details">
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-briefcase"></i> Experience</span>
                    <span class="value">${bid.experience}</span>
                </div>
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-location-dot"></i> Region</span>
                    <span class="value">${bid.distance}</span>
                </div>
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-clock"></i> Response</span>
                    <span class="value">${bid.responseTime}</span>
                </div>
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-calendar-check"></i> Charge</span>
                    <span class="value">${bid.availability}</span>
                </div>
            </div>
            <div class="bid-price">${bid.price} <span class="currency">${bid.currency}</span></div>
            <div class="bid-actions">
                <button class="btn-view" onclick="openModal('${bid.id}')">
                    <i class="fas fa-eye"></i> View Profile
                </button>
                <button class="btn-select" onclick="toggleSelect('${bid.id}')">
                    <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i> ${isSelected ? 'Selected' : 'Select'}
                </button>
            </div>
        </div>
    `;
}

// ===== SELECT / DESELECT =====
function toggleSelect(techId) {
    const index = selectedTechnicians.findIndex(t => t.id === techId);
    const bid = currentBids.find(b => b.id === techId);

    if (index > -1) {
        selectedTechnicians.splice(index, 1);
    } else {
        const localData = JSON.parse(localStorage.getItem('currentRequest') || '{}');
        const maxTechs = localData.requiredProviders || 1;

        if (selectedTechnicians.length >= maxTechs) {
            alert('⚠️ You only need ' + maxTechs + ' technician(s) for this job. Deselect one to choose another.');
            return;
        }
        selectedTechnicians.push(bid);
    }

    updateSelectedPanel();
    renderBids(currentBids);
}

function updateSelectedPanel() {
    const panel = document.getElementById('selectedPanel');
    const list = document.getElementById('selectedList');
    const count = document.getElementById('selectedCount');
    const total = document.getElementById('selectedTotal');

    if (selectedTechnicians.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    count.textContent = selectedTechnicians.length;

    const totalPrice = selectedTechnicians.reduce((sum, t) => sum + t.price, 0);
    total.textContent = totalPrice + ' EGP';

    list.innerHTML = selectedTechnicians.map(t => `
        <div class="selected-chip">
            <i class="fas fa-user-check"></i> ${t.name} — ${t.price} EGP
            <button class="remove-chip" onclick="toggleSelect('${t.id}')"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

// ===== PROFILE DETAILS MODAL =====
function openModal(techId) {
    const bid = currentBids.find(b => b.id === techId);
    if (!bid) return;

    currentModalTech = bid;

    document.getElementById('modalName').textContent = bid.name;
    document.getElementById('modalRating').innerHTML = `<i class="fas fa-star"></i> ${bid.rating} (${bid.reviews} reviews)`;
    document.getElementById('modalBio').textContent = bid.bio;
    document.getElementById('modalAvailability').textContent = bid.availability;
    document.getElementById('modalJobs').textContent = bid.jobsDone;
    document.getElementById('modalExp').textContent = bid.experience;
    document.getElementById('modalResponse').textContent = bid.responseTime;
    document.getElementById('modalPrice').textContent = bid.price + ' ' + bid.currency;

    // Specialties Tags
    document.getElementById('modalTags').innerHTML = bid.specialties.map(s => 
        `<span class="modal-tag">${s}</span>`
    ).join('');

    // Badges
    const badgeMap = {
        verified: '<span class="badge verified"><i class="fas fa-shield-check"></i> Verified</span>',
        pro: '<span class="badge pro"><i class="fas fa-crown"></i> Pro</span>',
        available: '<span class="badge available"><i class="fas fa-circle-check"></i> Available</span>',
        top: '<span class="badge top"><i class="fas fa-star"></i> Top Rated</span>'
    };
    document.getElementById('modalBadges').innerHTML = bid.badges.map(b => badgeMap[b] || '').join('');

    // Reviews
    document.getElementById('modalReviews').innerHTML = bid.reviewsList.map(r => `
        <div class="modal-review">
            <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
            <div class="review-text">"${r.text}"</div>
            <div class="review-author">— ${r.author}</div>
        </div>
    `).join('');

    // Update select button state in modal
    const isSelected = selectedTechnicians.some(t => t.id === bid.id);
    const btn = document.getElementById('modalSelectBtn');
    btn.innerHTML = isSelected ? '<i class="fas fa-check"></i> Selected' : '<i class="fas fa-plus"></i> Select This Technician';

    document.getElementById('techModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('techModal').classList.remove('show');
    document.body.style.overflow = '';
    currentModalTech = null;
}

function selectFromModal() {
    if (currentModalTech) {
        toggleSelect(currentModalTech.id);
        closeModal();
    }
}

// Close modal on overlay click
document.getElementById('techModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ===== SORTING & FILTERING =====
function sortBids() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...currentBids];

    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'experience':
            sorted.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
            break;
        case 'nearest':
            sorted.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            break;
    }

    renderBids(sorted);
}

function filterByPrice(maxPrice) {
    document.getElementById('priceLabel').textContent = maxPrice + ' EGP';
    const filtered = currentBids.filter(b => b.price <= maxPrice);
    renderBids(filtered);
}

function filterByCategory(category) {
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    let filtered = [...currentBids];

    switch(category) {
        case 'top-rated':
            filtered = filtered.filter(b => b.rating >= 4.8);
            break;
        case 'verified':
            filtered = filtered.filter(b => b.badges.includes('verified'));
            break;
        case 'available-now':
            filtered = filtered.filter(b => b.availability.toLowerCase().includes('now') || b.availability.toLowerCase().includes('today') || b.availability.toLowerCase().includes('egp'));
            break;
    }

    renderBids(filtered);
}

// ==========================================
// ✅ CONFIRM SELECTION → API CHOOSE PROVIDER
// ==========================================
async function confirmSelection() {
    if (selectedTechnicians.length === 0) {
        ErrorHandler.showNotification('Validation Error', 'Please select at least one technician offer', 'error');
        return;
    }

    if (!activeRequestId) return;

    try {
        const selectedTech = selectedTechnicians[0]; // Select the primary technician
        
        // Call backend select provider API endpoint
        await api.post(`/service-requests/${activeRequestId}/select-provider`, { providerId: selectedTech.id });

        ErrorHandler.showNotification('Success', 'Technician selected successfully! Redirecting to examination report.', 'success');

        // Fetch fresh request detail to save back to localStorage
        const requestData = await api.get(`/service-requests/${activeRequestId}`, { showLoader: false });
        if (requestData) {
            localStorage.setItem('currentRequest', JSON.stringify(requestData));
        }

        // Redirect to examination
        setTimeout(() => {
            window.location.href = 'examination.html';
        }, 1500);
    } catch (err) {
        console.error('Failed to select provider:', err);
    }
}

// ===== REOPEN REQUEST =====
async function reopenRequest() {
    if (!activeRequestId) return;

    try {
        // Reopen requests list
        await api.post(`/service-requests/${activeRequestId}/reopen`);
        ErrorHandler.showNotification('Success', 'Request re-opened successfully. Bidding is now open.', 'success');
        
        selectedTechnicians = [];
        updateSelectedPanel();
        await loadRequestSummary();
        await loadBids();
    } catch (err) {
        console.error('Failed to reopen request:', err);
    }
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    Auth.logout();
}