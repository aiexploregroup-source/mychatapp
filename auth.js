const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');

let isSigningUp = false;

signInBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
        alert('Sign-in error: ' + error.message);
    });
});

signUpBtn.addEventListener('click', () => {
    isSigningUp = true;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            if (confirm('Signup successful! Click OK to continue to the chat app.')) {
                window.location.href = 'chat.html';
            }
        })
        .catch((error) => {
            alert('Sign-up error: ' + error.message);
            isSigningUp = false;
        });
});

googleSignInBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
        alert('Google sign-in error: ' + error.message);
    });
});

onAuthStateChanged(auth, (user) => {
    if (user && !isSigningUp) {
        window.location.href = 'chat.html';
    }
});
