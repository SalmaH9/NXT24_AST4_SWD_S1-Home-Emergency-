// ==========================================
// POST-REQUEST.JS - Service Request Logic
// ==========================================

var requestStep = 1;
var totalRequestSteps = 4;
var uploadedMedia = [];

// ===== STEP MANAGEMENT =====
function updateRequestProgress() {
    const progressLine = document.getElementById('requestProgressLine');
    const percentage = ((requestStep - 1) / (totalRequestSteps - 1)) * 100;
    progressLine.style.width = percentage + '%';

    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum < requestStep) {
            step.classList.add('completed');
            step.querySelector('.step-dot').innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNum === requestStep) {
            step.classList.add('active');
            step.querySelector('.step-dot').textContent = stepNum;
        } else {
            step.querySelector('.step-dot').textContent = stepNum;
        }
    });
}

function showRequestStep(stepNum) {
    document.querySelectorAll('.request-step').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('reqStep' + stepNum).classList.add('active');
    requestStep = stepNum;
    updateRequestProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextRequestStep(stepNum) {
    if (validateRequestStep(requestStep)) {
        if (stepNum === 4) {
            populateRequestReview();
        }
        showRequestStep(stepNum);
    }
}

function prevRequestStep(stepNum) {
    showRequestStep(stepNum);
}

// ===== VALIDATION =====
function validateRequestStep(step) {
    if (step === 1) {
        const category = document.getElementById('selectedCategory').value;
        const desc = document.getElementById('problemDesc').value.trim();

        if (!category) {
            alert('⚠️ Please select a service category');
            return false;
        }
        if (!desc || desc.length < 10) {
            alert('⚠️ Please describe your problem in at least 10 characters');
            return false;
        }
    }

    if (step === 2) {
        const urgency = document.getElementById('selectedUrgency').value;
        if (!urgency) {
            alert('⚠️ Please select an urgency level');
            return false;
        }
    }

    if (step === 3) {
        const city = document.getElementById('reqCity').value;
        const address = document.getElementById('reqAddress').value.trim();

        if (!city) {
            alert('⚠️ Please select a city');
            return false;
        }
        if (!address) {
            alert('⚠️ Please enter your full address');
            return false;
        }
    }

    return true;
}

// ===== CATEGORY SELECTION =====
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('selectedCategory').value = this.dataset.value;
    });
});

// ===== TECHNICIAN COUNTER =====
function changeTechCount(delta) {
    const valueEl = document.getElementById('techCount');
    const inputEl = document.getElementById('techCountInput');
    let count = parseInt(valueEl.textContent) + delta;
    if (count < 1) count = 1;
    if (count > 10) count = 10;
    valueEl.textContent = count;
    inputEl.value = count;
}

// ===== URGENCY SELECTION =====
document.querySelectorAll('.urgency-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.urgency-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('selectedUrgency').value = this.dataset.value;
    });
});

