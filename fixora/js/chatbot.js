// ==========================================
// CHATBOT.JS - Floating AI Chatbot (Integrated with Backend)
// ==========================================

var chatbotMessages = [];
var isProcessing = false;
var isOpen = false;
var currentUser = null;
var currentAIConversationId = null;

// ==========================================
// CONTEXT MANAGEMENT - لتخزين سياق المحادثة
// ==========================================
var conversationContext = {
    lastCategory: null,
    lastQuestion: null,
    messageHistory: []
};

// ===== CATEGORIES DATA =====
var categories = [
    { id: 'plumbing', name: 'Plumbing', icon: 'fa-faucet', keywords: ['leak', 'pipe', 'faucet', 'water', 'sink', 'toilet', 'drain', 'tap', 'valve'] },
    { id: 'electrical', name: 'Electrical', icon: 'fa-bolt', keywords: ['light', 'flicker', 'wire', 'outlet', 'switch', 'breaker', 'power', 'socket', 'cable'] },
    { id: 'ac-repair', name: 'AC Repair', icon: 'fa-snowflake', keywords: ['ac', 'air', 'cool', 'heat', 'filter', 'compressor', 'fan', 'temperature', 'cold'] },
    { id: 'carpentry', name: 'Carpentry', icon: 'fa-hammer', keywords: ['wood', 'door', 'cabinet', 'furniture', 'drawer', 'shelf', 'frame', 'join'] },
    { id: 'painting', name: 'Painting', icon: 'fa-paint-roller', keywords: ['paint', 'wall', 'color', 'brush', 'roller', 'coat', 'spray', 'texture'] },
    { id: 'masonry', name: 'Masonry', icon: 'fa-trowel', keywords: ['brick', 'cement', 'tile', 'concrete', 'plaster', 'stone', 'block', 'mortar'] },
    { id: 'cleaning', name: 'Cleaning', icon: 'fa-broom', keywords: ['clean', 'dust', 'vacuum', 'mop', 'window', 'floor', 'bathroom', 'kitchen'] },
    { id: 'gardening', name: 'Gardening', icon: 'fa-leaf', keywords: ['garden', 'plant', 'lawn', 'tree', 'flower', 'soil', 'seed', 'sprinkler'] },
    { id: 'appliance', name: 'Appliance Repair', icon: 'fa-tv', keywords: ['fridge', 'oven', 'washer', 'dryer', 'dishwasher', 'microwave', 'stove', 'machine'] },
    { id: 'pest-control', name: 'Pest Control', icon: 'fa-bug', keywords: ['pest', 'bug', 'rat', 'mouse', 'cockroach', 'termite', 'ant', 'spider'] }
];

// ===== RESPONSES =====
var aiResponses = {
    plumbing: {
        greeting: '🔧 I think you need a Plumber!',
        question: 'Is the leak coming from the pipe itself or the connection?',
        action: 'Post Plumbing Request'
    },
    electrical: {
        greeting: '⚡ I think you need an Electrician!',
        question: 'Is the issue with lights, outlets, or the main panel?',
        action: 'Post Electrical Request'
    },
    'ac-repair': {
        greeting: '❄️ I think you need an AC Technician!',
        question: 'Is the AC not cooling at all or is it weak?',
        action: 'Post AC Repair Request'
    },
    carpentry: {
        greeting: '🔨 I think you need a Carpenter!',
        question: 'Is this for a door, cabinet, or furniture?',
        action: 'Post Carpentry Request'
    },
    painting: {
        greeting: '🎨 I think you need a Painter!',
        question: 'Is this for interior or exterior painting?',
        action: 'Post Painting Request'
    },
    masonry: {
        greeting: '🧱 I think you need a Mason!',
        question: 'Is this for a wall, floor, or outdoor structure?',
        action: 'Post Masonry Request'
    },
    cleaning: {
        greeting: '🧹 I think you need a Cleaner!',
        question: 'Is this for a deep clean or regular maintenance?',
        action: 'Post Cleaning Request'
    },
    gardening: {
        greeting: '🌿 I think you need a Gardener!',
        question: 'Is this for lawn care, planting, or garden design?',
        action: 'Post Gardening Request'
    },
    appliance: {
        greeting: '📺 I think you need an Appliance Repair Technician!',
        question: 'Which appliance is having the issue?',
        action: 'Post Appliance Repair Request'
    },
    'pest-control': {
        greeting: '🐜 I think you need Pest Control!',
        question: 'What type of pest are you dealing with?',
        action: 'Post Pest Control Request'
    }
};

// ==========================================
// HELPER: التأكد من وجود currentUser
// ==========================================
function ensureCurrentUser() {
    if (!currentUser) {
        currentUser = {
            id: localStorage.getItem('userEmail') || 'guest',
            name: localStorage.getItem('userName') || 'Guest',
            role: localStorage.getItem('userRole') || 'guest'
        };
    }
    if (!localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', 'guest');
    }
    return currentUser;
}

