document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const authButton = document.getElementById("authButton");
    const toggleAuthMode = document.getElementById("toggleAuthMode");
    const usernameField = document.getElementById("usernameField");

    let isLoginMode = true;

    if (authForm) {
        authForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value.trim();
            const username = document.getElementById("username")?.value.trim();

            if (!email || !password || (!isLoginMode && !username)) {
                showModal("Please fill in all required fields.", "error");
                return;
            }

            if (isLoginMode) {
                await loginUser(email, password);
            } else {
                await registerUser(username, email, password);
            }
        });
    }

    if (toggleAuthMode) {
        toggleAuthMode.addEventListener("click", (event) => {
            event.preventDefault();
            isLoginMode = !isLoginMode;

            if (isLoginMode) {
                authButton.textContent = "Login";
                usernameField.style.display = "none";
                toggleAuthMode.innerHTML = "Don't have an account? <a href='#'>Sign Up</a>";
            } else {
                authButton.textContent = "Sign Up";
                usernameField.style.display = "block";
                toggleAuthMode.innerHTML = "Already have an account? <a href='#'>Login</a>";
            }
        });
    }

    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "news.html";
    }
});

function isUserLoggedIn() {
    return !!localStorage.getItem("token");
}

async function loginUser(email, password) {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem("token", data.token);
            showModal("✅ Login successful!", "success");
            setTimeout(() => window.location.href = "news.html", 1500);
        } else {
            showModal(data.message || "Login failed.", "error");
        }
    } catch (error) {
        showModal("❌ Error logging in: " + error.message, "error");
    }
}

async function registerUser(username, email, password) {
    try {
        // Generate or retrieve Consent ID
        let consentId = localStorage.getItem("consentId");
        if (!consentId) {
            consentId = self.crypto.randomUUID(); // Generate a unique UUID
            localStorage.setItem("consentId", consentId); // Store it for future use
        }

        // Prepare request body
        const requestBody = { username, email, password, consentId };

        console.log("📩 Sending registration request:", requestBody);

        // Send POST request to backend
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        // Parse the response
        const data = await response.json();
        console.log("📩 Server response:", data);

        if (response.ok) {
            showModal("✅ Registration successful! Please log in.", "success");
            setTimeout(() => window.location.href = "index.html", 1500);
        } else {
            showModal(data.message || "❌ Registration failed.", "error");
        }
    } catch (error) {
        console.error("❌ Error in registerUser:", error);
        showModal("❌ Error registering: " + error.message, "error");
    }
}


async function getUserPreferences(consentId) {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/getPreferences?consentId=${consentId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch preferences");
        }

        const data = await response.json();
        if (data.success) {
            console.log("✅ User Preferences:", data.preferences);

            document.getElementById("performance").checked = data.preferences.performance || false;
            document.getElementById("functional").checked = data.preferences.functional || false;
            document.getElementById("advertising").checked = data.preferences.advertising || false;
            document.getElementById("socialMedia").checked = data.preferences.socialMedia || false;
        } else {
            console.error("❌ Error fetching preferences:", data.message);
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

const storedConsentId = localStorage.getItem("consentId");
if (storedConsentId) {
    getUserPreferences(storedConsentId);
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchUserData() {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/user", {
            method: "GET",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });

        if (!response.ok) throw new Error(`Failed to fetch user data: ${response.status}`);

        const userData = await response.json();
        console.log("✅ User data:", userData);
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
    }
}

function logoutUser() {
    localStorage.removeItem("token");
    showModal("✅ Logged out successfully!", "success");
    setTimeout(() => window.location.href = "index.html", 1500);
}

function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) existingModal.remove();

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
    closeButton.addEventListener("click", () => document.body.removeChild(modalContainer));

    modalContent.append(messageElement, closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    setTimeout(() => document.body.removeChild(modalContainer), 3000);
} 
