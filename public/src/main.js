// Import cookie functions (if using ES6 modules)
// import { setCookie, getCookie } from './cookieSettings.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Get input values
            const emailField = document.getElementById("email");
            const passwordField = document.getElementById("password");

            // Validate inputs
            if (!emailField || !passwordField) {
                console.error("Error: Missing input fields in the DOM.");
                showModal("Error: Missing input fields in the DOM.", "error");
                return;
            }

            const email = emailField.value.trim();
            const password = passwordField.value.trim();

            if (!email || !password) {
                showModal("Please enter both email and password.", "error");
                return;
            }

            // Call the login function
            await loginUser(email, password);
        });
    }

    // Redirect logged-in users away from the login page
    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "news.html";
    }
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// ✅ Updated loginUser function to handle both JWT and session-based logins
async function loginUser(email, password) {
    try {
        const apiUrl = "https://backendcookie-8qc1.onrender.com/api/login";
        console.log("📡 Sending request to:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("🚀 Server Response:", data);

        if (!response.ok) {
            throw new Error(data.message || "Invalid credentials");
        }

        // Store authentication token and user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Store cookie preferences in browser cookies
        document.cookie = `token=${data.token}; path=/; Secure; HttpOnly`;
        document.cookie = `consentId=${data.consentId}; path=/; Secure`;
        document.cookie = `cookiePreferences=${JSON.stringify(data.cookiePreferences)}; path=/; Secure`;
        document.cookie = `cookiesAccepted=true; path=/; Secure`;

        showModal("✅ Login successful!", "success");

        setTimeout(() => {
            window.location.href = "/news.html";
        }, 1500);
    } catch (error) {
        console.error("Login error:", error);
        showModal(`❌ Login failed: ${error.message}`, "error");
    }
}



// ✅ Function to attach JWT token to API requests
async function checkAuth() {
    try {
        const token = localStorage.getItem("token"); // Get the stored JWT token
        if (!token) {
            console.log("🚫 No token found. User is not authenticated.");
            return false;
        }

        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/check-auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in headers
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("🔍 Auth Check Response:", data);

        if (data.authenticated) {
            console.log("✅ User is authenticated:", data.userId);
            return true; // User is logged in
        } else {
            console.log("🚫 Authentication failed. Redirecting to login...");
            return false; // User is not logged in
        }
    } catch (error) {
        console.error("❌ Error checking authentication:", error);
        return false;
    }
}


// ✅ Logout function
function logoutUser() {
    localStorage.removeItem("token");
    showModal("✅ Logged out successfully!", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// ✅ Function to show a custom modal
function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) {
        existingModal.remove(); // Remove any existing modal to avoid duplicates
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

    // Automatically close the modal after 3 seconds
    setTimeout(() => {
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    }, 3000);
}