// ==========================================
// FIND CATEGORY WITH CONTEXT
// ==========================================
function findCategoryWithContext(text) {
    var lowerText = text.toLowerCase();
    var scores = [];

    categories.forEach(function(cat) {
        var score = 0;
        cat.keywords.forEach(function(keyword) {
            if (lowerText.includes(keyword)) {
                score += 2;
            }
        });
        cat.keywords.forEach(function(keyword) {
            if (lowerText.split(' ').includes(keyword)) {
                score += 3;
            }
        });
        scores.push({ category: cat, score: score });
    });

    scores.sort(function(a, b) { return b.score - a.score; });

    var bestMatch = scores[0];
    
    // ✅ استخدام السياق لو النقاط قليلة (أقل من 3)
    if (bestMatch && bestMatch.score < 3 && conversationContext.lastCategory) {
        console.log('Using previous category (low score):', conversationContext.lastCategory.name);
        return conversationContext.lastCategory;
    }
    
    // ✅ استخدام السياق لو النقاط صفر
    if (bestMatch && bestMatch.score === 0 && conversationContext.lastCategory) {
        console.log('Using previous category (no keywords):', conversationContext.lastCategory.name);
        return conversationContext.lastCategory;
    }

    // ✅ حفظ التصنيف الحالي للسياق
    if (bestMatch && bestMatch.score > 0) {
        conversationContext.lastCategory = bestMatch.category;
    }

    return bestMatch && bestMatch.score > 0 ? bestMatch.category : null;
}

// ==========================================
// GENERATE AI RESPONSE WITH CONTEXT
// ==========================================
function generateAIResponseWithContext(userMessage, matchedCategory) {
    ensureCurrentUser();
    var role = (currentUser && currentUser.role) ? currentUser.role : 'guest';
    var text = '';
    var action = null;
    
    // ✅ التحقق من السياق: هل المستخدم بيأكد على حاجة؟
    var isConfirmation = userMessage.toLowerCase().includes('yes') || 
                         userMessage.toLowerCase().includes('yeah') ||
                         userMessage.toLowerCase().includes('the pipe') ||
                         userMessage.toLowerCase().includes('problem') ||
                         userMessage.toLowerCase().includes('leak') ||
                         userMessage.toLowerCase().includes('connection') ||
                         userMessage.toLowerCase().includes('fix') ||
                         userMessage.toLowerCase().includes('repair');
    
    // ✅ التحقق من السياق: هل المستخدم جاوب على سؤال؟
    var isAnsweringQuestion = conversationContext.lastQuestion && 
                              (userMessage.toLowerCase().includes('pipe') || 
                               userMessage.toLowerCase().includes('connection') ||
                               userMessage.toLowerCase().includes('yes') ||
                               userMessage.toLowerCase().includes('no') ||
                               userMessage.toLowerCase().includes('leak') ||
                               userMessage.toLowerCase().includes('problem') ||
                               userMessage.toLowerCase().includes('fix'));
    
    if (matchedCategory) {
        var response = aiResponses[matchedCategory.id] || aiResponses.plumbing;
        
        // ✅ لو المستخدم جاوب على السؤال
        if (isAnsweringQuestion && conversationContext.lastQuestion) {
            text = '✅ Got it! Based on your response:\n\n' +
                   '📋 Service: ' + matchedCategory.name + '\n' +
                   '💰 Estimated cost: 150-350 EGP\n' +
                   '⏱️ Time: 1-3 hours\n\n' +
                   '🔧 Ready to post your request?';
            action = {
                type: 'post-request',
                categoryId: matchedCategory.id,
                label: 'Post Request Now'
            };
            conversationContext.lastQuestion = null; // إعادة تعيين السؤال
        }
        // ✅ لو المستخدم بيأكد على المشكلة
        else if (isConfirmation && conversationContext.lastCategory) {
            text = '✅ Understood! Let me help with your ' + matchedCategory.name + ' issue.\n\n' +
                   '📋 Service: ' + matchedCategory.name + '\n' +
                   '💰 Estimated cost: 150-350 EGP\n' +
                   '⏱️ Time: 1-3 hours\n\n' +
                   '🔄 Would you like to post a request now?';
            action = {
                type: 'post-request',
                categoryId: matchedCategory.id,
                label: 'Post Request'
            };
        }
        // ✅ أول مرة يذكر المشكلة (Customer)
        else if (role === 'customer') {
            text = response.greeting + '\n\n' + response.question;
            conversationContext.lastQuestion = response.question;
            action = {
                type: 'post-request',
                categoryId: matchedCategory.id,
                label: response.action || 'Post Request'
            };
        }
        // ✅ Provider أو Company
        else if (role === 'provider' || role === 'company') {
            text = '📊 ' + matchedCategory.name + ' Service\n\n' +
                   'This is a high-demand service category.\n' +
                   '💡 Customers often ask about: ' + response.question + '\n' +
                   '📈 Average rate: 100-200 EGP/hour';
            action = {
                type: 'view-category',
                categoryId: matchedCategory.id,
                label: 'View Category'
            };
        }
        // ✅ Guest
        else {
            text = '🔍 I found a matching category: ' + matchedCategory.name + '\n\n' +
                   response.greeting + '\n' +
                   response.question + '\n\n' +
                   '💡 Sign in to post a request or accept jobs!';
            action = {
                type: 'login',
                label: 'Sign In'
            };
        }
    } else {
        if (role === 'provider' || role === 'company') {
            text = '📊 I couldn\'t find a specific category for this query.\n\n' +
                   '💡 Try asking about: "What customers need most" or "Popular services"';
        } else {
            text = '🤔 I\'m not sure what category this falls under. Can you tell me more details?';
        }
    }
    
    return { text: text, action: action };
}

