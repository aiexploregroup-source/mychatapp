const signOutBtn = document.getElementById('signOutBtn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Redirect to sign-in if not authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        loadMessages();
    }
});

signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});

// Chat Functionality
sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (text && auth.currentUser) {
        try {
            await addDoc(collection(db, 'messages'), {
                text: text,
                uid: auth.currentUser.uid,
                timestamp: new Date()
            });
            messageInput.value = '';
        } catch (error) {
            alert('Error sending message: ' + error.message);
        }
    }
});

// Load and Listen for Messages
function loadMessages() {
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
    });
}