// Utility functions for handling cookies
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

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    const nameEq = `${name}=`;
    return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
}

// Function to show a custom modal
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
        if (document.getElementById("customModal")) {
            document.body.removeChild(modalContainer);
        }
    });

    modalContent.appendChild(messageElement);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Automatically close the modal after 3 seconds
    setTimeout(() => {
        if (document.getElementById("customModal")) {
            document.body.removeChild(modalContainer);
        }
    }, 3000);
}

// Function to reset the button after an action
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = false;
    registerButton.textContent = "Register";
}

// Register form submission event listener
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true; // Disable button to prevent multiple clicks
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Retrieve the consentId from cookies or generate a new one if necessary
    let consentId = getCookie("consentId");
    if (!consentId) {
        consentId = await fetchConsentID() || generateShortUUID();
        setCookie("consentId", consentId, 365);
    }

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showModal("All fields are required!", "error");
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
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId }), // Include consentId in request
        });

        const data = await response.json();
        if (response.ok) {
            showModal("✅ Registration successful! Redirecting to login...", "success");

            setTimeout(() => {
                document.getElementById("registerForm").reset(); // Reset form
                window.location.href = "index.html"; // Redirect to login page
            }, 1500);
        } else {
            showModal(`❌ ${data.message || "Registration failed."}`, "error");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showModal("Registration failed. Please check your internet connection and try again.", "error");
    } finally {
        resetButton();
    }
});

// Generates a short unique ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}
