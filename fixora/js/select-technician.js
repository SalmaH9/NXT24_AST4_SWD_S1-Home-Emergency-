// ==========================================
// SELECT-TECHNICIAN.JS - Bid Selection Logic
// ==========================================

var selectedTechnicians = [];
var currentBids = [];
var currentModalTech = null;

// ===== DEMO BIDS DATA =====
var demoBids = [
    {
        id: 'TECH_001',
        name: 'Ahmed Al-Rashid',
        avatar: null,
        rating: 4.9,
        reviews: 128,
        price: 180,
        currency: 'EGP',
        experience: '8 years',
        specialties: ['Plumbing', 'Pipe Repair', 'Installation'],
        badges: ['verified', 'pro', 'top'],
        availability: 'Available today after 2PM',
        distance: '2.3 km',
        responseTime: '15 min',
        jobsDone: 450,
        bio: 'Certified plumber with 8+ years experience in residential and commercial plumbing. Expert in leak detection and pipe repair.',
        reviewsList: [
            { stars: 5, text: 'Fixed my kitchen leak in 30 minutes. Very professional!', author: 'Mohammed K.' },
            { stars: 5, text: 'Great work, clean and fast. Highly recommended.', author: 'Sarah A.' },
            { stars: 4, text: 'Good service, arrived on time.', author: 'Fahad M.' }
        ]
    },
    {
        id: 'TECH_002',
        name: 'Khalid Al-Otaibi',
        avatar: null,
        rating: 4.7,
        reviews: 86,
        price: 150,
        currency: 'EGP',
        experience: '5 years',
        specialties: ['Plumbing', 'Drain Cleaning', 'Water Heater'],
        badges: ['verified', 'available'],
        availability: 'Available tomorrow morning',
        distance: '4.1 km',
        responseTime: '30 min',
        jobsDone: 280,
        bio: 'Specialized in drain cleaning and water heater installation. Quick response time and quality guaranteed.',
        reviewsList: [
            { stars: 5, text: 'Excellent drain cleaning service. Very thorough.', author: 'Nasser R.' },
            { stars: 4, text: 'Good price and quality work.', author: 'Omar S.' }
        ]
    },
    {
        id: 'TECH_003',
        name: 'Faisal Al-Harbi',
        avatar: null,
        rating: 5.0,
        reviews: 210,
        price: 220,
        currency: 'EGP',
        experience: '12 years',
        specialties: ['Plumbing', 'Emergency Repair', 'Leak Detection'],
        badges: ['verified', 'pro', 'top'],
        availability: 'Available now',
        distance: '1.5 km',
        responseTime: '5 min',
        jobsDone: 680,
        bio: 'Master plumber with 12 years experience. Emergency specialist. Available 24/7 for urgent repairs.',
        reviewsList: [
            { stars: 5, text: 'Saved us from a major flood! True professional.', author: 'Laila H.' },
            { stars: 5, text: 'Best plumber in Cairo. Worth every riyal.', author: 'Yousef T.' },
            { stars: 5, text: 'Arrived in 10 minutes for an emergency. Amazing!', author: 'Hana A.' }
        ]
    },
    {
        id: 'TECH_004',
        name: 'Sami Al-Qahtani',
        avatar: null,
        rating: 4.5,
        reviews: 45,
        price: 120,
        currency: 'EGP',
        experience: '3 years',
        specialties: ['Plumbing', 'Faucet Repair', 'Toilet Installation'],
        badges: ['verified'],
        availability: 'Available this weekend',
        distance: '6.2 km',
        responseTime: '1 hour',
        jobsDone: 120,
        bio: 'Young and energetic plumber. Great for small repairs and installations. Competitive pricing.',
        reviewsList: [
            { stars: 4, text: 'Good work for the price. Will hire again.', author: 'Bandar F.' },
            { stars: 5, text: 'Fixed my toilet quickly. Nice guy.', author: 'Reem K.' }
        ]
    },
    {
        id: 'TECH_005',
        name: 'Nasser Al-Dosari',
        avatar: null,
        rating: 4.8,
        reviews: 95,
        price: 200,
        currency: 'EGP',
        experience: '10 years',
        specialties: ['Plumbing', 'Pipe Replacement', 'Bathroom Renovation'],
        badges: ['verified', 'pro'],
        availability: 'Available tomorrow afternoon',
        distance: '3.8 km',
        responseTime: '20 min',
        jobsDone: 520,
        bio: 'Full-service plumbing contractor. Handles everything from small repairs to full bathroom renovations.',
        reviewsList: [
            { stars: 5, text: 'Renovated our entire bathroom. Perfect work!', author: 'Ahmad S.' },
            { stars: 5, text: 'Professional and reliable. Highly recommended.', author: 'Majed R.' }
        ]
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadRequestSummary();
    loadBids();
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
function loadRequestSummary() {
    const requestData = JSON.parse(localStorage.getItem('currentRequest') || '{}');

    if (requestData.category) {
        const catMap = {
            'plumbing': { icon: 'fa-faucet', name: 'Plumbing' },
            'electrical': { icon: 'fa-bolt', name: 'Electrical' },
            'ac-repair': { icon: 'fa-snowflake', name: 'AC Repair' },
            'carpentry': { icon: 'fa-hammer', name: 'Carpentry' },
            'painting': { icon: 'fa-paint-roller', name: 'Painting' },
            'masonry': { icon: 'fa-trowel', name: 'Masonry' },
            'cleaning': { icon: 'fa-broom', name: 'Cleaning' },
            'gardening': { icon: 'fa-leaf', name: 'Gardening' },
            'appliance': { icon: 'fa-tv', name: 'Appliance Repair' },
            'pest-control': { icon: 'fa-bug', name: 'Pest Control' },
            'other': { icon: 'fa-ellipsis', name: 'Other' }
        };
        const cat = catMap[requestData.category] || catMap['other'];
        document.getElementById('summaryCategory').innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.name}`;
    }

    if (requestData.urgency) {
        const el = document.getElementById('summaryUrgency');
        el.className = 'summary-urgency ' + requestData.urgency;
        const urgMap = { normal: 'Normal', urgent: 'Urgent', emergency: 'Emergency' };
        const urgIcon = { normal: 'fa-clock', urgent: 'fa-fire', emergency: 'fa-triangle-exclamation' };
        el.innerHTML = `<i class="fas ${urgIcon[requestData.urgency]}"></i> ${urgMap[requestData.urgency]}`;
    }

    document.getElementById('summaryDesc').textContent = requestData.description || 'No description provided';
    document.getElementById('summaryLocation').textContent = requestData.city || 'Unknown';
    document.getElementById('summaryTechs').textContent = requestData.techCount || '1';

    // Time ago
    const created = requestData.createdAt ? new Date(requestData.createdAt) : new Date();
    const diff = Math.floor((new Date() - created) / 60000);
    let timeText = 'just now';
    if (diff > 0) timeText = diff + ' min ago';
    if (diff > 60) timeText = Math.floor(diff/60) + ' hours ago';
    document.getElementById('summaryTime').textContent = timeText;
}

// ===== LOAD BIDS =====
function loadBids() {
    // Check if there are stored bids, otherwise use demo
    let bids = JSON.parse(localStorage.getItem('fixoraBids') || 'null');
    if (!bids) {
        bids = demoBids;
        localStorage.setItem('fixoraBids', JSON.stringify(bids));
    }
    currentBids = bids;
    renderBids(bids);
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
    const isSelected = selectedTechnicians.find(t => t.id === bid.id);
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
                    <span class="label"><i class="fas fa-location-dot"></i> Distance</span>
                    <span class="value">${bid.distance}</span>
                </div>
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-clock"></i> Response</span>
                    <span class="value">${bid.responseTime}</span>
                </div>
                <div class="bid-detail-row">
                    <span class="label"><i class="fas fa-calendar-check"></i> Availability</span>
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
        // Check if we need more technicians
        const request = JSON.parse(localStorage.getItem('currentRequest') || '{}');
        const maxTechs = request.techCount || 1;

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

// ===== MODAL =====
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

    // Tags
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

    // Update select button in modal
    const isSelected = selectedTechnicians.find(t => t.id === bid.id);
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
    // Update active tag
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
            filtered = filtered.filter(b => b.availability.toLowerCase().includes('now') || b.availability.toLowerCase().includes('today'));
            break;
    }

    renderBids(filtered);
}

// ==========================================
// ✅ CONFIRM SELECTION → GO TO EXAMINATION
// ==========================================
function confirmSelection() {
    if (selectedTechnicians.length === 0) {
        alert('⚠️ Please select at least one technician');
        return;
    }

    // Save selected technicians to current request
    const request = JSON.parse(localStorage.getItem('currentRequest') || '{}');
    request.selectedTechnicians = selectedTechnicians;
    request.status = 'selected'; // ✅ مهم: حالة الطلب تصبح "selected"
    request.selectedTechnician = selectedTechnicians[0]; // أول فني مختار
    
    localStorage.setItem('currentRequest', JSON.stringify(request));

    // Update requests list
    let requests = JSON.parse(localStorage.getItem('fixoraRequests') || '[]');
    const idx = requests.findIndex(r => r.id === request.id);
    if (idx > -1) {
        requests[idx] = request;
        localStorage.setItem('fixoraRequests', JSON.stringify(requests));
    }

    // ✅ توجيه العميل إلى صفحة Examination
    alert('✅ Technician selected! They will visit for examination.');
    window.location.href = 'examination.html';
}

// ===== REOPEN REQUEST =====
function reopenRequest() {
    const request = JSON.parse(localStorage.getItem('currentRequest') || '{}');
    request.status = 'open';
    request.selectedTechnicians = [];
    localStorage.setItem('currentRequest', JSON.stringify(request));

    selectedTechnicians = [];
    updateSelectedPanel();
    renderBids(currentBids);

    document.getElementById('reopenBtn').style.display = 'none';
    alert('✅ Request re-opened. New technicians can now bid.');
}

// ===== LOGOUT =====
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    window.location.href = 'index.html';
}