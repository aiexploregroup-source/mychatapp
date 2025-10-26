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

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    setTimeout(() => successDiv.style.display = 'none', 3000); // Hide after 3s
}

function clearMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
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

// Send message (global or private) - Fully functional with feedback
sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) {
        showError('Message cannot be empty.');
        return;
    }
    if (!isAuthenticated || !auth.currentUser) {
        showError('You must be signed in.');
        return;
    }
    clearMessages();
    try {
        if (currentChatType === 'private' && privateChatId) {
            const chatRef = doc(db, 'privateChats', privateChatId);
            await addDoc(collection(chatRef, 'messages'), {
                text: text,
                uid: auth.currentUser.uid,
                timestamp: new Date()
            });
        } else {
            await addDoc(collection(db, 'messages'), {
                text: text,
                uid: auth.currentUser.uid,
                timestamp: new Date()
            });
        }
        messageInput.value = '';
        showSuccess('Message sent!');
    } catch (error) {
        showError('Error sending message: ' + error.message);
    }
});

// Load messages (global or private) - Real-time for all users
function loadMessages() {
    if (!isAuthenticated) return;
    let q;
    if (currentChatType === 'private' && privateChatId) {
        const chatRef = doc(db, 'privateChats', privateChatId);
        q = query(collection(chatRef, 'messages'), orderBy('timestamp'));
    } else {
        q = query(collection(db, 'messages'), orderBy('timestamp'));
    }
    onSnapshot(q, (snapshot) => {
        messagesDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const msg = doc.data();
            const msgEl = document.createElement('div');
            msgEl.textContent = `${msg.uid}: ${msg.text}`;
            messagesDiv.appendChild(msgEl);
        });
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
