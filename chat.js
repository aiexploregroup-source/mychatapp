const signOutBtn = document.getElementById('signOutBtn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const errorDiv = document.getElementById('error');

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

// Initial auth check for safe access
let isAuthenticated = false;
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAuthenticated = true;
        loadMessages();
    } else {
        isAuthenticated = false;
        window.location.href = 'index.html'; // Safe redirect if not authenticated
    }
});

signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html'; // Safe redirect after sign-out
    }).catch((error) => {
        showError('Sign-out error: ' + error.message);
    });
});

// Chat Functionality with error handling
sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) {
        showError('Message cannot be empty.');
        return;
    }
    if (!isAuthenticated || !auth.currentUser) {
        showError('You must be signed in to send messages.');
        return;
    }
    clearError();
    try {
        await addDoc(collection(db, 'messages'), {
            text: text,
            uid: auth.currentUser.uid,
            timestamp: new Date()
        });
        messageInput.value = '';
    } catch (error) {
        showError('Error sending message: ' + error.message);
    }
});

// Load and Listen for Messages
function loadMessages() {
    if (!isAuthenticated) return;
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
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
