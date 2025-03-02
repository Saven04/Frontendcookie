// ✅ Fetch IP Information
async function getIpInfo() {
    try {
        const response = await fetch("https://your-backend-url.com/api/get-ipinfo");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Error fetching IP info:", error);
        return null;
    }
}

// ✅ Fetch Consent ID
async function fetchConsentID() {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/generate-consent-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.consentId;
    } catch (error) {
        console.error("❌ Error fetching consentId:", error.message || error);
        return null;
    }
}

// ✅ Cookie Handling Functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    const nameEq = `${name}=`;
    return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
}

// ✅ Show Custom Modal
function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) {
        existingModal.remove(); // Avoid duplicate modals
    }

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
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    });

    modalContent.appendChild(messageElement);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Auto-close modal after 3 seconds
    setTimeout(() => {
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    }, 3000);
}

// ✅ Reset Button
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    if (registerButton) {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
}

// ✅ Register Form Submission Event Listener
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const registerButton = document.querySelector(".login-button");
    if (registerButton) {
        registerButton.disabled = true;
        registerButton.textContent = "Registering...";
    }

    const usernameField = document.getElementById("username");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");

    if (!usernameField || !emailField || !passwordField || !confirmPasswordField) {
        showModal("❌ Error: Missing input fields in the DOM.", "error");
        resetButton();
        return;
    }

    const username = usernameField.value.trim();
    const email = emailField.value.trim();
    const password = passwordField.value.trim();
    const confirmPassword = confirmPasswordField.value.trim();

    // ✅ Validate Inputs
    if (!username || !email || !password || !confirmPassword) {
        showModal("❌ All fields are required!", "error");
        resetButton();
        return;
    }
    if (password.length < 6) {
        showModal("❌ Password must be at least 6 characters long.", "error");
        resetButton();
        return;
    }
    if (password !== confirmPassword) {
        showModal("❌ Passwords do not match!", "error");
        resetButton();
        return;
    }

    // ✅ Fetch Consent ID
    let consentId = getCookie("consentId");
    if (!consentId) {
        consentId = (await fetchConsentID()) || generateShortUUID();
        setCookie("consentId", consentId, 365);
    }

    // ✅ Fetch IP Info
    const ipInfo = await getIpInfo();

    // ✅ Send Registration Request
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId, ipInfo }),
        });

        const data = await response.json();
        if (response.ok) {
            showModal("✅ Registration successful! Redirecting to login...", "success");

            setTimeout(() => {
                document.getElementById("registerForm").reset();
                window.location.href = "index.html";
            }, 1500);
        } else {
            showModal(`❌ ${data.message || "Registration failed."}`, "error");
        }
    } catch (error) {
        console.error("❌ Registration error:", error);
        showModal("❌ Registration failed. Please check your internet connection and try again.", "error");
    } finally {
        resetButton();
    }
});

// ✅ Generate Short Unique ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}