// ==========================================
// AI CHATBOT - Backend Integration
// ==========================================

/**
 * إنشاء محادثة جديدة في الـ Backend
 */
async function createAIConversation(title) {
    try {
        const response = await api.post('/ai-conversations', {
            request: {
                title: title || 'Chatbot Conversation',
                suggestedCategoryId: null
            }
        });
        return response;
    } catch (error) {
        console.error('Failed to create AI conversation:', error);
        return null;
    }
}

/**
 * إرسال رسالة إلى الـ Backend والحصول على رد
 */
async function sendAIMessage(conversationId, content, suggestedCategoryId = null) {
    try {
        // 1. إرسال رسالة المستخدم
        const userMessage = await api.post(`/ai-conversations/${conversationId}/messages`, {
            request: {
                role: 1,
                content: content,
                suggestedCategoryId: suggestedCategoryId || null
            }
        });

        // 2. معالجة الرسالة في الـ Backend
        const aiResponse = await processWithBackendAI(conversationId, content);
        
        return aiResponse;
    } catch (error) {
        console.error('Failed to send AI message:', error);
        return null;
    }
}

/**
 * معالجة الرسالة في الـ Backend
 */
async function processWithBackendAI(conversationId, userMessage) {
    try {
        ensureCurrentUser();
        
        // ✅ استخدام السياق في التصنيف
        const matchedCategory = findCategoryWithContext(userMessage);
        const response = generateAIResponseWithContext(userMessage, matchedCategory);
        
        // حفظ رد الـ Assistant في الـ Backend
        const assistantMessage = await api.post(`/ai-conversations/${conversationId}/messages`, {
            request: {
                role: 2,
                content: response.text,
                suggestedCategoryId: matchedCategory?.id || null,
                metadataJson: JSON.stringify({
                    category: matchedCategory,
                    action: response.action,
                    role: currentUser?.role || 'guest',
                    context: conversationContext.messageHistory.slice(-5)
                })
            }
        });
        
        // ✅ حفظ السياق
        conversationContext.messageHistory.push({
            role: 'user',
            content: userMessage
        });
        conversationContext.messageHistory.push({
            role: 'assistant',
            content: response.text
        });
        
        return {
            text: response.text,
            category: matchedCategory,
            action: response.action,
            message: assistantMessage
        };
    } catch (error) {
        console.error('AI processing failed:', error);
        return null;
    }
}

/**
 * تحميل محادثات المستخدم السابقة
 */
async function loadUserConversations() {
    try {
        const response = await api.get('/ai-conversations?pageSize=10');
        return response.items || [];
    } catch (error) {
        console.error('Failed to load conversations:', error);
        return [];
    }
}

async function loadConversationMessages(conversationId) {
    try {
        const response = await api.get(`/ai-conversations/${conversationId}`);
        return response.messages || [];
    } catch (error) {
        console.error('Failed to load messages:', error);
        return [];
    }
}

async function loadExistingConversation() {
    const savedId = localStorage.getItem('chatbotConversationId');
    if (savedId) {
        try {
            const messages = await loadConversationMessages(savedId);
            if (messages && messages.length > 0) {
                const container = document.getElementById('chatbotWindowMessages');
                if (!container) return;
                
                const welcomeMsg = container.querySelector('.message:first-child');
                container.innerHTML = '';
                if (welcomeMsg) container.appendChild(welcomeMsg);
                
                messages.forEach(function(msg) {
                    if (msg.role === 1) { // User
                        addFloatingMessage(msg.content, 'sent');
                    } else if (msg.role === 2) { // Assistant
                        var extra = null;
                        if (msg.metadataJson) {
                            try {
                                var meta = JSON.parse(msg.metadataJson);
                                if (meta.category) {
                                    extra = {
                                        category: meta.category,
                                        action: meta.action
                                    };
                                }
                            } catch(e) {}
                        }
                        addFloatingMessage(msg.content, 'received', extra);
                    }
                });
                
                currentAIConversationId = savedId;
            }
        } catch (error) {
            console.error('Failed to load existing conversation:', error);
        }
    }
}

