// ==========================================
// CHATBOT.JS - Floating AI Chatbot (All Roles)
// ==========================================

var chatbotMessages = [];
var isProcessing = false;
var isOpen = false;
var currentUser = null;

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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    currentUser = {
        id: localStorage.getItem('userEmail') || 'guest',
        name: localStorage.getItem('userName') || 'Guest',
        role: localStorage.getItem('userRole') || 'guest'
    };

    // ✅ Create chatbot for ALL roles (Customer, Provider, Guest)
    createFloatingChatbot();
});

// ===== CREATE FLOATING CHATBOT =====
function createFloatingChatbot() {
    // Check if already exists
    if (document.getElementById('floatingChatbot')) return;

    // Create container
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
                ${currentUser.role === 'provider' ? `
                <button class="suggestion-btn" onclick="sendQuickSuggestion('I want to know what customers need most')" style="border-color: var(--accent);">
                    <i class="fas fa-chart-line"></i> Customer Needs
                </button>
                ` : ''}
            </div>

            <!-- Input -->
            <div class="chatbot-window-input">
                <input type="text" id="chatbotFloatingInput" placeholder="${currentUser.role === 'provider' ? 'Ask about customer needs...' : 'Describe your problem...'}" onkeypress="handleFloatingKeyPress(event)" />
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

    // Update role-specific UI
    updateRoleUI();

    // Add styles
    addChatbotStyles();
}

// ===== UPDATE ROLE UI =====
function updateRoleUI() {
    var role = currentUser.role;
    var statusEl = document.getElementById('chatbotRoleStatus');
    var welcomeEl = document.getElementById('chatbotWelcomeMessage');

    if (role === 'customer') {
        statusEl.textContent = '🟢 Ready to help';
        welcomeEl.textContent = 'Tell me what problem you\'re facing in your home, and I\'ll help you find the right service category.';
    } else if (role === 'provider') {
        statusEl.textContent = '🔵 Provider Support';
        welcomeEl.textContent = 'I can help you understand customer needs and common issues. Ask me about popular services or problems.';
    } else {
        statusEl.textContent = '🟡 Guest Mode';
        welcomeEl.textContent = 'Try the AI assistant to see how it works! Describe a problem and I\'ll suggest the right service.';
    }
}

// ===== ADD STYLES =====
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

// ===== TOGGLE CHATBOT =====
function toggleChatbot() {
    var window = document.getElementById('chatbotWindow');
    var toggle = document.getElementById('chatbotToggle');
    isOpen = !isOpen;
    
    window.classList.toggle('open', isOpen);
    toggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-robot"></i><span class="chatbot-badge">1</span>';
    
    if (isOpen) {
        var input = document.getElementById('chatbotFloatingInput');
        setTimeout(function() { input.focus(); }, 300);
    }
}

// ===== SEND MESSAGE =====
function sendFloatingMessage() {
    var input = document.getElementById('chatbotFloatingInput');
    var text = input.value.trim();

    if (!text || isProcessing) return;

    addFloatingMessage(text, 'sent');
    input.value = '';

    processWithAI(text);
}

function handleFloatingKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendFloatingMessage();
    }
}

function sendQuickSuggestion(text) {
    // Open chatbot if closed
    if (!isOpen) {
        toggleChatbot();
        setTimeout(function() {
            document.getElementById('chatbotFloatingInput').value = text;
            sendFloatingMessage();
        }, 300);
    } else {
        document.getElementById('chatbotFloatingInput').value = text;
        sendFloatingMessage();
    }
}

