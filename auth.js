const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');

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

// Redirect to chat after sign-in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'chat.html';
    }
});