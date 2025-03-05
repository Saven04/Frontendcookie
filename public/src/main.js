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

    // Attach event listeners for logout button
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    // Fetch and apply user preferences if logged in
    if (isUserLoggedIn()) {
        const user = JSON.parse(localStorage.getItem("user"));
        fetchAndApplyPreferences(user.userId);
    }
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// ✅ Updated loginUser function to handle JWT-based authentication
async function loginUser(email, password) {
    try {
        const apiUrl = "https://backendcookie-8qc1.onrender.com/api/login"; // Update to match your backend route
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

        // Save token and user data to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Assuming backend returns user object

        showModal("✅ Login successful!", "success");

        setTimeout(() => {
            window.location.href = "news.html"; // Redirect to news page after login
        }, 1500);
    } catch (error) {
        console.error("Login error:", error);
        showModal(`❌ Login failed: ${error.message}`, "error");
    }
}

// ✅ Logout function
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showModal("✅ Logged out successfully!", "success");

    setTimeout(() => {
        window.location.href = "news.html"; // Redirect to login page after logout
    }, 1500);
}

// ✅ Function to fetch and apply user preferences
async function fetchAndApplyPreferences(userId) {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/user-preferences/${userId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch preferences.");
        }

        const data = await response.json();
        console.log("✅ Loaded Preferences:", data);

        applyPreferences(data.preferences);
    } catch (error) {
        console.error("❌ Error fetching preferences:", error);
        showModal("Failed to load preferences. Please try again.", "error");
    }
}

// Apply saved preferences to the UI
function applyPreferences(preferences) {
    document.getElementById("performance").checked = preferences.performance || false;
    document.getElementById("functional").checked = preferences.functional || false;
    document.getElementById("advertising").checked = preferences.advertising || false;
    document.getElementById("socialMedia").checked = preferences.socialMedia || false;

    // Hide the cookie banner if preferences are loaded
    const cookieBanner = document.getElementById("cookieConsent");
    if (cookieBanner) {
        cookieBanner.style.display = "none";
    }
}

// ✅ Function to attach JWT token to API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
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