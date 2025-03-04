// Register form submission handler
document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true; // Disable button to prevent multiple clicks
    registerButton.textContent = "Registering...";

    // Retrieving form values
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Retrieve or generate consentId
    const consentId = getCookie("consentId") || generateShortUUID(); // Generate one if it doesn't exist
    setCookie("consentId", consentId, 365); // Ensure the consentId is stored in cookies

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
            body: JSON.stringify({ username, email, password, consentId }), // Removed phone from request body since it's not used
        });

        const data = await response.json();
        if (response.ok) {
            showModal("✅ Registration successful! Please check your email for MFA code.", "success");
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

// Function to reset the button after an action
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = false;
    registerButton.textContent = "Register";
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

// Function to generate a short unique consent ID
function generateShortUUID() {
    const consentId = Math.random().toString(36).substring(2, 8); // Shortened to 6 characters
    localStorage.setItem("consentId", consentId);
    Cookies.set("consentId", consentId, { expires: 365, path: '/' });
    return consentId;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

// Function to get a cookie value
function getCookie(name) {
    const nameEq = `${name}=`;
    return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
}
