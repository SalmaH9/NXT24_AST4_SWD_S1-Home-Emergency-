// ==========================================
// SCHEDULE.JS - جدول مواعيد مقدم الخدمة (بيانات حقيقية من الـ API)
// ==========================================
// كان قبل كده بيانات وهمية مكتوبة في الـ HTML (أسماء مخترعة).
// دلوقتي بيبني الجدول من العروض المقبولة + مواعيد التنفيذ الحقيقية.
//
// الترتيب في الـ HTML:
//   config.js → tokenManager.js → loading.js → errorHandler.js
//   → api.js → auth.js → script.js → footer.js → schedule.js

var scheduleJobs = [];      // كل المواعيد المحمّلة
var currentDay = 'today';
var categoriesMap = {};     // categoryId → name

// أيقونة حسب التصنيف
function iconForService(name) {
    var n = (name || '').toLowerCase();
    if (n.includes('plumb')) return 'fa-faucet';
    if (n.includes('electric')) return 'fa-bolt';
    if (n.includes('ac') || n.includes('air') || n.includes('cool')) return 'fa-snowflake';
    if (n.includes('carpen')) return 'fa-hammer';
    if (n.includes('paint')) return 'fa-paint-roller';
    return 'fa-wrench';
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async function () {
    if (!Auth.checkAuth(['provider', 'company'])) return;

    try {
        await loadCategories();
        await loadSchedule();
    } catch (err) {
        console.error('Failed to load schedule:', err);
    }

    bindDayTabs();
    renderSchedule(currentDay);
});

async function loadCategories() {
    try {
        var cats = await api.get('/categories', { showLoader: false });
        (cats || []).forEach(function (c) { categoriesMap[c.id] = c.name; });
    } catch (e) {
        console.warn('Could not load categories:', e);
    }
}

// ==========================================
// تحميل المواعيد الحقيقية
// ==========================================
// المنطق: نجيب عروض المزوّد المقبولة → نجيب تفاصيل كل طلب
// → نجيب موعد التنفيذ (StartedAt) لو موجود.
async function loadSchedule() {
    var offers = await api.get('/provider-offers/my-offers');
    if (!offers || !offers.length) {
        scheduleJobs = [];
        return;
    }

    // العروض المقبولة بس هي اللي بتبقى مواعيد فعلية
    var accepted = offers.filter(function (o) { return o.isAccepted; });

    var jobs = await Promise.all(accepted.map(async function (offer) {
        var request = null, execution = null, customerName = null;

        try {
            request = await api.get('/service-requests/' + offer.serviceRequestId, { showLoader: false });
        } catch (e) { return null; }
        if (!request) return null;

        // موعد التنفيذ الحقيقي (ServiceExecutionDto.startedAt)
        try {
            execution = await api.get('/service-requests/' + offer.serviceRequestId + '/execution', { showLoader: false });
        } catch (e) { /* لسه مابدأش — عادي */ }

        // اسم العميل الحقيقي بدل الـ GUID
        try {
            var profile = await api.get('/Profile/' + request.customerId, { showLoader: false });
            customerName = profile ? profile.fullName : null;
        } catch (e) { /* تجاهل */ }

        // ⚠️ ServiceRequestDto مفيهوش CreatedAt، فبنعتمد على وقت التنفيذ.
        //    لو لسه مابدأش، الموعد يعتبر غير مجدول.
        var when = execution && execution.startedAt ? new Date(execution.startedAt) : null;

        return {
            requestId: request.id,
            date: when,
            customer: customerName || ('Customer #' + request.customerId.substring(0, 5).toUpperCase()),
            service: categoriesMap[request.categoryId] || 'Service',
            location: request.address || 'No address provided',
            status: request.status,
            isCompleted: execution ? execution.isCompleted : false
        };
    }));

    scheduleJobs = jobs.filter(Boolean);
}

// ==========================================
// فلترة حسب اليوم
// ==========================================
function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

function jobsForDay(day) {
    var now = new Date();
    var target = new Date(now);

    if (day === 'today') {
        // خلاص target = النهاردة
    } else if (day === 'tomorrow') {
        target.setDate(now.getDate() + 1);
    } else {
        // wed / thu / fri → أقرب يوم قادم بالاسم ده
        var map = { wed: 3, thu: 4, fri: 5 };
        var wanted = map[day];
        if (wanted === undefined) return [];
        var diff = (wanted - now.getDay() + 7) % 7;
        target.setDate(now.getDate() + diff);
    }

    return scheduleJobs.filter(function (j) {
        return j.date && sameDay(j.date, target);
    });
}

// ==========================================
// العرض
// ==========================================
function renderSchedule(day) {
    var container = document.getElementById('scheduleList');
    if (!container) return;

    updateStats();

    var items = jobsForDay(day).sort(function (a, b) { return a.date - b.date; });

    if (items.length === 0) {
        container.innerHTML =
            '<div style="text-align:center; padding:40px 20px; color:var(--text-light);">' +
                '<i class="fas fa-calendar-xmark" style="font-size:2.5rem; display:block; margin-bottom:12px;"></i>' +
                '<p style="font-weight:600;">No jobs scheduled for this day</p>' +
            '</div>';
        return;
    }

    container.innerHTML = items.map(function (item) {
        var time = item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        var icon = iconForService(item.service);
        var done = item.isCompleted
            ? '<span style="color:#48bb78; font-size:0.8rem; font-weight:600;">✓ Completed</span>'
            : '';

        return '' +
            '<div class="schedule-item">' +
                '<div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">' +
                    '<span class="schedule-time">' + time + '</span>' +
                    '<div class="schedule-info">' +
                        '<h4>' + escapeHtml(item.customer) + ' ' + done + '</h4>' +
                        '<p><i class="fas ' + icon + '" style="color:var(--accent);"></i> ' +
                            escapeHtml(item.service) + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="schedule-location">' +
                    '<i class="fas fa-location-dot"></i> ' + escapeHtml(item.location) +
                '</div>' +
            '</div>';
    }).join('');
}

function updateStats() {
    var now = new Date();

    var todayCount = scheduleJobs.filter(function (j) {
        return j.date && sameDay(j.date, now);
    }).length;

    var weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    var weekCount = scheduleJobs.filter(function (j) {
        return j.date && j.date >= now && j.date <= weekEnd;
    }).length;

    var monthCount = scheduleJobs.filter(function (j) {
        return j.date &&
               j.date.getMonth() === now.getMonth() &&
               j.date.getFullYear() === now.getFullYear();
    }).length;

    var t = document.getElementById('todayJobs');
    var w = document.getElementById('weekJobs');
    var m = document.getElementById('monthJobs');
    if (t) t.textContent = todayCount;
    if (w) w.textContent = weekCount;
    if (m) m.textContent = monthCount;
}

function bindDayTabs() {
    document.querySelectorAll('.day-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.day-tab').forEach(function (t) { t.classList.remove('active'); });
            this.classList.add('active');
            currentDay = this.dataset.day;
            renderSchedule(currentDay);
        });
    });
}

// حماية من HTML injection في بيانات المستخدمين
function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
}

// ==========================================
// LOGOUT
// ==========================================
// ⚠️ النسخة القديمة كانت بتمسح 3 مفاتيح بس وتسيب الـ accessToken في المتصفح.
//    Auth.logout بيمسح كل حاجة صح.
function handleLogout(event) {
    if (event) event.preventDefault();
    Auth.logout();
}

window.handleLogout = handleLogout;