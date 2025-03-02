document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners for login and signup forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }

    // Initialize Cookie Banner Logic
    handleCookieBanner();
});

function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    return token && token !== "undefined";
}

/**
 * Function to handle login logic.
 */
function handleLogin(event) {
    event.preventDefault();  // Prevent form submission from reloading the page

    // Retrieve the values
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    // Simulate a login process
    console.log("Logging in with", email, password);
    // Your login logic goes here (e.g., API call to authenticate)
    // On success, you can store the user token:
    // localStorage.setItem("token", userToken);
}

/**
 * Function to handle signup logic (if applicable).
 */
function handleSignup(event) {
    event.preventDefault();  // Prevent form submission from reloading the page

    // You can add signup logic here
}

/**
 * Function to handle cookie banner logic (if applicable).
 */
function handleCookieBanner() {
    // You can define your cookie banner behavior here
}
