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
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Optional: Check if token is expired
    try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        return decoded.exp * 1000 > Date.now();
    } catch (error) {
        console.error("Invalid token:", error);
        return false;
    }
}

// Updated loginUser function
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


// Function to attach JWT token to API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Example function to fetch user data using JWT
async function fetchUserData() {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/user", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log("✅ User data:", userData);
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
    }
}

// Logout function
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
    document.cookie = "consentId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
    document.cookie = "cookiePreferences=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
    document.cookie = "cookiesAccepted=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict";
    showModal("✅ Logged out successfully!", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// Function to show a custom modal
function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) {
        existingModal.remove();
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

    setTimeout(() => {
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    }, 3000);
}