// ==========================================
// CHAT.JS - Chat System Logic
// ==========================================

var currentChatId = null;
var currentChatPartner = null;
var currentUser = null;
var allChats = [];
var allUsers = [];
var isTyping = false;
var typingTimeout = null;

// ===== EMOJI LIST =====
var emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😇', '🤠', '🤡', '🥳', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙌', '👏', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '💅', '🤳', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🫀', '🫁', '🦴', '👤', '👥', '🗣️', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '👱', '👴', '👵'];

// ===== DEMO CHATS DATA =====
var demoChats = [
    {
        id: 'chat_001',
        partner: {
            id: 'TECH_001',
            name: 'Ahmed Al-Rashid',
            phone: '+966 50 123 4567',
            avatar: null,
            role: 'provider',
            online: true
        },
        lastMessage: 'I will arrive at 2 PM for the inspection.',
        lastMessageTime: '2026-07-13T10:30:00',
        unread: 2,
        messages: [
            {
                id: 'msg_001',
                sender: 'TECH_001',
                text: 'Hello! I received your service request.',
                time: '2026-07-13T09:00:00',
                status: 'read'
            },
            {
                id: 'msg_002',
                sender: 'customer',
                text: 'Great! When can you come?',
                time: '2026-07-13T09:15:00',
                status: 'read'
            },
            {
                id: 'msg_003',
                sender: 'TECH_001',
                text: 'I will arrive at 2 PM for the inspection.',
                time: '2026-07-13T10:30:00',
                status: 'delivered'
            }
        ]
    },
    {
        id: 'chat_002',
        partner: {
            id: 'CUST_001',
            name: 'Mohammed Al-Otaibi',
            phone: '+966 50 123 4568',
            avatar: null,
            role: 'customer',
            online: false
        },
        lastMessage: 'Thank you for the quick service!',
        lastMessageTime: '2026-07-12T16:45:00',
        unread: 0,
        messages: [
            {
                id: 'msg_004',
                sender: 'CUST_001',
                text: 'Can you come tomorrow morning?',
                time: '2026-07-12T14:00:00',
                status: 'read'
            },
            {
                id: 'msg_005',
                sender: 'provider',
                text: 'Yes, I will be there at 9 AM.',
                time: '2026-07-12T14:30:00',
                status: 'read'
            },
            {
                id: 'msg_006',
                sender: 'CUST_001',
                text: 'Thank you for the quick service!',
                time: '2026-07-12T16:45:00',
                status: 'read'
            }
        ]
    },
    {
        id: 'chat_003',
        partner: {
            id: 'TECH_002',
            name: 'Khalid Al-Otaibi',
            phone: '+966 50 123 4569',
            avatar: null,
            role: 'provider',
            online: true
        },
        lastMessage: 'The parts are ready for installation.',
        lastMessageTime: '2026-07-13T08:20:00',
        unread: 0,
        messages: [
            {
                id: 'msg_007',
                sender: 'TECH_002',
                text: 'I got the parts you requested.',
                time: '2026-07-13T08:00:00',
                status: 'read'
            },
            {
                id: 'msg_008',
                sender: 'customer',
                text: 'Perfect! When can you install them?',
                time: '2026-07-13T08:10:00',
                status: 'read'
            },
            {
                id: 'msg_009',
                sender: 'TECH_002',
                text: 'The parts are ready for installation.',
                time: '2026-07-13T08:20:00',
                status: 'read'
            }
        ]
    }
];