// ===== ADD MESSAGE =====
function addFloatingMessage(text, type, extra) {
    var container = document.getElementById('chatbotWindowMessages');
    var time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type;
    
    var avatar = type === 'sent' 
        ? '<div class="message-avatar"><i class="fas fa-user"></i></div>'
        : '<div class="message-avatar"><i class="fas fa-robot"></i></div>';
    
    var roleBadge = '';
    if (type === 'sent') {
        var role = currentUser.role || 'guest';
        var roleLabels = {
            'customer': 'Customer',
            'provider': 'Provider',
            'guest': 'Guest'
        };
        var roleClasses = {
            'customer': 'customer',
            'provider': 'provider',
            'guest': 'guest'
        };
        roleBadge = `<span class="role-badge ${roleClasses[role]}">${roleLabels[role] || 'Guest'}</span>`;
    }
    
    var extraHtml = '';
    if (extra) {
        if (extra.category) {
            var actionText = '';
            if (currentUser.role === 'customer') {
                actionText = 'Post Request';
            } else if (currentUser.role === 'provider') {
                actionText = 'View Category';
            } else {
                actionText = 'Learn More';
            }
            extraHtml = `<div class="category-tag" onclick="handleCategoryClick('${extra.category}')">
                <i class="fas ${extra.icon}"></i> ${extra.name} → ${actionText}
            </div>`;
        }
        if (extra.button) {
            extraHtml += `<div class="category-tag" onclick="handleCategoryClick('${extra.category}')" style="display:inline-block;margin-top:4px;background:var(--gradient-primary);color:white;">
                <i class="fas fa-arrow-right"></i> ${extra.button.text}
            </div>`;
        }
    }
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="message-bubble">
            ${roleBadge}
            ${text}
            ${extraHtml}
            <span style="display:block;font-size:0.65rem;opacity:0.5;margin-top:4px;">${time}</span>
        </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// ===== HANDLE CATEGORY CLICK =====
function handleCategoryClick(categoryId) {
    var role = currentUser.role || 'guest';
    
    if (role === 'customer') {
        // ✅ Customer: Go to post request
        localStorage.setItem('selectedCategory', categoryId);
        window.location.href = 'post-request.html';
    } else if (role === 'provider') {
        // ✅ Provider: Show category info
        var category = categories.find(function(c) { return c.id === categoryId; });
        if (category) {
            addFloatingMessage(
                `📊 Category: ${category.name}\n\n` +
                `This service is one of the most requested by customers.\n` +
                `💡 Tip: Make sure you have the right tools and experience.\n` +
                `📈 Demand: High`,
                'received'
            );
        }
    } else {
        // ✅ Guest: Show info and suggest login
        var category = categories.find(function(c) { return c.id === categoryId; });
        if (category) {
            addFloatingMessage(
                `📋 ${category.name}\n\n` +
                `This is a popular service category on Fixora.\n` +
                `🔐 Sign in to post a request or accept jobs.`,
                'received'
            );
        }
    }
}

// ===== PROCESS WITH AI =====
function processWithAI(text) {
    isProcessing = true;
    showFloatingTyping();

    setTimeout(function() {
        hideFloatingTyping();

        var matchedCategory = findCategory(text);
        var role = currentUser.role || 'guest';
        
        if (matchedCategory) {
            var response = aiResponses[matchedCategory.id] || aiResponses.plumbing;
            
            // ✅ Different responses based on role
            var categoryText = '';
            var extra = {
                category: matchedCategory.id,
                name: matchedCategory.name,
                icon: matchedCategory.icon
            };
            
            if (role === 'customer') {
                categoryText = response.greeting + '\n\n' + response.question;
                extra.button = {
                    text: response.action || 'Post Request',
                    link: 'post-request.html?category=' + matchedCategory.id
                };
            } else if (role === 'provider') {
                categoryText = `📊 ${matchedCategory.name} Service\n\n` +
                    `This is a high-demand service category.\n` +
                    `💡 Customers often ask about: ${response.question}\n` +
                    `📈 Average rate: 100-200 EGP/hour`;
            } else {
                categoryText = `🔍 I found a matching category: ${matchedCategory.name}\n\n` +
                    `${response.greeting}\n` +
                    `${response.question}\n\n` +
                    `💡 Sign in to post a request or accept jobs!`;
            }
            
            addFloatingMessage(categoryText, 'received', extra);

        } else {
            // ✅ No category found - role-specific response
            if (role === 'provider') {
                addFloatingMessage(
                    '📊 I couldn\'t find a specific category for this query.\n\n' +
                    '💡 Try asking about: "What customers need most" or "Popular services"',
                    'received'
                );
            } else {
                addFloatingMessage('🤔 I\'m not sure what category this falls under. Can you tell me more details?', 'received');
            }
        }

        isProcessing = false;
    }, 1000 + Math.random() * 1500);
}

// ===== FIND CATEGORY =====
function findCategory(text) {
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

    if (scores[0] && scores[0].score > 0) {
        return scores[0].category;
    }

    return null;
}

// ===== TYPING INDICATOR =====
function showFloatingTyping() {
    var indicator = document.getElementById('floatingTyping');
    if (indicator) indicator.style.display = 'flex';
}

function hideFloatingTyping() {
    var indicator = document.getElementById('floatingTyping');
    if (indicator) indicator.style.display = 'none';
}

// ===== GO TO POST REQUEST =====
function goToPostRequest(categoryId) {
    localStorage.setItem('selectedCategory', categoryId);
    window.location.href = 'post-request.html';
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

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.toggleChatbot = toggleChatbot;
window.sendFloatingMessage = sendFloatingMessage;
window.handleFloatingKeyPress = handleFloatingKeyPress;
window.sendQuickSuggestion = sendQuickSuggestion;
window.goToPostRequest = goToPostRequest;
window.handleCategoryClick = handleCategoryClick;
window.handleLogout = handleLogout;