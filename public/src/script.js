document.addEventListener("DOMContentLoaded", () => {
    // Show Login Popup Only for New Users
    const authModalEl = document.getElementById("authModal");
    if (authModalEl && !isUserLoggedIn() && !sessionStorage.getItem("authModalShown")) {
        const loginForm = document.getElementById("loginForm");
        const signupForm = document.getElementById("signupForm");
        if (!loginForm || !signupForm) {
            console.error("❌ Login or signup form not found in modal.");
            return;
        }
        setTimeout(() => {
            const authModal = new bootstrap.Modal(authModalEl);
            authModal.show();
            sessionStorage.setItem("authModalShown", "true");
        }, 5000);
    }

    // Handle Login Form Submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleLogin();
        });
    }

    // Handle Sign-Up Form Submission
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleSignup();
        });
    }

    // Cookie Banner Logic
    handleCookieBanner();
});

/**
 * Handles user login.
 */
async function handleLogin() {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    if (!emailInput || !passwordInput) {
        console.error("❌ Missing login form fields.");
        return;
    }
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateFormInputs({ email, password })) return;

    try {
        showLoading(true);
        const response = await fetchAPI("/api/login", "POST", { email, password });
        if (response.token) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            showModal("✅ Login successful!", "success");
            setTimeout(() => window.location.href = "/index.html", 1500);
        } else {
            throw new Error("Invalid response from server");
        }
    } catch (error) {
        showModal(`❌ Login failed: ${error.message || error}`, "error");
    } finally {
        showLoading(false);
    }
}

/**
 * Handles user signup.
 */
async function handleSignup() {
    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");
    if (!nameInput || !emailInput || !passwordInput) {
        console.error("❌ Missing signup form fields.");
        return;
    }
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!validateFormInputs({ name, email, password })) return;

    try {
        showLoading(true);
        await fetchAPI("/api/register", "POST", { name, email, password });
        showModal("✅ Sign-up successful! Please log in.", "success");
    } catch (error) {
        showModal(`❌ ${error.message || error}`, "error");
    } finally {
        showLoading(false);
    }
}

/**
 * Handles the cookie banner display & user consent.
 */
function handleCookieBanner() {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptBtn = document.getElementById("acceptCookies");
    const rejectBtn = document.getElementById("rejectCookies");

    if (!cookieBanner) {
        console.warn("⚠️ Cookie banner element (#cookieConsent) not found.");
        return;
    }

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => handleCookieConsent(true));
    } else {
        console.warn("⚠️ Accept cookies button (#acceptCookies) not found.");
    }

    if (rejectBtn) {
        rejectBtn.addEventListener("click", () => handleCookieConsent(false));
    } else {
        console.warn("⚠️ Reject cookies button (#rejectCookies) not found.");
    }
}

/**
 * Stores user cookie preference.
 */
function handleCookieConsent(accepted) {
    setCookie("cookiesAccepted", accepted.toString(), 365);
    const cookieBanner = document.getElementById("cookieConsent");
    if (!cookieBanner) return;
    cookieBanner.classList.add("hide");
    setTimeout(() => cookieBanner.classList.remove("show", "hide"), 500);
}

/**
 * Helper function to check if user is logged in.
 */
function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    return token !== null && token !== "undefined";
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
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com${endpoint}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error("❌ API Error:", error.message || "Network error");
        throw error;
    }
}

/**
 * Shows a modal with a message.
 */
function showModal(message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Implement UI logic to display the modal here
}

/**
 * Toggles a loading spinner.
 */
function showLoading(isLoading) {
    const loader = document.getElementById("loader");
    if (!loader) {
        console.warn("⚠️ Loader element (#loader) not found.");
        return;
    }
    loader.style.display = isLoading ? "block" : "none";
}

/**
 * Validates form inputs.
 */
function validateFormInputs(inputs) {
    for (const [id, value] of Object.entries(inputs)) {
        if (!value.trim()) {
            showModal(`❌ Please enter a valid ${id.replace(/([A-Z])/g, " $1").toLowerCase()}.`, "error");
            return false;
        }
    }
    return true;
}