/**
 * تنفيذ إجراءات الـ Chatbot
 */
function handleChatbotAction(action) {
    if (!action) return;
    
    switch (action.type) {
        case 'post-request':
            if (action.categoryId) {
                localStorage.setItem('selectedCategory', action.categoryId);
                window.location.href = 'post-request.html';
            }
            break;
            
        case 'view-category':
            if (action.categoryId) {
                var category = categories.find(function(c) { return c.id === action.categoryId; });
                if (category) {
                    addFloatingMessage(
                        '📊 ' + category.name + ' Service\n\n' +
                        'This is a professional service category.\n' +
                        '💡 Make sure you have the right experience.\n' +
                        '📈 Market demand: High',
                        'received'
                    );
                }
            }
            break;
            
        case 'login':
            window.location.href = 'login.html';
            break;
            
        default:
            console.log('Unknown action:', action);
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    ensureCurrentUser();
    createFloatingChatbot();
    initAIChatNotifications();
});

// ==========================================
// CREATE FLOATING CHATBOT
// ==========================================
function createFloatingChatbot() {
    if (document.getElementById('floatingChatbot')) return;

    var container = document.createElement('div');
    container.id = 'floatingChatbot';
    container.innerHTML = `
        <!-- Toggle Button -->
        <button class="chatbot-toggle" id="chatbotToggle" onclick="toggleChatbot()">
            <i class="fas fa-robot"></i>
            <span class="chatbot-badge">1</span>
        </button>

        <!-- Chat Window -->
        <div class="chatbot-window" id="chatbotWindow">
            <!-- Header -->
            <div class="chatbot-window-header">
                <div class="header-info">
                    <i class="fas fa-robot"></i>
                    <div>
                        <h4>AI Assistant</h4>
                        <span id="chatbotRoleStatus">Online</span>
                    </div>
                </div>
                <button class="header-close" onclick="toggleChatbot()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Messages -->
            <div class="chatbot-window-messages" id="chatbotWindowMessages">
                <div class="message received">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-bubble">
                        <p>👋 Hello! I'm Fixora AI Assistant.</p>
                        <p id="chatbotWelcomeMessage">Tell me what problem you're facing, and I'll help you find the right solution.</p>
                        <p style="margin-top: 8px; font-size: 0.8rem; color: var(--text-light);">
                            <i class="fas fa-lightbulb"></i> Try: "My kitchen sink is leaking"
                        </p>
                    </div>
                </div>
            </div>

            <!-- Quick Suggestions -->
            <div class="chatbot-quick-suggestions" id="chatbotQuickSuggestions">
                <button class="suggestion-btn" onclick="sendQuickSuggestion('My kitchen sink is leaking water everywhere')">
                    <i class="fas fa-faucet"></i> Leaking Sink
                </button>
                <button class="suggestion-btn" onclick="sendQuickSuggestion('The AC is not cooling at all')">
                    <i class="fas fa-snowflake"></i> AC Not Cooling
                </button>
                <button class="suggestion-btn" onclick="sendQuickSuggestion('The lights keep flickering')">
                    <i class="fas fa-bolt"></i> Flickering Lights
                </button>
                ${(currentUser && (currentUser.role === 'provider' || currentUser.role === 'company')) ? `
                <button class="suggestion-btn" onclick="sendQuickSuggestion('I want to know what customers need most')" style="border-color: var(--accent);">
                    <i class="fas fa-chart-line"></i> Customer Needs
                </button>
                ` : ''}
            </div>

            <!-- Input -->
            <div class="chatbot-window-input">
                <input type="text" id="chatbotFloatingInput" placeholder="${(currentUser && (currentUser.role === 'provider' || currentUser.role === 'company')) ? 'Ask about customer needs...' : 'Describe your problem...'}" onkeypress="handleFloatingKeyPress(event)" />
                <button class="btn-send" onclick="sendFloatingMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>

            <!-- Typing Indicator -->
            <div class="typing-indicator" id="floatingTyping" style="display:none;">
                <div class="dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="text">AI is thinking...</span>
            </div>
        </div>
    `;

    document.body.appendChild(container);
    updateRoleUI();
    addChatbotStyles();
}

