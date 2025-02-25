document.addEventListener("DOMContentLoaded", () => {
    // Show Login Popup Only for New Users
    if (!isUserLoggedIn()) {
        setTimeout(() => {
            const authModal = new bootstrap.Modal(document.getElementById("authModal"));
            authModal.show();
        }, 5000);
    }

    // Handle Login Form Submission
    document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleLogin();
    });

    // Handle Sign-Up Form Submission
    document.getElementById("signupForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleSignup();
    });

    // Cookie Banner Logic
    handleCookieBanner();
});

/**
 * Handles user login.
 */
async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        showModal("❌ Please enter both email and password.", "error");
        return;
    }

    try {
        showLoading(true);
        const response = await fetchAPI("/api/login", "POST", { email, password });

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        showModal("✅ Login successful!", "success");

        setTimeout(() => window.location.href = "/index.html", 1500);
    } catch (error) {
        showModal(`❌ Login failed: ${error}`, "error");
    } finally {
        showLoading(false);
    }
}

/**
 * Handles user signup.
 */
async function handleSignup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (!name || !email || !password) {
        showModal("❌ Please fill in all fields.", "error");
        return;
    }

    try {
        showLoading(true);
        await fetchAPI("/api/register", "POST", { name, email, password });

        showModal("✅ Sign-up successful! Please log in.", "success");
    } catch (error) {
        showModal(`❌ ${error}`, "error");
    } finally {
        showLoading(false);
    }
}

/**
 * Handles the cookie banner display & user consent.
 */
function handleCookieBanner() {
    const cookieBanner = document.getElementById("cookieConsent");
    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    document.getElementById("acceptCookies").addEventListener("click", () => handleCookieConsent(true));
    document.getElementById("rejectCookies").addEventListener("click", () => handleCookieConsent(false));
}

/**
 * Stores user cookie preference.
 */
function handleCookieConsent(accepted) {
    setCookie("cookiesAccepted", accepted.toString(), 365);
    const cookieBanner = document.getElementById("cookieConsent");
    cookieBanner.classList.add("hide");
    setTimeout(() => cookieBanner.classList.remove("show", "hide"), 500);
}

/**
 * Helper function to check if user is logged in.
 */
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

/**
 * Helper function to set a cookie.
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

/**
 * Helper function to get a cookie.
 */
function getCookie(name) {
    return document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1] || null;
}

/**
 * Generic API call function.
 */
async function fetchAPI(endpoint, method, body = {}) {
    const response = await fetch(`https://backendcookie-8qc1.onrender.com${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
}
