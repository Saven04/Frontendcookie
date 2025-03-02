document.addEventListener("DOMContentLoaded", () => {
    // Initialize Login/Signup Forms
    initializeAuthForms();

    // Initialize Cookie Banner Logic
    initializeCookieBanner();

    // Initialize Theme Toggle Button
    initializeThemeToggle();
});

/**
 * Function to initialize login and signup forms.
 */
function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
}

/**
 * Function to check if a user is logged in.
 */
function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    return token && token !== "undefined";
}

/**
 * Function to handle login logic.
 */
function handleLogin(event) {
    event.preventDefault(); // Prevent form submission from reloading the page

    // Retrieve form values
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();

    // Validate input fields
    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    // Simulate a login process (replace this with your actual API call)
    console.log("Logging in with:", email, password);

    // Mock API response (replace with real API logic)
    const mockUserToken = "mock-token-123"; // Simulated token
    if (email === "test@example.com" && password === "password123") {
        // Store the token in localStorage
        localStorage.setItem("token", mockUserToken);

        // Redirect or update UI after successful login
        alert("Login successful!");
        window.location.href = "/dashboard.html"; // Redirect to dashboard or home
    } else {
        alert("Invalid email or password.");
    }
}

/**
 * Function to handle signup logic.
 */
function handleSignup(event) {
    event.preventDefault(); // Prevent form submission from reloading the page

    // Retrieve form values
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    // Validate input fields
    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    // Simulate a signup process (replace this with your actual API call)
    console.log("Signing up with:", email, password);

    // Mock API response (replace with real API logic)
    alert("Signup successful! Please log in.");
    window.location.href = "/login.html"; // Redirect to login page
}

/**
 * Function to handle cookie banner logic.
 */
function initializeCookieBanner() {
    const cookieConsent = document.getElementById("cookieConsent");
    const acceptCookiesBtn = document.getElementById("acceptCookies");
    const rejectCookiesBtn = document.getElementById("rejectCookies");
    const customizeCookiesBtn = document.getElementById("customizeCookies");

    // Check if user has already accepted/rejected cookies
    const userCookiePreference = localStorage.getItem("cookieConsent");

    if (userCookiePreference === "accepted") {
        hideCookieBanner();
    } else if (userCookiePreference === "rejected") {
        hideCookieBanner();
        disableNonEssentialCookies();
    } else {
        // Show the cookie banner
        cookieConsent.style.display = "block";
    }

    // Accept Cookies
    acceptCookiesBtn.addEventListener("click", () => {
        localStorage.setItem("cookieConsent", "accepted");
        hideCookieBanner();
        enableAllCookies();
    });

    // Reject Cookies
    rejectCookiesBtn.addEventListener("click", () => {
        localStorage.setItem("cookieConsent", "rejected");
        hideCookieBanner();
        disableNonEssentialCookies();
    });

    // Customize Cookies
    customizeCookiesBtn.addEventListener("click", () => {
        openCookiePreferencesModal();
    });
}

/**
 * Function to hide the cookie banner.
 */
function hideCookieBanner() {
    const cookieConsent = document.getElementById("cookieConsent");
    cookieConsent.style.display = "none";
}

/**
 * Function to enable all cookies.
 */
function enableAllCookies() {
    console.log("Enabling all cookies...");
    // Your logic to enable all cookies goes here
}

/**
 * Function to disable non-essential cookies.
 */
function disableNonEssentialCookies() {
    console.log("Disabling non-essential cookies...");
    // Your logic to disable non-essential cookies goes here
}

/**
 * Function to open the cookie preferences modal.
 */
function openCookiePreferencesModal() {
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");
    cookiePreferencesModal.classList.add("show");
}

/**
 * Function to initialize theme toggle button.
 */
function initializeThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
        updateThemeIcon(savedTheme);
    }

    // Add event listener for theme toggle
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        // Save the new theme preference
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);

        // Update the icon
        updateThemeIcon(newTheme);
    });
}

/**
 * Function to update the theme toggle icon.
 */
function updateThemeIcon(theme) {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    themeToggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
}