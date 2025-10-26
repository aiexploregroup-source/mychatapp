// DOM Elements
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authDiv = document.getElementById('auth');
const chatDiv = document.getElementById('chat');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Authentication Event Listeners
signInBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
        alert('Sign-in error: ' + error.message);
    });
});

signUpBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, email, password).catch((error) => {
        alert('Sign-up error: ' + error.message);
    });
});

googleSignInBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
        alert('Google sign-in error: ' + error.message);
    });
});

signOutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        authDiv.style.display = 'none';
        chatDiv.style.display = 'block';
        loadMessages();
    } else {
        authDiv.style.display = 'block';
        chatDiv.style.display = 'none';
        messagesDiv.innerHTML = ''; // Clear messages on sign out
    }
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
        // Auto-scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}