// ==========================================
// CHAT.JS - Chat System Logic (SignalR & API Integrated)
// ==========================================

var currentChatId = null;
var currentChatPartner = null;
var currentUser = null;
var allChats = [];
var allUsers = [];
var chatConnection = null;

// ===== EMOJI LIST =====
var emojis = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😇', '🤠', '🤡', '🥳', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠️', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙌', '👏', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '💅', '🤳', '💄', '💋', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🧠', '🫀', '🫁', '🦴', '👤', '👥', '🗣️', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '👱', '👴', '👵'];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch current user complete info
        const userInfoDto = await api.request('profile/me');
        currentUser = {
            id: userInfoDto.id,
            name: userInfoDto.fullName,
            role: userInfoDto.role,
            phone: userInfoDto.phoneNumber || ''
        };
    } catch (e) {
        console.error("Failed to load user info, falling back to localStorage", e);
        currentUser = {
            id: localStorage.getItem('userEmail') || 'customer@fixora.com',
            name: localStorage.getItem('userName') || 'Customer',
            role: localStorage.getItem('userRole') || 'customer',
            phone: localStorage.getItem('userPhone') || '+966 50 123 4567'
        };
    }

    // Initialize SignalR and load chat list
    await initSignalRChat();
    await loadRealChats();
    setupEmojiPicker();
    updateFooterDate();

    // Auto-select a chat if passed from another page (e.g. via localStorage)
    const activeId = localStorage.getItem('activeChatId');
    if (activeId) {
        localStorage.removeItem('activeChatId');
        // Wait a short bit to ensure chats are loaded and DOM rendered
        setTimeout(() => {
            selectChat(activeId);
        }, 300);
    }
});

// ===== SIGNALR CONNECTION =====
async function initSignalRChat() {
    if (typeof RealTime === "undefined") {
        console.error("RealTime wrapper not found in signalr.js");
        return;
    }

    chatConnection = RealTime.createConnection("hubs/chat");

    if (chatConnection) {
        chatConnection.on("ReceiveMessage", function(messageDto) {
            console.log("Real-time message received:", messageDto);

            // 1. If it's the currently selected chat, append it
            if (messageDto.chatId === currentChatId) {
                const chat = allChats.find(c => c.id === currentChatId);
                if (chat) {
                    // Prevent duplicate rendering
                    if (!chat.messages.some(m => m.id === messageDto.id)) {
                        chat.messages.push(messageDto);
                        renderMessages(chat.messages);
                        
                        // Scroll to bottom
                        const container = document.getElementById('chatMessages');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }
                }
            }

            // 2. Update the chat list preview
            const targetChat = allChats.find(c => c.id === messageDto.chatId);
            if (targetChat) {
                targetChat.lastMessage = messageDto.content;
                targetChat.lastMessageTime = messageDto.sentAt;

                if (messageDto.chatId !== currentChatId) {
                    targetChat.unread = (targetChat.unread || 0) + 1;
                }

                // Sort chats list by last message time
                allChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                renderChatList();
            } else {
                // If it's a completely new chat we don't have in list, reload list
                loadRealChats();
            }
        });

        // Start connection
        await RealTime.startConnection("hubs/chat");
        if (currentChatId) {
            try {
                await chatConnection.invoke("JoinChat", currentChatId);
                console.log(`Re-joined active chat room group: ${currentChatId}`);
            } catch (err) {
                console.error("SignalR JoinChat invocation failed on connection start:", err);
            }
        }
    }
}

// ===== LOAD REAL CHATS =====
async function loadRealChats() {
    try {
        const response = await api.get('chats?pageNumber=1&pageSize=100');
        const chatsList = response.items || [];
        
        allChats = chatsList.map(chat => {
            const partner = chat.participants.find(p => p.userId !== currentUser.id) || {
                fullName: 'System',
                email: 'system@fixora.com',
                userId: ''
            };

            return {
                id: chat.id,
                partner: {
                    id: partner.userId,
                    name: partner.fullName,
                    email: partner.email,
                    phone: '', // Filled on demand or when selecting chat
                    role: '',
                    online: true
                },
                lastMessage: chat.lastMessage ? chat.lastMessage.content : 'No messages yet',
                lastMessageTime: chat.lastMessage ? chat.lastMessage.sentAt : chat.createdAt,
                unread: 0,
                messages: []
            };
        });

        // Sort by time
        allChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        renderChatList();
    } catch (e) {
        console.error("Failed to load chats:", e);
        renderChatList();
    }
}

