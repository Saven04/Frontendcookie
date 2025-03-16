document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    // Retrieve form values
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Retrieve cookies
    const consentId = getCookie("consentId") || generateConsentId(); // Generate if missing
    const cookiesAccepted = getCookie("cookiesAccepted");

    // Log retrieved cookies for debugging
    console.log("Consent ID:", consentId);
    console.log("Cookies Accepted:", cookiesAccepted);

    // Ensure the user has chosen a cookie preference
    if (!consentId || (cookiesAccepted !== "true" && cookiesAccepted !== "false")) {
        showModal(
            "❌ Please choose a cookie preference before registering. If you've already chosen, try refreshing the page.",
            "error"
        );
        resetButton();
        return;
    }

    // Validate inputs
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
        // Log consent status with location data
        const consentStatus = cookiesAccepted === "true" ? "accepted" : "rejected";
        await saveLocationData(consentId, consentStatus); // Log consent for GDPR compliance

        // Log the payload for debugging
        console.log("Sending registration request with payload:", { username, email, password, consentId });

        // Send registration request to the backend
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token for immediate login
            localStorage.setItem("token", data.token);

            // Clear old cookies and set new ones
            clearCookies();
            setCookie("consentId", consentId, 365);
            setCookie("cookiesAccepted", cookiesAccepted, 365);
            setCookie("cookiePreferences", JSON.stringify(getCookiePreferences()), 365);

            // Show success message
            showModal("✅ Registration successful! You are now logged in.", "success");

            // Reset the form and optionally redirect
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

// Include saveLocationData and sendLocationDataToDB from previous work
async function saveLocationData(consentId, consentStatus) {
    try {
        const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
        if (!response.ok) {
            throw new Error(`Failed to fetch IP data! Status: ${response.status}`);
        }
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

// Helper functions (unchanged except for generateConsentId)
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