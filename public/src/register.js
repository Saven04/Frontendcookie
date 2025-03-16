document.addEventListener("DOMContentLoaded", () => {
    // Check auth state on page load
    updateNavbar();
});

document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const consentId = getCookie("consentId") || generateConsentId();
    const cookiesAccepted = getCookie("cookiesAccepted");

    console.log("Consent ID:", consentId);
    console.log("Cookies Accepted:", cookiesAccepted);

    if (!consentId || (cookiesAccepted !== "true" && cookiesAccepted !== "false")) {
        showModal(
            "❌ Please choose a cookie preference before registering. If you've already chosen, try refreshing the page.",
            "error"
        );
        resetButton();
        return;
    }

    if (!username || !email || !password || !confirmPassword) {
        showModal("All fields are required!", "error");
        resetButton();
        return;
    }
    if (!validateEmail(email)) {
        showModal("Invalid email address.", "error");
        resetButton();
        return;
    }
    if (password.length < 6) {
        showModal("Password must be at least 6 characters long.", "error");
        resetButton();
        return;
    }
    if (password !== confirmPassword) {
        showModal("Passwords do not match!", "error");
        resetButton();
        return;
    }

    try {
        // Send registration request to the backend
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId }) // Include consentId
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token for immediate login
            localStorage.setItem('token', data.token);

            // Clear old cookies and set new ones
            clearCookies();
            setCookie("consentId", consentId, 365);
            setCookie("cookiesAccepted", "true", 365);
            setCookie("cookiePreferences", JSON.stringify(getCookiePreferences()), 365);

            // Show success message
            showModal("✅ Registration successful! You are now logged in.", "success");

            // Reset the form and optionally redirect
            setTimeout(() => {
                document.getElementById("registerForm").reset();
                // Optionally redirect or update UI to reflect logged-in state
                // window.location.href = "profile.html"; // Uncomment if you have a profile page
            }, 1500);
        } else {
            // Show error message from the backend
            showModal(`❌ ${data.message || "Registration failed."}`, "error");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showModal("Registration failed. Please check your internet connection and try again.", "error");
    } finally {
        resetButton();
    }
});

// Logout Handler
document.getElementById("logoutLink")?.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        // Optionally call a logout endpoint
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            localStorage.removeItem("token");
            clearCookies(); // Optional: clear consent cookies if desired
            showModal("✅ Logged out successfully!", "success");
            updateNavbar(); // Reset UI to show Login/Register
        } else {
            throw new Error("Logout failed");
        }
    } catch (error) {
        console.error("❌ Logout error:", error);
        showModal("Failed to logout. Please try again.", "error");
    }
});

// Helper Functions
function updateNavbar() {
    const authButton = document.getElementById("authButton");
    const logoutButton = document.getElementById("logoutButton");
    const token = localStorage.getItem("token");

    if (token) {
        authButton.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        authButton.style.display = "block";
        logoutButton.style.display = "none";
    }
}


function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) {
            console.log(`Retrieved cookie: ${cookieName}=${decodeURIComponent(cookieValue)}`);
            return decodeURIComponent(cookieValue);
        }
    }
    console.log(`Cookie not found: ${name}`);
    return null;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function clearCookies() {
    document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    });
}

function getCookiePreferences() {
    return {
        strictlyNecessary: true,
        performance: document.getElementById("performance")?.checked || false,
        functional: document.getElementById("functional")?.checked || false,
        advertising: document.getElementById("advertising")?.checked || false,
        socialMedia: document.getElementById("socialMedia")?.checked || false,
    };
}

function resetButton() {
    const registerButton = document.querySelector(".login-button");
    if (registerButton) {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
}

function showModal(message, type) {
    const modalContainer = document.createElement("div");
    modalContainer.id = "customModal";
    modalContainer.classList.add("modal", type);

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("close-button");
    closeButton.addEventListener("click", () => {
        document.body.removeChild(modalContainer);
    });

    modalContent.appendChild(messageElement);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);

    document.body.appendChild(modalContainer);

    setTimeout(() => {
        if (document.getElementById("customModal")) {
            document.body.removeChild(modalContainer);
        }
    }, 3000);
}

function generateConsentId() {
    const randomId = Math.random().toString(36).substring(2, 15);
    console.log("Generated new consentId:", randomId);
    return randomId;
}