// ===== DEMO USERS =====
var demoUsers = [
    { id: 'CUST_001', name: 'Ahmed Al-Saud', email: 'ahmed@example.com', role: 'customer', phone: '+966 50 123 4560' },
    { id: 'CUST_002', name: 'Fatima Al-Zahra', email: 'fatima@example.com', role: 'customer', phone: '+966 50 123 4561' },
    { id: 'CUST_003', name: 'Mohammed Al-Otaibi', email: 'mohammed@example.com', role: 'customer', phone: '+966 50 123 4562' },
    { id: 'TECH_001', name: 'Ahmed Al-Rashid', email: 'ahmed.rashid@fixora.com', role: 'provider', phone: '+966 50 123 4567' },
    { id: 'TECH_002', name: 'Khalid Al-Otaibi', email: 'khalid@fixora.com', role: 'provider', phone: '+966 50 123 4568' },
    { id: 'TECH_003', name: 'Faisal Al-Harbi', email: 'faisal@fixora.com', role: 'provider', phone: '+966 50 123 4569' }
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    currentUser = {
        id: localStorage.getItem('userEmail') || 'customer@fixora.com',
        name: localStorage.getItem('userName') || 'Customer',
        role: localStorage.getItem('userRole') || 'customer',
        phone: localStorage.getItem('userPhone') || '+966 50 123 4567'
    };

    loadChats();
    loadUsers();
    renderChatList();
    setupEmojiPicker();
    updateFooterDate();
});

function loadChats() {
    var saved = localStorage.getItem('fixoraChats');
    if (saved) {
        try {
            allChats = JSON.parse(saved);
        } catch(e) {
            allChats = demoChats;
        }
    } else {
        allChats = demoChats;
        localStorage.setItem('fixoraChats', JSON.stringify(allChats));
    }
}

function loadUsers() {
    var saved = localStorage.getItem('fixoraUsers');
    if (saved) {
        try {
            allUsers = JSON.parse(saved);
        } catch(e) {
            allUsers = demoUsers;
        }
    } else {
        allUsers = demoUsers;
        localStorage.setItem('fixoraUsers', JSON.stringify(allUsers));
    }
}

function saveChats() {
    localStorage.setItem('fixoraChats', JSON.stringify(allChats));
}

// ===== RENDER CHAT LIST =====
function renderChatList(filter) {
    var container = document.getElementById('chatList');
    var chats = filter ? allChats.filter(function(c) {
        return c.partner.name.toLowerCase().includes(filter.toLowerCase());
    }) : allChats;

    if (chats.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-light);">
                <i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:12px;"></i>
                <p>No conversations found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = chats.map(function(chat) {
        var isActive = chat.id === currentChatId ? 'active' : '';
        var unreadBadge = chat.unread > 0 ? `<span class="chat-item-unread">${chat.unread}</span>` : '';
        var onlineStatus = chat.partner.online ? 'chat-item-online' : 'chat-item-offline';
        var preview = chat.lastMessage || 'No messages yet';
        if (preview.length > 40) preview = preview.substring(0, 40) + '...';
        var time = formatTime(chat.lastMessageTime);

        return `
            <div class="chat-item ${isActive}" onclick="selectChat('${chat.id}')">
                <div style="position:relative;">
                    <div class="chat-item-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <span class="${onlineStatus}"></span>
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${chat.partner.name}</div>
                    <div class="chat-item-preview">${preview}</div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                    <span class="chat-item-time">${time}</span>
                    ${unreadBadge}
                </div>
            </div>
        `;
    }).join('');
}

// ===== SELECT CHAT =====
function selectChat(chatId) {
    currentChatId = chatId;
    var chat = allChats.find(function(c) { return c.id === chatId; });
    if (!chat) return;

    currentChatPartner = chat.partner;
    chat.unread = 0;
    saveChats();
    renderChatList();

    // Update header
    document.getElementById('partnerName').textContent = chat.partner.name;
    var statusEl = document.getElementById('partnerStatus');
    statusEl.textContent = chat.partner.online ? '🟢 Online' : '⚪ Offline';
    statusEl.className = 'online-status ' + (chat.partner.online ? 'online' : 'offline');

    // ✅ Store partner phone for calling
    var partnerPhone = chat.partner.phone || '+966 50 123 4567';
    document.getElementById('callBtn').setAttribute('data-phone', partnerPhone);
    document.getElementById('callBtn').innerHTML = '<i class="fas fa-phone"></i>';

    // Render messages
    renderMessages(chat.messages);

    // ✅ Show chat area and input
    var messagesContainer = document.getElementById('chatMessages');
    var inputArea = document.getElementById('chatInputArea');
    var chatArea = document.getElementById('chatArea');
    
    messagesContainer.style.display = 'flex';
    messagesContainer.style.flexDirection = 'column';
    inputArea.style.display = 'flex';
    chatArea.style.display = 'flex';
    chatArea.style.flexDirection = 'column';

    // Enable input
    var chatInput = document.getElementById('chatInput');
    chatInput.disabled = false;
    chatInput.placeholder = 'Type a message...';
    chatInput.focus();

    // Scroll to bottom
    setTimeout(function() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);

    // Simulate typing from partner
    simulateTyping();
}

