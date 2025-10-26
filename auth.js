const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

function clearError() {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function showLoading() {
    loadingDiv.style.display = 'block';
    clearError();
}

signInBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        showError('Email and password are required.');
        return;
    }
    showLoading();
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
        showError('Sign-in error: ' + error.message);
    });
});

signUpBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
        showError('Email and password are required.');
        return;
    }
    showLoading();
    createUserWithEmailAndPassword(auth, email, password).catch((error) => {
        showError('Sign-up error: ' + error.message);
    });
});

googleSignInBtn.addEventListener('click', () => {
    showLoading();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
        // Fallback to redirect if popup fails
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            signInWithRedirect(auth, provider).catch((redirectError) => {
                showError('Google sign-in error: ' + redirectError.message);
            });
        } else {
            showError('Google sign-in error: ' + error.message);
        }
    });
});

// Safe redirect: Only redirect after auth state confirms user
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadingDiv.style.display = 'none';
        window.location.href = 'chat.html'; // Safe redirect after confirmation
    } else {
        loadingDiv.style.display = 'none';
    }
});
