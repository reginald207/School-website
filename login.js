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

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorDisplay = document.getElementById('error-message');
    const exitButton = document.getElementById('exit-login-button'); // Get the exit button

    // Attach event listener to the form's submit event
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const email = emailInput.value;
            const password = passwordInput.value;

            // Clear previous error messages
            errorDisplay.textContent = '';

            try {
                // Attempt to sign in with email and password
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                console.log('Login successful:', user);

                // Redirect to the admin dashboard upon successful login
                window.location.href = 'admin.html'; 

            } catch (error) {
                // Handle errors during login
                const errorMessage = error.message;
                console.error('Login error:', error.code, errorMessage);
                
                // Display user-friendly error message
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorDisplay.textContent = 'Please enter a valid email address.';
                        break;
                    case 'auth/user-disabled':
                        errorDisplay.textContent = 'Your account has been disabled. Please contact support.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorDisplay.textContent = 'Invalid email or password. Please try again.';
                        break;
                    case 'auth/network-request-failed':
                        errorDisplay.textContent = 'Network error. Please check your internet connection.';
                        break;
                    default:
                        errorDisplay.textContent = 'Login failed. Please try again later.';
                        break;
                }
            }
        });
    } else {
        console.error("Login form not found. Please check your HTML structure.");
    }

    // Add event listener for the exit button
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            // Redirect back to the blog page (or news and events page)
            window.location.href = 'blogpage.html'; 
        });
    } else {
        console.error("Exit button not found. Please check your HTML structure.");
    }
});