// ==========================================
// UPDATE ROLE UI
// ==========================================
function updateRoleUI() {
    ensureCurrentUser();
    var role = (currentUser && currentUser.role) ? currentUser.role : 'guest';
    var statusEl = document.getElementById('chatbotRoleStatus');
    var welcomeEl = document.getElementById('chatbotWelcomeMessage');

    if (role === 'customer') {
        if (statusEl) statusEl.textContent = '🟢 Ready to help';
        if (welcomeEl) welcomeEl.textContent = 'Tell me what problem you\'re facing in your home, and I\'ll help you find the right service category.';
    } else if (role === 'provider' || role === 'company') {
        if (statusEl) statusEl.textContent = '🔵 Provider Support';
        if (welcomeEl) welcomeEl.textContent = 'I can help you understand customer needs and common issues. Ask me about popular services or problems.';
    } else {
        if (statusEl) statusEl.textContent = '🟡 Guest Mode';
        if (welcomeEl) welcomeEl.textContent = 'Try the AI assistant to see how it works! Describe a problem and I\'ll suggest the right service.';
    }
}

// ==========================================
// ADD STYLES
// ==========================================
function addChatbotStyles() {
    var style = document.createElement('style');
    style.id = 'chatbotFloatingStyles';
    style.textContent = `
        /* ===== Floating Chatbot ===== */
        #floatingChatbot {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
        }

        /* ===== Toggle Button ===== */
        .chatbot-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--gradient-primary);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            position: relative;
        }

        .chatbot-toggle:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
        }

        .chatbot-toggle .chatbot-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #ef4444;
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* ===== Chat Window ===== */
        .chatbot-window {
            position: absolute;
            bottom: 75px;
            right: 0;
            width: 380px;
            max-width: calc(100vw - 40px);
            height: 500px;
            max-height: calc(100vh - 150px);
            background: var(--bg-card);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            border: 1px solid var(--border);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }

        .chatbot-window.open {
            display: flex;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ===== Header ===== */
        .chatbot-window-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            background: var(--gradient-primary);
            color: white;
            flex-shrink: 0;
        }

        .chatbot-window-header .header-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .chatbot-window-header .header-info i {
            font-size: 1.4rem;
        }

        .chatbot-window-header .header-info h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 700;
        }

        .chatbot-window-header .header-info span {
            font-size: 0.7rem;
            opacity: 0.9;
        }

        .header-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 8px;
            transition: 0.3s;
        }

        .header-close:hover {
            background: rgba(255,255,255,0.15);
        }

        /* ===== Messages ===== */
        .chatbot-window-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: var(--bg-primary);
        }

        .chatbot-window-messages::-webkit-scrollbar {
            width: 4px;
        }

        .chatbot-window-messages::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
        }

        .chatbot-window-messages .message {
            display: flex;
            gap: 10px;
            animation: messageIn 0.3s ease;
        }

        .chatbot-window-messages .message.received {
            align-self: flex-start;
        }

        .chatbot-window-messages .message.sent {
            align-self: flex-end;
            flex-direction: row-reverse;
        }

        .chatbot-window-messages .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.85rem;
            flex-shrink: 0;
        }

        .chatbot-window-messages .message.sent .message-avatar {
            background: var(--bg-card);
            color: var(--text-secondary);
            border: 1px solid var(--border);
        }

        .chatbot-window-messages .message-bubble {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 14px;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .chatbot-window-messages .message.received .message-bubble {
            background: var(--bg-card);
            color: var(--text-primary);
            border: 1px solid var(--border);
            border-bottom-left-radius: 4px;
        }

        .chatbot-window-messages .message.sent .message-bubble {
            background: var(--gradient-primary);
            color: white;
            border-bottom-right-radius: 4px;
        }

        .chatbot-window-messages .message-bubble p {
            margin: 0;
        }

        .chatbot-window-messages .message-bubble .category-tag {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 60px;
            background: rgba(102, 126, 234, 0.15);
            color: var(--accent);
            font-weight: 700;
            font-size: 0.75rem;
            margin-top: 6px;
            cursor: pointer;
            transition: var(--transition);
        }

        .chatbot-window-messages .message-bubble .category-tag:hover {
            background: var(--accent);
            color: white;
        }

        .chatbot-window-messages .message-bubble .role-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 60px;
            font-size: 0.65rem;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .chatbot-window-messages .message-bubble .role-badge.customer {
            background: #dbeafe;
            color: #1e40af;
        }

        .chatbot-window-messages .message-bubble .role-badge.provider {
            background: #fef3c7;
            color: #b45309;
        }

        .chatbot-window-messages .message-bubble .role-badge.company {
            background: #e0e7ff;
            color: #4338ca;
        }

        .chatbot-window-messages .message-bubble .role-badge.admin {
            background: #fce4ec;
            color: #c62828;
        }

        .chatbot-window-messages .message-bubble .role-badge.guest {
            background: #e5e7eb;
            color: #6b7280;
        }

        @keyframes messageIn {
            from { opacity: 0; transform: translateY(8px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ===== Quick Suggestions ===== */
        .chatbot-quick-suggestions {
            display: flex;
            gap: 6px;
            padding: 8px 12px;
            border-top: 1px solid var(--border);
            background: var(--bg-secondary);
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        .chatbot-quick-suggestions .suggestion-btn {
            padding: 4px 12px;
            border-radius: 60px;
            border: 1px solid var(--border);
            background: var(--bg-primary);
            color: var(--text-secondary);
            font-size: 0.7rem;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }

        .chatbot-quick-suggestions .suggestion-btn:hover {
            border-color: var(--accent);
            color: var(--accent);
            background: rgba(102, 126, 234, 0.06);
        }

        /* ===== Input ===== */
        .chatbot-window-input {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            border-top: 1px solid var(--border);
            background: var(--bg-secondary);
            flex-shrink: 0;
        }

        .chatbot-window-input input {
            flex: 1;
            padding: 8px 12px;
            border: 2px solid var(--border);
            border-radius: 10px;
            font-size: 0.9rem;
            font-family: 'Inter', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            outline: none;
            transition: var(--transition);
        }

        .chatbot-window-input input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.08);
        }

        .chatbot-window-input .btn-send {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: none;
            background: var(--gradient-primary);
            color: white;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .chatbot-window-input .btn-send:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.35);
        }

        /* ===== Typing Indicator ===== */
        .typing-indicator {
            display: none;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            flex-shrink: 0;
        }

        .typing-indicator .dots {
            display: flex;
            gap: 4px;
        }

        .typing-indicator .dots span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--text-light);
            animation: typingDot 1.4s infinite;
        }

        .typing-indicator .dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator .dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
        }

        .typing-indicator .text {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        /* ===== Responsive ===== */
        @media (max-width: 480px) {
            .chatbot-window {
                width: calc(100vw - 20px);
                right: 0;
                bottom: 70px;
                height: 450px;
            }
            #floatingChatbot {
                bottom: 15px;
                right: 15px;
            }
            .chatbot-toggle {
                width: 52px;
                height: 52px;
                font-size: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// TOGGLE CHATBOT
// ==========================================
function toggleChatbot() {
    var window = document.getElementById('chatbotWindow');
    var toggle = document.getElementById('chatbotToggle');
    isOpen = !isOpen;
    
    window.classList.toggle('open', isOpen);
    toggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-robot"></i><span class="chatbot-badge">1</span>';
    
    if (isOpen) {
        var input = document.getElementById('chatbotFloatingInput');
        setTimeout(function() { 
            if (input) input.focus(); 
        }, 300);
        
        loadExistingConversation();
    }
}

// ==========================================
// SEND MESSAGE
// ==========================================
function sendFloatingMessage() {
    var input = document.getElementById('chatbotFloatingInput');
    if (!input) {
        console.warn('Chatbot input not found');
        return;
    }
    
    var text = input.value.trim();
    if (!text || isProcessing) return;

    addFloatingMessage(text, 'sent');
    input.value = '';

    ensureCurrentUser();

    processWithAI(text);
}

function handleFloatingKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendFloatingMessage();
    }
}

function sendQuickSuggestion(text) {
    if (!isOpen) {
        toggleChatbot();
        setTimeout(function() {
            var input = document.getElementById('chatbotFloatingInput');
            if (input) {
                input.value = text;
                sendFloatingMessage();
            }
        }, 300);
    } else {
        var input = document.getElementById('chatbotFloatingInput');
        if (input) {
            input.value = text;
            sendFloatingMessage();
        }
    }
}

// ==========================================
// ADD MESSAGE
// ==========================================
function addFloatingMessage(text, type, extra) {
    var container = document.getElementById('chatbotWindowMessages');
    if (!container) {
        console.warn('Chatbot container not found');
        return;
    }
    
    // ✅ منع تكرار الرسائل المتطابقة
    var existingMessages = container.querySelectorAll('.message-bubble');
    var lastMessage = existingMessages.length > 0 ? existingMessages[existingMessages.length - 1] : null;
    if (lastMessage && lastMessage.textContent.trim() === text.trim()) {
        console.log('Duplicate message detected, skipping...');
        return;
    }
    
    var time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;
    
    var avatar = type === 'sent' 
        ? '<div class="message-avatar"><i class="fas fa-user"></i></div>'
        : '<div class="message-avatar"><i class="fas fa-robot"></i></div>';
    
    var roleBadge = '';
    if (type === 'sent') {
        ensureCurrentUser();
        var role = (currentUser && currentUser.role) ? currentUser.role : 'guest';
        
        var roleLabels = {
            'customer': 'Customer',
            'provider': 'Provider',
            'company': 'Company',
            'admin': 'Admin',
            'guest': 'Guest'
        };
        var roleClasses = {
            'customer': 'customer',
            'provider': 'provider',
            'company': 'company',
            'admin': 'admin',
            'guest': 'guest'
        };
        
        var label = roleLabels[role] || 'Guest';
        var cssClass = roleClasses[role] || 'guest';
        roleBadge = '<span class="role-badge ' + cssClass + '">' + label + '</span>';
    }
    
    var extraHtml = '';
    if (extra) {
        if (extra.category) {
            var categoryId = extra.category.id || extra.category;
            var categoryName = extra.category.name || extra.category;
            var categoryIcon = extra.category.icon || 'fa-tag';
            
            var actionText = '';
            if (currentUser && currentUser.role === 'customer') {
                actionText = 'Post Request';
            } else if (currentUser && (currentUser.role === 'provider' || currentUser.role === 'company')) {
                actionText = 'View Category';
            } else {
                actionText = 'Learn More';
            }
            
            extraHtml = '<div class="category-tag" onclick="handleCategoryClick(\'' + categoryId + '\')">' +
                '<i class="fas ' + categoryIcon + '"></i> ' + categoryName + ' → ' + actionText +
            '</div>';
        }
        if (extra.action) {
            var actionJson = JSON.stringify(extra.action).replace(/"/g, '&quot;');
            extraHtml += '<div class="category-tag" onclick="handleChatbotAction(' + actionJson + ')" style="display:inline-block;margin-top:4px;background:var(--gradient-primary);color:white;">' +
                '<i class="fas fa-arrow-right"></i> ' + (extra.action.label || 'Proceed') +
            '</div>';
        }
    }
    
    var safeText = text ? text.replace(/\n/g, '<br>') : '';
    
    messageDiv.innerHTML = 
        avatar +
        '<div class="message-bubble">' +
            roleBadge +
            safeText +
            extraHtml +
            '<span style="display:block;font-size:0.65rem;opacity:0.5;margin-top:4px;">' + time + '</span>' +
        '</div>';
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// ==========================================
// HANDLE CATEGORY CLICK
// ==========================================
function handleCategoryClick(categoryId) {
    ensureCurrentUser();
    var role = (currentUser && currentUser.role) ? currentUser.role : 'guest';
    var category = categories.find(function(c) { return c.id === categoryId; });
    
    if (!category) return;
    
    if (role === 'customer') {
        localStorage.setItem('selectedCategory', categoryId);
        window.location.href = 'post-request.html';
    } else if (role === 'provider' || role === 'company') {
        addFloatingMessage(
            '📊 Category: ' + category.name + '\n\n' +
            'This service is one of the most requested by customers.\n' +
            '💡 Tip: Make sure you have the right tools and experience.\n' +
            '📈 Demand: High',
            'received'
        );
        
        if (currentAIConversationId) {
            api.post('/ai-conversations/' + currentAIConversationId + '/messages', {
                request: {
                    role: 2,
                    content: 'User viewed category: ' + category.name,
                    suggestedCategoryId: categoryId,
                    metadataJson: JSON.stringify({
                        action: 'view-category',
                        category: category
                    })
                }
            }).catch(console.error);
        }
    } else {
        addFloatingMessage(
            '📋 ' + category.name + '\n\n' +
            'This is a popular service category on Fixora.\n' +
            '🔐 Sign in to post a request or accept jobs.',
            'received'
        );
    }
}

// ==========================================
// PROCESS WITH AI (Main Logic)
// ==========================================
async function processWithAI(text) {
    isProcessing = true;
    showFloatingTyping();

    try {
        ensureCurrentUser();

        if (!currentAIConversationId) {
            var conversation = await createAIConversation('Chat with AI Assistant');
            if (conversation) {
                currentAIConversationId = conversation.id;
                localStorage.setItem('chatbotConversationId', currentAIConversationId);
            } else {
                processWithMockAI(text);
                hideFloatingTyping();
                isProcessing = false;
                return;
            }
        }

        var response = await sendAIMessage(currentAIConversationId, text);
        
        hideFloatingTyping();
        
        if (response && response.text) {
            addFloatingMessage(response.text, 'received', {
                category: response.category,
                action: response.action
            });
        } else {
            processWithMockAI(text);
        }
    } catch (error) {
        console.error('AI processing error:', error);
        hideFloatingTyping();
        processWithMockAI(text);
    }

    isProcessing = false;
}

// ==========================================
// MOCK AI PROCESSING (Fallback)
// ==========================================
function processWithMockAI(text) {
    var matchedCategory = findCategoryWithContext(text);
    ensureCurrentUser();
    var role = (currentUser && currentUser.role) ? currentUser.role : 'guest';
    
    if (matchedCategory) {
        var response = aiResponses[matchedCategory.id] || aiResponses.plumbing;
        
        var categoryText = '';
        var extra = {
            category: matchedCategory,
            name: matchedCategory.name,
            icon: matchedCategory.icon
        };
        
        // ✅ التحقق من السياق في Mock
        var isAnsweringQuestion = conversationContext.lastQuestion && 
                                  (text.toLowerCase().includes('pipe') || 
                                   text.toLowerCase().includes('connection') ||
                                   text.toLowerCase().includes('yes') ||
                                   text.toLowerCase().includes('no') ||
                                   text.toLowerCase().includes('leak') ||
                                   text.toLowerCase().includes('problem') ||
                                   text.toLowerCase().includes('fix'));
        
        if (isAnsweringQuestion && conversationContext.lastQuestion) {
            categoryText = '✅ Got it! Based on your response:\n\n' +
                   '📋 Service: ' + matchedCategory.name + '\n' +
                   '💰 Estimated cost: 150-350 EGP\n' +
                   '⏱️ Time: 1-3 hours\n\n' +
                   '🔧 Ready to post your request?';
            extra.action = {
                type: 'post-request',
                categoryId: matchedCategory.id,
                label: 'Post Request Now'
            };
            conversationContext.lastQuestion = null;
        }
        else if (role === 'customer') {
            categoryText = response.greeting + '\n\n' + response.question;
            conversationContext.lastQuestion = response.question;
            extra.action = {
                type: 'post-request',
                categoryId: matchedCategory.id,
                label: response.action || 'Post Request'
            };
        } else if (role === 'provider' || role === 'company') {
            categoryText = '📊 ' + matchedCategory.name + ' Service\n\n' +
                'This is a high-demand service category.\n' +
                '💡 Customers often ask about: ' + response.question + '\n' +
                '📈 Average rate: 100-200 EGP/hour';
        } else {
            categoryText = '🔍 I found a matching category: ' + matchedCategory.name + '\n\n' +
                response.greeting + '\n' +
                response.question + '\n\n' +
                '💡 Sign in to post a request or accept jobs!';
            extra.action = {
                type: 'login',
                label: 'Sign In'
            };
        }
        
        addFloatingMessage(categoryText, 'received', extra);
    } else {
        if (role === 'provider' || role === 'company') {
            addFloatingMessage(
                '📊 I couldn\'t find a specific category for this query.\n\n' +
                '💡 Try asking about: "What customers need most" or "Popular services"',
                'received'
            );
        } else {
            addFloatingMessage('🤔 I\'m not sure what category this falls under. Can you tell me more details?', 'received');
        }
    }
}

// ==========================================
// TYPING INDICATOR
// ==========================================
function showFloatingTyping() {
    var indicator = document.getElementById('floatingTyping');
    if (indicator) indicator.style.display = 'flex';
}

function hideFloatingTyping() {
    var indicator = document.getElementById('floatingTyping');
    if (indicator) indicator.style.display = 'none';
}

// ==========================================
// INIT AI CHAT NOTIFICATIONS (SignalR)
// ==========================================
function initAIChatNotifications() {
    if (typeof RealTime === "undefined") {
        console.warn('RealTime not available for AI notifications');
        return;
    }
    
    try {
        var connection = RealTime.createConnection("hubs/ai");
        if (connection) {
            connection.on("AIMessageReceived", function(data) {
                console.log("AI message received:", data);
                
                if (data.conversationId === currentAIConversationId) {
                    addFloatingMessage(data.content, 'received', {
                        category: data.category,
                        action: data.action
                    });
                }
            });
            
            RealTime.startConnection("hubs/ai").catch(function(err) {
                console.error("Failed to start AI Hub connection:", err);
            });
        }
    } catch (error) {
        console.error("Failed to initialize AI notifications:", error);
    }
}

// ==========================================
// GO TO POST REQUEST
// ==========================================
function goToPostRequest(categoryId) {
    localStorage.setItem('selectedCategory', categoryId);
    window.location.href = 'post-request.html';
}

// ==========================================
// LOGOUT
// ==========================================
function handleLogout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentExecution');
    localStorage.removeItem('currentOrderDetails');
    localStorage.removeItem('currentRequest');
    localStorage.removeItem('chatbotConversationId');
    window.location.href = 'index.html';
}

// ==========================================
// EXPOSE FUNCTIONS GLOBALLY
// ==========================================
window.toggleChatbot = toggleChatbot;
window.sendFloatingMessage = sendFloatingMessage;
window.handleFloatingKeyPress = handleFloatingKeyPress;
window.sendQuickSuggestion = sendQuickSuggestion;
window.goToPostRequest = goToPostRequest;
window.handleCategoryClick = handleCategoryClick;
window.handleLogout = handleLogout;
window.handleChatbotAction = handleChatbotAction;