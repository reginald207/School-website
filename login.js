// **Firebase Initialization (Replace with your actual config)**
const firebaseConfig = {
    apiKey: "AIzaSyBxtT17hSDupMGgZeOj9f1IUScGRDFEUZc",
    authDomain: "blog-page-ab3f9.firebaseapp.com",
    projectId: "blog-page-ab3f9",
    storageBucket: "blog-page-ab3f9.firebasestorage.app",
    messagingSenderId: "368602214392",
    appId: "1:368602214392:web:d1f5d9a3d636b090b6f00d",
    measurementId: "G-0DCW1GDKZZ"
  };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function handleLogin() {
    const emailInput = document.getElementById('username'); // Assuming username is email
    const passwordInput = document.getElementById('password');
    const errorDisplay = document.getElementById('error-display');
    const email = emailInput.value;
    const password = passwordInput.value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('Login successful:', user);
            window.location.href = 'admin.html'; // Redirect
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Login error:', errorCode, errorMessage);
            errorDisplay.textContent = errorMessage;
        });
}