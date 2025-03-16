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
    const consentId = getCookie("consentId");
    const cookiesAccepted = getCookie("cookiesAccepted");

    // Ensure the user has chosen a cookie preference
    if (!consentId || cookiesAccepted !== "true") {
        showModal("❌ Please choose a cookie preference before registering.", "error");
        resetButton();
        return;
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

// Function to get cookie value
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

// Function to clear all cookies related to consent and preferences
function clearCookies() {
    document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.split("=");
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    });
}

// Function to retrieve current cookie preferences
function getCookiePreferences() {
    const preferences = {
        strictlyNecessary: true,
        performance: document.getElementById("performance")?.checked || false,
        functional: document.getElementById("functional")?.checked || false,
        advertising: document.getElementById("advertising")?.checked || false,
        socialMedia: document.getElementById("socialMedia")?.checked || false,
    };
    return preferences;
}

// Function to reset the register button
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    if (registerButton) {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
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
        document.body.removeChild(modalContainer);
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