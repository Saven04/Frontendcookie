document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logout");

    // Handle form submission for login
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                // Get input values
                const emailField = document.getElementById("email");
                const passwordField = document.getElementById("password");

                // Validate inputs
                if (!emailField || !passwordField) {
                    throw new Error("Error: Missing input fields in the DOM.");
                }

                const email = emailField.value.trim();
                const password = passwordField.value.trim();

                if (!email || !password) {
                    showModal("Please enter both email and password.", "error");
                    return;
                }

                // Call the login function
                await loginUser(email, password);
            } catch (error) {
                console.error("Error during login:", error.message);
                showModal(`❌ Login failed: ${error.message}`, "error");
            }
        });
    }

    // Redirect logged-in users away from the login page
    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "news.html";
    }

    // Attach event listeners for logout button
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    // Fetch and apply user preferences if logged in
    if (isUserLoggedIn()) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.userId) {
            await fetchAndApplyPreferences(user.userId);
        } else {
            console.error("❌ User data is missing or invalid.");
        }
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

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            const errorData = await response.text(); // Try to read the response as text
            throw new Error(errorData || "Invalid credentials");
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log("🚀 Server Response:", data);

        // Validate server response
        if (!data.token || !data.user) {
            throw new Error("Invalid server response. Missing token or user data.");
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
        window.location.href = "news.html"; 
    }, 1500);
}

// ✅ Function to fetch and apply user preferences
async function fetchAndApplyPreferences(userId) {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/get-preferences?userId=${userId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch preferences.");
        }

        const data = await response.json();
        console.log("✅ Loaded Preferences:", data);

        // Validate preferences
        if (!data.preferences) {
            throw new Error("Invalid server response. Missing preferences.");
        }

        applyPreferences(data.preferences);
    } catch (error) {
        console.error("❌ Error fetching preferences:", error);
        showModal("Failed to load preferences. Please try again.", "error");
    }
}
// Apply saved preferences to the UI
function applyPreferences(preferences) {
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

    if (
        !performanceCheckbox ||
        !functionalCheckbox ||
        !advertisingCheckbox ||
        !socialMediaCheckbox
    ) {
        console.error("❌ Missing preference checkboxes in the DOM.");
        return;
    }

    performanceCheckbox.checked = preferences.performance || false;
    functionalCheckbox.checked = preferences.functional || false;
    advertisingCheckbox.checked = preferences.advertising || false;
    socialMediaCheckbox.checked = preferences.socialMedia || false;

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