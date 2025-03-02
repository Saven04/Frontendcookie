document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM fully loaded and parsed!");

    // Ensure Bootstrap is loaded
    if (typeof bootstrap === "undefined") {
        console.error("❌ Bootstrap is not loaded! Modal functionality may not work.");
        return;
    }

    // Select modal element
    const authModalEl = document.getElementById("authModal");
    if (authModalEl) {
        console.log("✅ Auth Modal found.");

        // Initialize Bootstrap modal
        const authModal = new bootstrap.Modal(authModalEl, { keyboard: false });

        // Show Login Popup Only for New Users
        if (!isUserLoggedIn() && !sessionStorage.getItem("authModalShown")) {
            setTimeout(() => {
                console.log("🟢 Showing auth modal...");
                authModal.show();
                sessionStorage.setItem("authModalShown", "true");
            }, 5000); // Show after 5 seconds
        }

        // Attach event listeners for modal opening
        const authModalTrigger = document.getElementById("authModalTrigger");
        if (authModalTrigger) {
            authModalTrigger.addEventListener("click", () => {
                console.log("🟢 Login trigger clicked. Showing modal.");
                authModal.show();
            });
        } else {
            console.warn("⚠️ authModalTrigger button not found.");
        }

        // Attach event listeners for modal closing
        const closeAuthModal = document.getElementById("closeAuthModal");
        if (closeAuthModal) {
            closeAuthModal.addEventListener("click", () => {
                console.log("🔴 Closing auth modal.");
                authModal.hide();
            });
        } else {
            console.warn("⚠️ closeAuthModal button not found.");
        }
    } else {
        console.warn("⚠️ Auth Modal (#authModal) not found in the DOM.");
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

/**
 * Helper function to check if user is logged in.
 */
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
