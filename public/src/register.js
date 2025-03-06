document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true; // Disable button to prevent multiple clicks
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Retrieve the consentId from cookies
    let consentId = getCookie("consentId");
    if (!consentId) {
        consentId = generateShortUUID(); // Generate one if it doesn't exist
        setCookie("consentId", consentId, 365); // Store it for 1 year
    }

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showModal("⚠️ All fields are required!", "error");
        resetButton();
        return;
    }
    if (password.length < 6) {
        showModal("⚠️ Password must be at least 6 characters long.", "error");
        resetButton();
        return;
    }
    if (password !== confirmPassword) {
        showModal("⚠️ Passwords do not match!", "error");
        resetButton();
        return;
    }

    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, consentId }), // Include consentId in the request body
        });

        const data = await response.json();
        if (response.ok) {
            // Store user details in localStorage
            localStorage.setItem("user", JSON.stringify({ username, email, consentId }));

            showModal("✅ Registration successful! Redirecting...", "success");
            setTimeout(() => {
                document.getElementById("registerForm").reset(); // Reset form
                window.location.href = "news.html"; // Redirect to news page
            }, 2000);
        } else {
            showModal(`❌ ${data.message || "Registration failed."}`, "error");
            resetButton();
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showModal("❌ Registration failed. Check your internet connection and try again.", "error");
        resetButton();
    }
});

// Function to reset the button after an action
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = false;
    registerButton.textContent = "Register";
}

// Function to show a custom modal
function showModal(message, type) {
    // Remove existing modal if present
    const existingModal = document.getElementById("customModal");
    if (existingModal) document.body.removeChild(existingModal);

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

// Utility functions for handling cookies
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10); // Generates a short unique ID
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return value;
    }
    return null;
}
