document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const logoutButton = document.getElementById("logout");

    // Redirect logged-in users away from the login page
    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "news.html";
        return;
    }

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
                console.error("❌ Error during login:", error.message);
                showModal(`❌ Login failed: ${error.message}`, "error");
            }
        });
    }

    // Handle form submission for registration
    if (signupForm) {
        signupForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            try {
                // Get input values
                const usernameField = document.getElementById("signupUsername");
                const emailField = document.getElementById("signupEmail");
                const passwordField = document.getElementById("signupPassword");

                // Validate inputs
                if (!usernameField || !emailField || !passwordField) {
                    throw new Error("Error: Missing input fields in the DOM.");
                }

                const username = usernameField.value.trim();
                const email = emailField.value.trim();
                const password = passwordField.value.trim();

                if (!username || !email || !password) {
                    showModal("Please fill in all fields.", "error");
                    return;
                }

                // Get selected preferences
                const preferences = {
                    strictlyNecessary: true, // Always required
                    performance: document.getElementById("performance").checked,
                    functional: document.getElementById("functional").checked,
                    advertising: document.getElementById("advertising").checked,
                    socialMedia: document.getElementById("socialMedia").checked,
                };

                // Call the register function
                await registerUser(username, email, password, preferences);

                // Show success message
                showModal("✅ Registration successful! Please log in.", "success");

                // Switch to the login tab using Bootstrap's Tab API
                const loginTab = new bootstrap.Tab(document.getElementById("login-tab"));
                loginTab.show();
            } catch (error) {
                console.error("❌ Error during registration:", error.message);
                showModal(`❌ Registration failed: ${error.message}`, "error");
            }
        });
    }

    // Attach event listeners for logout button
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    // Fetch and apply user preferences if logged in
    if (isUserLoggedIn()) {
        const userId = getUserId();
        if (userId) {
            await fetchAndApplyPreferences(userId);
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
        const apiUrl = "https://backendcookie-8qc1.onrender.com/api/login"; // Use relative URL for flexibility
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
        if (!data.token || !data.user || !data.user.userId) {
            throw new Error("Invalid server response. Missing token or userId.");
        }

        // Save token and user data to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // Store the entire user object

        showModal("✅ Login successful!", "success");

        setTimeout(() => {
            window.location.href = "news.html"; // Redirect to news page after login
        }, 1500);
    } catch (error) {
        console.error("❌ Login error:", error.message);
        showModal(`❌ Login failed: ${error.message}`, "error");
    }
}

// ✅ Register a new user
async function registerUser(username, email, password, preferences) {
    try {
        const apiUrl = "https://backendcookie-8qc1.onrender.com/api/register"; // Use relative URL for flexibility
        console.log("📡 Sending request to:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, preferences }),
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            const errorData = await response.text(); // Try to read the response as text
            throw new Error(errorData || "Registration failed.");
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log("🚀 Server Response:", data);

        // Validate server response
        if (!data.message) {
            throw new Error("Invalid server response.");
        }

        // Success message will be shown by the caller
    } catch (error) {
        console.error("❌ Registration error:", error.message);
        throw error; // Re-throw the error for the caller to handle
    }
}

// ✅ Logout function
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showModal("✅ Logged out successfully!", "success");

    setTimeout(() => {
        window.location.href = "index.html"; // Redirect to login page after logout
    }, 1500);
}

// ✅ Safely retrieve userId from localStorage
function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) {
            throw new Error("User data is missing or invalid.");
        }
        return user.userId;
    } catch (error) {
        console.error("❌ Error retrieving userId:", error.message);
        return null; // Return null if userId cannot be retrieved
    }
}

// ✅ Function to fetch and apply user preferences
async function fetchAndApplyPreferences() {
    try {
        const userId = getUserId(); // Retrieve userId from localStorage

        // Validate userId
        if (!userId) {
            console.error("❌ User ID is missing or invalid.");
            showModal("Failed to load preferences. Please log in again.", "error");
            return;
        }

        const apiUrl = `https://backendcookie-8qc1.onrender.com/api/get-preferences?userId=${userId}`; // Use relative URL
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            const errorData = await response.text(); // Try to read the response as text
            throw new Error(errorData || "Failed to fetch preferences.");
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log("✅ Loaded Preferences:", data);

        // Validate preferences
        if (!data.preferences) {
            throw new Error("Invalid server response. Missing preferences.");
        }

        applyPreferences(data.preferences);
    } catch (error) {
        console.error("❌ Error fetching preferences:", error.message);
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