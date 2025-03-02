document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM fully loaded and parsed!");

    // Ensure Bootstrap is loaded
    if (typeof bootstrap === "undefined") {
        console.error("❌ Bootstrap is not loaded! Modal functionality may not work.");
        return;
    }

    
    // Attach event listeners for login and signup forms
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
        console.log("✅ Login form event attached.");
    } else {
        console.warn("⚠️ Login form (#loginForm) not found in the DOM.");
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
        console.log("✅ Signup form event attached.");
    } else {
        console.warn("⚠️ Signup form (#signupForm) not found in the DOM.");
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
    console.log("🟢 Login form submitted!");

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
    console.log("🟢 Signup form submitted!");

    // You can add signup logic here
}

/**
 * Function to handle cookie banner logic (if applicable).
 */
function handleCookieBanner() {
    // You can define your cookie banner behavior here
    console.log("🟢 Handling Cookie Banner...");
}
