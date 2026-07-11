// ==========================================
// FOOTER-SCRIPT.JS - كود الفوتر
// ==========================================

// ==========================================
// 1. تحديث تاريخ اليوم في الفوتر
// ==========================================
function updateFooterDate() {
    const footerDate = document.getElementById('footer-date');
    if (footerDate) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        footerDate.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ==========================================
// 2. تحديث سنة حقوق النشر تلقائياً
// ==========================================
function updateCopyrightYear() {
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        const now = new Date();
        copyrightYear.textContent = now.getFullYear();
    }
}

// ==========================================
// 3. روابط السوشيال ميديا - فتح في تبويب جديد
// ==========================================
function setupSocialLinks() {
    const socialLinks = document.querySelectorAll('.footer-social a');
    socialLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

// ==========================================
// 4. إضافة تأثير hover على روابط الفوتر
// ==========================================
function setupFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-col ul li a, .footer-bottom-links a');
    footerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

// ==========================================
// 5. Scroll to Top (للرجوع لأعلى الصفحة)
// ==========================================
function setupScrollToTop() {
    // إنشاء زر العودة للأعلى
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.id = 'scrollToTop';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.35);
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(scrollBtn);

    // إظهار/إخفاء الزر عند التمرير
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
            scrollBtn.style.transform = 'translateY(0)';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
            scrollBtn.style.transform = 'translateY(20px)';
        }
    });

    // العودة للأعلى عند الضغط
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // تأثير hover
    scrollBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    scrollBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

// ==========================================
// 6. تتبع روابط الفوتر (للتحليلات)
// ==========================================
function setupFooterTracking() {
    const allFooterLinks = document.querySelectorAll('.footer a');
    allFooterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const text = this.textContent.trim() || 'link';
            console.log(`🔗 Footer link clicked: "${text}" → ${href}`);
            // هنا تقدر تضيف كود تحليلات (مثل Google Analytics)
        });
    });
}

// ==========================================
// 7. تهيئة الفوتر بالكامل
// ==========================================
function initFooter() {
    // تحديث التاريخ
    updateFooterDate();
    
    // تحديث سنة حقوق النشر
    updateCopyrightYear();
    
    // إعداد روابط السوشيال ميديا
    setupSocialLinks();
    
    // إعداد روابط الفوتر
    setupFooterLinks();
    
    // إعداد زر العودة للأعلى
    setupScrollToTop();
    
    // إعداد تتبع الروابط
    setupFooterTracking();
    
    console.log('✅ Footer initialized successfully!');
}

// ==========================================
// 8. تشغيل الكود عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initFooter();
});