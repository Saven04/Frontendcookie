document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            if (!email || !password) {
                showModal("❌ Please enter both email and password.", "error");
                return;
            }
            await loginUser(email, password);
        });
    }

    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "userDashboard.html";
    }
});

// ✅ Check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// ✅ Handle User Login
async function loginUser(email, password) {
    try {
        showLoading(true);
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

        setTimeout(() => window.location.href = "/userDashboard.html", 1500);
    } catch (error) {
        showModal(`❌ Login failed: ${error.message}`, "error");
    } finally {
        showLoading(false);
    }
}

// ✅ Logout function
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showModal("✅ Logged out successfully!", "success");
    setTimeout(() => window.location.href = "login.html", 1500);
}

// ✅ Show Modal for Messages
function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "customModal";
    modal.classList.add("modal", type);

    const content = document.createElement("div");
    content.classList.add("modal-content");

    const messageElem = document.createElement("p");
    messageElem.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("close-button");
    closeButton.addEventListener("click", () => modal.remove());

    content.append(messageElem, closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);

    setTimeout(() => modal.remove(), 3000);
}

// ✅ Show Loading Indicator
function showLoading(show) {
    const loadingOverlay = document.getElementById("loadingOverlay");
    if (loadingOverlay) loadingOverlay.style.display = show ? "block" : "none";
}
