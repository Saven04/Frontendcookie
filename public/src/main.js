document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value.trim();

            if (!email || !password) {
                showModal("Please enter both email and password.", "error");
                return;
            }

            await loginUser(email, password);
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
        if (!response.ok) throw new Error(data.message || "Invalid credentials");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showModal("✅ Login successful!", "success");
        setTimeout(() => window.location.href = "/news.html", 1500);
    } catch (error) {
        console.error("Login error:", error);
        showModal(`❌ Login failed: ${error.message}`, "error");
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

            // Populate UI with preferences
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

// Call this function when needed, passing the stored consentId
const storedConsentId = localStorage.getItem("consentId"); // Assuming consentId is stored in localStorage
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