// ===== RENDER MESSAGES =====
function renderMessages(messages) {
    var container = document.getElementById('chatMessages');
    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:var(--text-light);margin:auto;">
                <i class="fas fa-comment-dots" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--border);"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    var html = '';
    var lastDate = '';

    messages.forEach(function(msg) {
        var msgDate = new Date(msg.time).toLocaleDateString();
        if (msgDate !== lastDate) {
            html += `<div class="message-date-divider">${msgDate}</div>`;
            lastDate = msgDate;
        }

        var isSent = msg.sender === 'customer' || msg.sender === currentUser.id;
        var statusIcon = '';
        if (isSent) {
            var statusMap = {
                'sent': '<i class="fas fa-check message-status sent"></i>',
                'delivered': '<i class="fas fa-check-double message-status delivered"></i>',
                'read': '<i class="fas fa-check-double message-status read"></i>'
            };
            statusIcon = statusMap[msg.status] || '';
        }

        var time = new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Check if message has image
        var imageHtml = '';
        if (msg.image) {
            imageHtml = `<img src="${msg.image}" class="message-image" onclick="viewImage('${msg.image}')" />`;
        }

        // Check if message has file
        var fileHtml = '';
        if (msg.file) {
            fileHtml = `
                <a href="${msg.file.url}" class="message-file" target="_blank">
                    <i class="fas fa-file"></i>
                    <span>${msg.file.name}</span>
                </a>
            `;
        }

        html += `
            <div class="message ${isSent ? 'sent' : 'received'}">
                <div class="message-bubble">
                    ${msg.text}
                    ${imageHtml}
                    ${fileHtml}
                    <span class="message-time">${time} ${statusIcon}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===== SEND MESSAGE =====
function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();

    if (!text || !currentChatId) return;

    var chat = allChats.find(function(c) { return c.id === currentChatId; });
    if (!chat) return;

    var message = {
        id: 'msg_' + Date.now(),
        sender: currentUser.id,
        text: text,
        time: new Date().toISOString(),
        status: 'sent'
    };

    chat.messages.push(message);
    chat.lastMessage = text;
    chat.lastMessageTime = message.time;
    saveChats();

    // Update UI
    renderMessages(chat.messages);
    renderChatList();
    input.value = '';

    // Scroll to bottom
    var container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;

    // ✅ Simulate reply after delay (only if online)
    if (chat.partner.online) {
        simulateReply(chat);
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }

    // Typing indicator
    if (currentChatId) {
        clearTimeout(typingTimeout);
        var indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'flex';
        document.getElementById('typingText').textContent = 'You are typing...';
        typingTimeout = setTimeout(function() {
            indicator.style.display = 'none';
        }, 1500);
    }
}

// ===== SIMULATE TYPING =====
function simulateTyping() {
    var chat = allChats.find(function(c) { return c.id === currentChatId; });
    if (!chat || !chat.partner.online) return;

    var indicator = document.getElementById('typingIndicator');
    var typingText = document.getElementById('typingText');

    var delay = 3000 + Math.random() * 5000;
    setTimeout(function() {
        if (currentChatId === chat.id && chat.partner.online) {
            indicator.style.display = 'flex';
            typingText.textContent = chat.partner.name + ' is typing...';
            setTimeout(function() {
                indicator.style.display = 'none';
            }, 2000 + Math.random() * 3000);
        }
    }, delay);
}

// ===== SIMULATE REPLY =====
function simulateReply(chat) {
    var replies = [
        'I understand, let me check that.',
        'Okay, I will take care of it.',
        'That sounds good.',
        'I will be there soon.',
        'Thanks for the update!',
        'Let me know if you need anything else.',
        'Sure, I can help with that.',
        'I will look into it right away.',
        'Perfect, I will handle it.',
        'Great, thank you!',
        'I will confirm the time shortly.',
        'Yes, that works for me.',
        'I will send you the details.',
        'Please let me know if you have questions.'
    ];

    var delay = 2000 + Math.random() * 4000;

    setTimeout(function() {
        if (currentChatId !== chat.id) return;

        var reply = replies[Math.floor(Math.random() * replies.length)];
        var message = {
            id: 'msg_' + Date.now(),
            sender: chat.partner.id,
            text: reply,
            time: new Date().toISOString(),
            status: 'read'
        };

        chat.messages.push(message);
        chat.lastMessage = reply;
        chat.lastMessageTime = message.time;
        saveChats();

        renderMessages(chat.messages);
        renderChatList();

        var container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;

        document.getElementById('typingIndicator').style.display = 'none';
    }, delay);
}

// ===== FILTER CHATS =====
function filterChats(value) {
    renderChatList(value);
}

// ===== EMOJI PICKER =====
function setupEmojiPicker() {
    var grid = document.getElementById('emojiGrid');
    var emojisPerRow = 8;
    var displayedEmojis = emojis.slice(0, 56);

    grid.innerHTML = displayedEmojis.map(function(emoji) {
        return `<button onclick="insertEmoji('${emoji}')">${emoji}</button>`;
    }).join('');
}

function toggleEmoji() {
    var picker = document.getElementById('emojiPicker');
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function insertEmoji(emoji) {
    var input = document.getElementById('chatInput');
    input.value += emoji;
    input.focus();
    document.getElementById('emojiPicker').style.display = 'none';
}

// ===== FILE ATTACH =====
function attachFile() {
    document.getElementById('fileInput').click();
}

function handleFileAttach(input) {
    var files = Array.from(input.files);
    files.forEach(function(file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ File "' + file.name + '" exceeds 5MB limit');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            var chat = allChats.find(function(c) { return c.id === currentChatId; });
            if (!chat) return;

            var message = {
                id: 'msg_' + Date.now(),
                sender: currentUser.id,
                text: '📎 ' + file.name,
                time: new Date().toISOString(),
                status: 'sent',
                file: {
                    name: file.name,
                    url: e.target.result,
                    size: file.size
                }
            };

            chat.messages.push(message);
            chat.lastMessage = '📎 ' + file.name;
            chat.lastMessageTime = message.time;
            saveChats();

            renderMessages(chat.messages);
            renderChatList();

            var container = document.getElementById('chatMessages');
            container.scrollTop = container.scrollHeight;
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

// ===== NEW CHAT =====
function openNewChat() {
    document.getElementById('newChatModal').classList.add('show');
    document.getElementById('newChatSearch').value = '';
    document.getElementById('userList').innerHTML = '';
    searchUsers('');
}

function closeNewChatModal() {
    document.getElementById('newChatModal').classList.remove('show');
}

function searchUsers(query) {
    var container = document.getElementById('userList');
    var filtered = allUsers.filter(function(user) {
        if (user.id === currentUser.id) return false;
        return user.name.toLowerCase().includes(query.toLowerCase()) ||
               user.email.toLowerCase().includes(query.toLowerCase());
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-users-found">
                <i class="fas fa-search"></i>
                <p>No users found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(function(user) {
        var roleClass = user.role === 'customer' ? 'customer' : 'provider';
        var roleLabel = user.role === 'customer' ? 'Customer' : 'Provider';
        var alreadyChat = allChats.some(function(c) { return c.partner.id === user.id; });

        return `
            <div class="user-item" onclick="startNewChat('${user.id}')">
                <div class="user-item-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-item-info">
                    <div class="user-item-name">${user.name}</div>
                    <div class="user-item-email">${user.email}</div>
                    ${user.phone ? `<div class="user-item-email">📱 ${user.phone}</div>` : ''}
                </div>
                <span class="user-item-role ${roleClass}">${roleLabel}</span>
                ${alreadyChat ? '<span style="font-size:0.7rem;color:var(--text-light);">✓ Existing</span>' : ''}
            </div>
        `;
    }).join('');
}

function startNewChat(userId) {
    var user = allUsers.find(function(u) { return u.id === userId; });
    if (!user) return;

    var existing = allChats.find(function(c) { return c.partner.id === userId; });
    if (existing) {
        closeNewChatModal();
        selectChat(existing.id);
        return;
    }

    var newChat = {
        id: 'chat_' + Date.now(),
        partner: {
            id: user.id,
            name: user.name,
            phone: user.phone || '+966 50 123 4567',
            avatar: null,
            role: user.role,
            online: Math.random() > 0.5
        },
        lastMessage: 'New conversation started',
        lastMessageTime: new Date().toISOString(),
        unread: 0,
        messages: []
    };

    allChats.push(newChat);
    saveChats();
    renderChatList();
    closeNewChatModal();
    selectChat(newChat.id);

    var welcomeMsg = {
        id: 'msg_' + Date.now(),
        sender: 'system',
        text: '👋 This is the start of your conversation with ' + user.name,
        time: new Date().toISOString(),
        status: 'read'
    };
    newChat.messages.push(welcomeMsg);
    saveChats();
    renderMessages(newChat.messages);
}

// ===== CALL PARTNER =====
function callPartner() {
    if (!currentChatPartner) return;
    
    var phone = currentChatPartner.phone || '+966 50 123 4567';
    
    // ✅ عرض رقم الهاتف مع خيار النسخ
    var confirmMsg = '📞 Call ' + currentChatPartner.name + '\n\n';
    confirmMsg += 'Phone: ' + phone + '\n\n';
    confirmMsg += 'Click "OK" to call using your phone.\n';
    confirmMsg += 'Click "Cancel" to copy the number.';
    
    if (confirm(confirmMsg)) {
        // محاولة فتح تطبيق الاتصال (للأجهزة المحمولة)
        window.location.href = 'tel:' + phone;
    } else {
        // نسخ الرقم للحافظة
        copyToClipboard(phone);
        alert('📋 Phone number copied to clipboard!\n\n' + phone);
    }
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch(e) {
        console.log('Copy failed');
    }
    document.body.removeChild(textarea);
}

// ===== CHAT INFO =====
function viewChatInfo() {
    if (!currentChatPartner) return;
    
    var info = '📋 Chat Details\n\n';
    info += '👤 Name: ' + currentChatPartner.name + '\n';
    info += '📱 Phone: ' + (currentChatPartner.phone || 'Not available') + '\n';
    info += '🎯 Role: ' + (currentChatPartner.role === 'provider' ? 'Service Provider' : 'Customer') + '\n';
    info += '🟢 Status: ' + (currentChatPartner.online ? 'Online' : 'Offline') + '\n\n';
    info += '💡 Click "Call" to contact them.';
    
    alert(info);
}

function viewImage(src) {
    window.open(src, '_blank');
}

// ===== FORMAT TIME =====
function formatTime(isoString) {
    if (!isoString) return '';
    var date = new Date(isoString);
    var now = new Date();
    var diff = Math.floor((now - date) / (1000 * 60));

    if (diff < 1) return 'Just now';
    if (diff < 60) return diff + 'm ago';
    if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
    return date.toLocaleDateString();
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
window.selectChat = selectChat;
window.sendMessage = sendMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.filterChats = filterChats;
window.toggleEmoji = toggleEmoji;
window.insertEmoji = insertEmoji;
window.attachFile = attachFile;
window.handleFileAttach = handleFileAttach;
window.openNewChat = openNewChat;
window.closeNewChatModal = closeNewChatModal;
window.searchUsers = searchUsers;
window.startNewChat = startNewChat;
window.viewChatInfo = viewChatInfo;
window.callPartner = callPartner;
window.viewImage = viewImage;
window.handleLogout = handleLogout;