// ===== MEDIA UPLOAD =====
function handleMediaUpload(input) {
    const files = Array.from(input.files);
    const grid = document.getElementById('mediaPreviewGrid');

    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ File "' + file.name + '" exceeds 10MB limit');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const item = document.createElement('div');
            item.className = 'media-preview-item';
            item.dataset.filename = file.name;

            const isVideo = file.type.startsWith('video');
            if (isVideo) {
                item.innerHTML = `
                    <video src="${e.target.result}" muted></video>
                    <span class="media-type-icon"><i class="fas fa-video"></i></span>
                    <button class="remove-media" onclick="removeMedia(this)"><i class="fas fa-times"></i></button>
                `;
            } else {
                item.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" />
                    <span class="media-type-icon"><i class="fas fa-image"></i></span>
                    <button class="remove-media" onclick="removeMedia(this)"><i class="fas fa-times"></i></button>
                `;
            }

            grid.appendChild(item);
            uploadedMedia.push({ name: file.name, data: e.target.result, type: file.type });
        };
        reader.readAsDataURL(file);
    });

    input.value = '';
}

function removeMedia(btn) {
    const item = btn.closest('.media-preview-item');
    const filename = item.dataset.filename;
    uploadedMedia = uploadedMedia.filter(m => m.name !== filename);
    item.remove();
}

// Drag and drop for media
const mediaUpload = document.getElementById('mediaUpload');
if (mediaUpload) {
    mediaUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        mediaUpload.style.borderColor = 'var(--accent)';
        mediaUpload.style.background = 'rgba(102, 126, 234, 0.08)';
    });
    mediaUpload.addEventListener('dragleave', () => {
        mediaUpload.style.borderColor = 'var(--border)';
        mediaUpload.style.background = 'var(--bg-primary)';
    });
    mediaUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        mediaUpload.style.borderColor = 'var(--border)';
        mediaUpload.style.background = 'var(--bg-primary)';
        const input = document.getElementById('mediaFiles');
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
    });
}

// ===== LOCATION DETECTION =====
function detectLocation() {
    if (!navigator.geolocation) {
        alert('⚠️ Geolocation is not supported by your browser');
        return;
    }

    const mapPlaceholder = document.getElementById('mapPlaceholder');
    mapPlaceholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i><h4>Detecting location...</h4>';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            document.getElementById('latLng').value = lat + ',' + lng;
            mapPlaceholder.innerHTML = `
                <i class="fas fa-check-circle" style="color:#48bb78;"></i>
                <h4>Location Detected</h4>
                <p>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                <button type="button" class="btn-detect" onclick="detectLocation()">
                    <i class="fas fa-rotate-right"></i> Update Location
                </button>
            `;
        },
        (error) => {
            mapPlaceholder.innerHTML = `
                <i class="fas fa-location-dot"></i>
                <h4>Interactive Map</h4>
                <p>Unable to detect location. Please enter address manually.</p>
                <button type="button" class="btn-detect" onclick="detectLocation()">
                    <i class="fas fa-location-crosshairs"></i> Try Again
                </button>
            `;
            alert('⚠️ Could not detect location: ' + error.message);
        }
    );
}

// ===== POPULATE REVIEW =====
function populateRequestReview() {
    // Category
    const selectedCat = document.querySelector('.category-card.selected');
    document.getElementById('reviewCategory').textContent = selectedCat ? selectedCat.querySelector('span').textContent : '--';

    // Description
    document.getElementById('reviewDesc').textContent = document.getElementById('problemDesc').value;

    // Technicians
    document.getElementById('reviewTechs').textContent = document.getElementById('techCount').textContent + ' technician(s)';

    // Urgency
    const selectedUrg = document.querySelector('.urgency-btn.selected');
    document.getElementById('reviewUrgency').textContent = selectedUrg ? selectedUrg.querySelector('span').textContent : '--';

    // Location
    const city = document.getElementById('reqCity').value;
    const address = document.getElementById('reqAddress').value;
    const landmark = document.getElementById('reqLandmark').value;
    let locationText = city + ' — ' + address;
    if (landmark) locationText += ' (Near: ' + landmark + ')';
    document.getElementById('reviewLocation').textContent = locationText;

    // Media
    const mediaSection = document.getElementById('reviewMediaSection');
    const mediaGrid = document.getElementById('reviewMediaGrid');
    mediaGrid.innerHTML = '';

    if (uploadedMedia.length > 0) {
        mediaSection.style.display = 'block';
        uploadedMedia.forEach(media => {
            if (media.type.startsWith('image')) {
                const img = document.createElement('img');
                img.src = media.data;
                img.alt = media.name;
                mediaGrid.appendChild(img);
            }
        });
    } else {
        mediaSection.style.display = 'none';
    }
}

// ===== GLOBAL CATEGORIES MAP =====
var backendCategories = {};

// ===== SUBMIT REQUEST =====
async function submitRequest() {
    const selectedCatKey = document.getElementById('selectedCategory').value;
    const description = document.getElementById('problemDesc').value.trim();
    const techCount = parseInt(document.getElementById('techCountInput').value) || 1;
    const city = document.getElementById('reqCity').value;
    const addressDetails = document.getElementById('reqAddress').value.trim();
    const landmark = document.getElementById('reqLandmark').value.trim();

    // Construct unified address string
    let fullAddress = city + ", " + addressDetails;
    if (landmark) fullAddress += " (Near: " + landmark + ")";

    // Parse coordinates
    const latLngStr = document.getElementById('latLng').value;
    let latitude = 30.0444; // Default Cairo lat
    let longitude = 31.2357; // Default Cairo lng
    if (latLngStr) {
        const parts = latLngStr.split(',');
        latitude = parseFloat(parts[0]) || latitude;
        longitude = parseFloat(parts[1]) || longitude;
    }

    if (!selectedCatKey) {
        ErrorHandler.showNotification('Validation Error', 'Please select a service category', 'error');
        return;
    }

    try {
        const result = await api.post('/service-requests', {
            categoryId: selectedCatKey,
            description: description,
            address: fullAddress,
            latitude: latitude,
            longitude: longitude,
            requiredProviders: techCount
        });

        if (result) {
            // Save request detail in local storage
            localStorage.setItem('currentRequest', JSON.stringify(result));

            // Hide form steps and show success state
            document.querySelectorAll('.request-step').forEach(c => c.classList.remove('active'));
            document.querySelector('.request-progress').style.display = 'none';
            document.getElementById('requestSuccess').classList.add('show');
        }
    } catch (err) {
        console.error('Failed to submit service request:', err);
    }
}

// ===== CHECK LOGIN & FETCH CATEGORIES =====
document.addEventListener('DOMContentLoaded', async function() {
    if (!Auth.checkAuth(['customer'])) {
        return;
    }

    // Set footer date
    const footerDate = document.getElementById('footer-date');
    if (footerDate) {
        footerDate.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    try {
        // Load categories from backend API
        const categories = await api.get('/categories');
        if (categories) {
            categories.forEach(cat => {
                backendCategories[cat.name.toLowerCase()] = cat;
            });

            // Override click handler on static category cards to bind CategoryId Guids
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', function() {
                    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    const catKey = this.dataset.value; // e.g. 'plumbing'
                    let backendCat = backendCategories[catKey];
                    
                    // Match appliance card to appliance repair category
                    if (catKey === 'appliance') {
                        backendCat = backendCategories['appliance repair'];
                    }

                    if (backendCat) {
                        document.getElementById('selectedCategory').value = backendCat.id;
                    } else {
                        // Fallback match by card text
                        const text = this.querySelector('span').textContent.toLowerCase();
                        const fallbackCat = backendCategories[text];
                        if (fallbackCat) {
                            document.getElementById('selectedCategory').value = fallbackCat.id;
                        }
                    }
                });
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
});

// ==========================================
// ✅ LOGOUT - redirects to HOME page
// ==========================================
function handleLogout(event) {
    event.preventDefault();
    Auth.logout();
}