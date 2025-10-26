const signOutBtn = document.getElementById('signOutBtn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userList = document.getElementById('userList');
const privateChatsDiv = document.getElementById('privateChats');
const globalChatBtn = document.getElementById('globalChatBtn');
const privateChatBtn = document.getElementById('privateChatBtn');

let currentChatType = 'global'; // 'global' or 'private'
let privateChatId = null; // ID of current private chat
let isAuthenticated = false;
let userCache = {}; // Cache for user emails

function showError(message, showRetry = false) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    if (showRetry) {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry';
        retryBtn.onclick = () => sendMessage();
        errorDiv.appendChild(retryBtn);
    }
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    setTimeout(() => successDiv.style.display = 'none', 3000);
}

function clearMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

// Fetch user email by UID
async function getUserEmail(uid) {
    if (userCache[uid]) return userCache[uid];
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            userCache[uid] = userDoc.data().email;
            return userCache[uid];
        }
    } catch (error) {
        console.error('Error fetching user email:', error);
    }
    return uid; // Fallback
}

// Store user email on auth
function storeUserEmail(user) {
    const userRef = doc(db, 'users', user.uid);
    setDoc(userRef, { email: user.email }, { merge: true }).catch((error) => {
        console.error('Error storing user email:', error);
    });
}

// Load user's private chats
async function loadPrivateChats() {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'privateChats'), where('participants', 'array-contains', auth.currentUser.uid));
    onSnapshot(q, (snapshot) => {
        privateChatsDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const chatData = doc.data();
            const chatEl = document.createElement('div');
            chatEl.innerHTML = `<p>Chat with: ${chatData.participants.filter(id => id !== auth.currentUser.uid).join(', ')} <button onclick="loadPrivateChat('${doc.id}')">Open</button></p>`;
            privateChatsDiv.appendChild(chatEl);
        });
    });
}

// Initial auth check
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAuthenticated = true;
        storeUserEmail(user);
        loadPrivateChats();
        loadMessages();
    } else {
        isAuthenticated = false;
        window.location.href = 'index.html';
    }
});

// Search users by email
searchBtn.addEventListener('click', async () => {
    const email = searchInput.value.trim();
    if (!email) {
        showError('Enter an email to search.');
        return;
    }
    clearMessages();
    try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        userList.innerHTML = '';
        if (querySnapshot.empty) {
            userList.innerHTML = '<p>No user found.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const userEl = document.createElement('div');
                userEl.innerHTML = `<p>${userData.email} <button onclick="startPrivateChat('${doc.id}')">Start Chat</button></p>`;
                userList.appendChild(userEl);
            });
        }
    } catch (error) {
        showError('Search error: ' + error.message);
    }
});

// Start private chat
window.startPrivateChat = async function(targetUid) {
    if (!auth.currentUser) return;
    const currentUid = auth.currentUser.uid;
    const participants = [currentUid, targetUid].sort();
    const chatId = participants.join('_');
    const chatRef = doc(db, 'privateChats', chatId);
    await setDoc(chatRef, { participants: participants }, { merge: true });
    loadPrivateChat(chatId);
};

// Load a specific private chat
window.loadPrivateChat = function(chatId) {
    privateChatId = chatId;
    currentChatType = 'private';
    privateChatBtn.style.display = 'inline';
    globalChatBtn.style.display = 'inline';
    loadMessages();
};

// Toggle to global chat
globalChatBtn.addEventListener('click', () => {
    currentChatType = 'global';
    privateChatId = null;
    privateChatBtn.style.display = 'none';
    loadMessages();
});

// Toggle to private chat (if active)
privateChatBtn.addEventListener('click', () => {
    if (privateChatId) {
        currentChatType = 'private';
        loadMessages();
    }
});

// Send message function
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) {
        showError('Message cannot be empty.');
        return;
    }
    if (!isAuthenticated || !auth.currentUser) {
        showError('You must be signed in.');
        return;
    }
    if (!navigator.onLine) {
        showError('You are offline. Message will be sent when online.', true);
        return;
    }
    clearMessages();
    try {
        const messageData = {
            text: text,
            uid: auth.currentUser.uid,
            timestamp: new Date()
        };
        if (currentChatType === 'private' && privateChatId) {
            const chatRef = doc(db, 'privateChats', privateChatId);
            await addDoc(collection(chatRef, 'messages'), messageData);
            console.log('Private message stored in Firebase:', messageData);
        } else {
            await addDoc(collection(db, 'messages'), messageData);
            console.log('Global message stored in Firebase:', messageData);
        }
        messageInput.value = '';
        showSuccess('Message sent!');
    } catch (error) {
        showError('Error sending message: ' + error.message, true);
    }
}

// Send button event
sendBtn.addEventListener('click', sendMessage);

// Load messages (global or private) - Enhanced for global chat display
function loadMessages() {
    if (!isAuthenticated) return;
    let q;
    if (currentChatType === 'private' && privateChatId) {
        const chatRef = doc(db, 'privateChats', privateChatId);
        q = query(collection(chatRef, 'messages'), orderBy('timestamp'));
    } else {
        q = query(collection(db, 'messages'), orderBy('timestamp'));
    }
    onSnapshot(q, async (snapshot) => {
        messagesDiv.innerHTML = '';
        console.log(`Loaded ${snapshot.docs.length} messages for ${currentChatType} chat`);
        for (const docSnap of snapshot.docs) {
            const msg = docSnap.data();
            const userEmail = await getUserEmail(msg.uid);
            const timestamp = msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleString() : '';
            const msgEl = document.createElement('div');
            msgEl.innerHTML = `<strong>${userEmail}</strong>: ${msg.text} <small>(${timestamp})</small>`;
            messagesDiv.appendChild(msgEl);
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, (error) => {
        showError('Error loading messages: ' + error.message);
    });
}

signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        showError('Sign-out error: ' + error.message);
    });
});