// ===== RENDER CHAT LIST =====
function renderChatList(filter) {
    var container = document.getElementById('chatList');
    if (!container) return;

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
async function selectChat(chatId) {
    currentChatId = chatId;
    var chat = allChats.find(function(c) { return c.id === chatId; });
    if (!chat) return;

    currentChatPartner = chat.partner;
    chat.unread = 0;
    renderChatList();

    // Fetch messages from backend
    try {
        const messagesData = await api.get(`chats/${chatId}/messages?pageSize=100`);
        chat.messages = (messagesData.items || []).slice().reverse();
    } catch (e) {
        console.error("Failed to load message history:", e);
        chat.messages = [];
    }

    // Join Group in Hub
    if (chatConnection && chatConnection.state === signalR.HubConnectionState.Connected) {
        try {
            await chatConnection.invoke("JoinChat", chatId);
        } catch (err) {
            console.error("SignalR JoinChat invocation failed:", err);
        }
    }

    // Try to get partner's profile to retrieve telephone number
    if (chat.partner.id) {
        try {
            const partnerProfile = await api.get(`profile/${chat.partner.id}`, { showLoader: false });
            if (partnerProfile) {
                chat.partner.phone = partnerProfile.phoneNumber || '';
            }
        } catch (e) {}
    }

    // Update header
    document.getElementById('partnerName').textContent = chat.partner.name;
    var statusEl = document.getElementById('partnerStatus');
    statusEl.textContent = chat.partner.online ? '🟢 Online' : '⚪ Offline';
    statusEl.className = 'online-status ' + (chat.partner.online ? 'online' : 'offline');

    // Call button phone configuration
    var partnerPhone = chat.partner.phone || '+966 50 123 4567';
    const callBtn = document.getElementById('callBtn');
    if (callBtn) {
        callBtn.setAttribute('data-phone', partnerPhone);
        callBtn.innerHTML = '<i class="fas fa-phone"></i>';
    }

    // Render messages
    renderMessages(chat.messages);

    // Show chat area
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
}

// ===== RENDER MESSAGES =====
function renderMessages(messages) {
    var container = document.getElementById('chatMessages');
    if (!container) return;

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
        const msgTime = msg.sentAt || msg.time;
        var msgDate = new Date(msgTime).toLocaleDateString();
        if (msgDate !== lastDate) {
            html += `<div class="message-date-divider">${msgDate}</div>`;
            lastDate = msgDate;
        }

        // Sender matches current user GUID or role email fallback
        var isSent = msg.senderId === currentUser.id || msg.sender === currentUser.id;
        
        var statusIcon = '';
        if (isSent) {
            statusIcon = '<i class="fas fa-check-double message-status read"></i>';
        }

        var time = new Date(msgTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

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
                    ${msg.content || msg.text}
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
async function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();

    if (!text || !currentChatId) return;

    var chat = allChats.find(function(c) { return c.id === currentChatId; });
    if (!chat) return;

    input.disabled = true;

    try {
        const messageDto = await api.post(`chats/${currentChatId}/messages`, {
            content: text
        }, { showLoader: false });

        // Add to messages list if not already added by SignalR
        if (!chat.messages.some(m => m.id === messageDto.id)) {
            chat.messages.push(messageDto);
            renderMessages(chat.messages);
        }

        chat.lastMessage = messageDto.content;
        chat.lastMessageTime = messageDto.sentAt;
        
        allChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        renderChatList();
        input.value = '';

        var container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    } catch (err) {
        console.error("Failed to send message:", err);
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

// ===== FILTER CHATS =====
function filterChats(value) {
    renderChatList(value);
}

// ===== EMOJI PICKER =====
function setupEmojiPicker() {
    var grid = document.getElementById('emojiGrid');
    if (!grid) return;
    var displayedEmojis = emojis.slice(0, 56);

    grid.innerHTML = displayedEmojis.map(function(emoji) {
        return `<button onclick="insertEmoji('${emoji}')">${emoji}</button>`;
    }).join('');
}

function toggleEmoji() {
    var picker = document.getElementById('emojiPicker');
    if (picker) {
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    }
}

function insertEmoji(emoji) {
    var input = document.getElementById('chatInput');
    if (input) {
        input.value += emoji;
        input.focus();
    }
    var picker = document.getElementById('emojiPicker');
    if (picker) picker.style.display = 'none';
}

// ===== FILE ATTACH =====
function attachFile() {
    var input = document.getElementById('fileInput');
    if (input) input.click();
}

async function handleFileAttach(input) {
    var files = Array.from(input.files);
    for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ File "' + file.name + '" exceeds 5MB limit');
            continue;
        }

        try {
            // Post notification that file is uploaded as attachment text
            await api.post(`chats/${currentChatId}/messages`, {
                content: `📎 Attached File: ${file.name}`
            }, { showLoader: false });
        } catch (e) {
            console.error("Failed to send file message:", e);
        }
    }
    input.value = '';
    // Reload messages to show the update
    if (currentChatId) {
        selectChat(currentChatId);
    }
}

// ===== NEW CHAT MODAL =====
async function openNewChat() {
    document.getElementById('newChatModal').classList.add('show');
    document.getElementById('newChatSearch').value = '';
    document.getElementById('userList').innerHTML = 'Loading contacts...';
    await fetchNewChatContacts();
}

function closeNewChatModal() {
    document.getElementById('newChatModal').classList.remove('show');
}

// Fetch active service request contacts
async function fetchNewChatContacts() {
    try {
        // Fetch all user's service requests
        const requests = await api.get('service-requests/my-requests');
        const contactMap = new Map();

        for (const req of requests) {
            let targetUserId = null;
            if (currentUser.role === 'customer' || currentUser.role === 'Customer') {
                targetUserId = req.selectedProviderId;
            } else {
                targetUserId = req.customerId;
            }

            if (targetUserId && !contactMap.has(targetUserId)) {
                try {
                    const profile = await api.get(`profile/${targetUserId}`, { showLoader: false });
                    if (profile) {
                        contactMap.set(targetUserId, {
                            id: targetUserId,
                            name: profile.fullName || 'Technician',
                            email: profile.email || '',
                            phone: profile.phoneNumber || '',
                            role: currentUser.role === 'customer' ? 'provider' : 'customer',
                            serviceRequestId: req.id
                        });
                    }
                } catch (err) {
                    console.error("Could not load contact profile:", targetUserId, err);
                }
            }
        }

        allUsers = Array.from(contactMap.values());
        renderNewChatUsers();
    } catch (e) {
        console.error("Failed to fetch new chat contacts:", e);
        document.getElementById('userList').innerHTML = 'Failed to load contacts.';
    }
}

function renderNewChatUsers() {
    const container = document.getElementById('userList');
    if (!container) return;

    if (allUsers.length === 0) {
        container.innerHTML = `
            <div class="no-users-found">
                <i class="fas fa-search"></i>
                <p>No active service request contacts found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = allUsers.map(function(user) {
        var roleClass = user.role === 'customer' ? 'customer' : 'provider';
        var roleLabel = user.role === 'customer' ? 'Customer' : 'Provider';
        var alreadyChat = allChats.some(function(c) { return c.partner.id === user.id; });

        return `
            <div class="user-item" onclick="startNewChat('${user.id}', '${user.serviceRequestId}')">
                <div class="user-item-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-item-info">
                    <div class="user-item-name">${user.name}</div>
                    <div class="user-item-email">${user.email}</div>
                    ${user.phone ? `<div class="user-item-email">📱 ${user.phone}</div>` : ''}
                </div>
                <span class="user-item-role ${roleClass}">${roleLabel}</span>
                ${alreadyChat ? '<span style="font-size:0.7rem;color:var(--text-light); margin-left: auto;">✓ Existing</span>' : ''}
            </div>
        `;
    }).join('');
}

async function startNewChat(userId, serviceRequestId) {
    const user = allUsers.find(function(u) { return u.id === userId; });
    if (!user) return;

    // Check if chat already exists in allChats
    const existing = allChats.find(function(c) { return c.partner.id === userId; });
    if (existing) {
        closeNewChatModal();
        selectChat(existing.id);
        return;
    }

    try {
        const chatRoom = await api.post('chats', {
            serviceRequestId: serviceRequestId,
            chatType: 1, // CustomerProvider = 1
            participantUserIds: [currentUser.id, userId]
        });

        closeNewChatModal();
        await loadRealChats();
        selectChat(chatRoom.id);
    } catch (e) {
        console.error("Failed to create new chat room:", e);
        alert("Failed to start chat room. Please try again.");
    }
}

// ===== CALL PARTNER =====
function callPartner() {
    if (!currentChatPartner) return;
    var phone = currentChatPartner.phone || '+966 50 123 4567';
    var confirmMsg = '📞 Call ' + currentChatPartner.name + '\n\nPhone: ' + phone + '\n\nClick "OK" to call.';
    if (confirm(confirmMsg)) {
        window.location.href = 'tel:' + phone;
    }
}

// ===== CHAT INFO =====
function viewChatInfo() {
    if (!currentChatPartner) return;
    
    var info = '📋 Chat Details\n\n';
    info += '👤 Name: ' + currentChatPartner.name + '\n';
    info += '✉️ Email: ' + (currentChatPartner.email || 'Not available') + '\n';
    info += '📱 Phone: ' + (currentChatPartner.phone || 'Not available') + '\n';
    info += '🟢 Status: Online';
    
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
window.startNewChat = startNewChat;
window.viewChatInfo = viewChatInfo;
window.callPartner = callPartner;
window.viewImage = viewImage;