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
        const consentStatus = cookiesAccepted === "true" ? "accepted" : "rejected";
        await saveLocationData(consentId, consentStatus);

        console.log("Sending registration request with payload:", { username, email, password, consentId });

        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);

            clearCookies();
            setCookie("consentId", consentId, 365);
            setCookie("cookiesAccepted", cookiesAccepted, 365);
            setCookie("cookiePreferences", JSON.stringify(getCookiePreferences()), 365);

            showModal("✅ Registration successful! You are now logged in.", "success");
            updateNavbar(); // Update UI to show logout

            setTimeout(() => {
                document.getElementById("registerForm").reset();
                 window.location.href = "news.html"; 
            }, 1500);
        } else {
            console.error("Registration failed:", { status: response.status, data });
            const errorMessage = data.message || "Registration failed. Please try again.";
            showModal(`❌ ${errorMessage}`, "error");
        }
    } catch (error) {
        console.error("❌ Registration error:", error.message || error);
        showModal("An unexpected error occurred. Please try again later.", "error");
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

async function saveLocationData(consentId, consentStatus) {
    try {
        const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
        if (!response.ok) throw new Error(`Failed to fetch IP data! Status: ${response.status}`);
        const data = await response.json();

        const locationData = {
            consentId: String(consentId),
            ipAddress: data.ip || "unknown",
            country: data.country || "unknown",
            region: data.region || null,
            purpose: "consent-logging",
            consentStatus: consentStatus || "not-applicable"
        };

        console.log("Prepared location data:", JSON.stringify(locationData, null, 2));
        await sendLocationDataToDB(locationData);
    } catch (error) {
        console.error("❌ Error fetching or saving location data:", error.message || error);
    }
}

async function sendLocationDataToDB(locationData) {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to save location data: ${response.status} - ${errorData.message || "No details"}`);
        }

        const result = await response.json();
        console.log("✅ Location data saved:", result.message);
    } catch (error) {
        console.error("❌ Error sending location data to DB:", error.message || error);
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