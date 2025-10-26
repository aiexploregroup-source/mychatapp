  const signInBtn = document.getElementById('signInBtn');
  const signUpBtn = document.getElementById('signUpBtn');
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  const errorDiv = document.getElementById('error');
  const loadingDiv = document.getElementById('loading');

  function showError(message) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      loadingDiv.style.display = 'none';
      console.error('Auth Error:', message); // Added for debugging
  }

  function clearError() {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
  }

  function showLoading() {
      loadingDiv.style.display = 'block';
      clearError();
  }

  // Helper to force redirect check
  function checkAndRedirect() {
      if (auth.currentUser) {
          console.log('User authenticated, redirecting to chat.html'); // Debug log
          window.location.href = 'chat.html';
      } else {
          console.log('No user found, staying on sign-in page'); // Debug log
      }
  }

  signInBtn.addEventListener('click', () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !password) {
          showError('Email and password are required.');
          return;
      }
      showLoading();
      console.log('Attempting email sign-in'); // Debug log
      signInWithEmailAndPassword(auth, email, password)
          .then(() => {
              console.log('Email sign-in successful'); // Debug log
              checkAndRedirect(); // Force check as safety net
          })
          .catch((error) => {
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
      console.log('Attempting sign-up'); // Debug log
      createUserWithEmailAndPassword(auth, email, password)
          .then(() => {
              console.log('Sign-up successful'); // Debug log
              checkAndRedirect(); // Force check as safety net
          })
          .catch((error) => {
              showError('Sign-up error: ' + error.message);
          });
  });

  googleSignInBtn.addEventListener('click', () => {
      showLoading();
      console.log('Attempting Google sign-in'); // Debug log
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
          .then(() => {
              console.log('Google popup sign-in successful'); // Debug log
              checkAndRedirect(); // Force check as safety net
          })
          .catch((error) => {
              if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                  console.log('Popup failed, trying redirect'); // Debug log
                  signInWithRedirect(auth, provider).catch((redirectError) => {
                      showError('Google sign-in error: ' + redirectError.message);
                  });
              } else {
                  showError('Google sign-in error: ' + error.message);
              }
          });
  });

  // Enhanced auth state listener with delay for redirect cases
  onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User signed in' : 'No user'); // Debug log
      if (user) {
          loadingDiv.style.display = 'none';
          // Small delay to ensure state is fully settled (especially for redirects)
          setTimeout(() => {
              window.location.href = 'chat.html';
          }, 500);
      } else {
          loadingDiv.style.display = 'none';
      }
  });
  
