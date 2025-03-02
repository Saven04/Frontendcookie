document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    setupEventListeners();
});

// ✅ Check if the user is logged in and redirect accordingly
function checkUserSession() {
    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "userDashboard.html";
    }
}

// ✅ Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// ✅ Attach JWT token to API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Event listeners setup
function setupEventListeners() {
    const loginRegisterButton = document.getElementById("loginRegisterBtn"); // Fixed ID
    const loginModal = document.getElementById("loginModal"); // Fixed ID
    const closeModal = document.getElementById("closeLoginModal"); // Fixed ID
    const logoutButton = document.getElementById("logout-btn");
    const loginForm = document.getElementById("loginForm");
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    // ✅ Open login modal on clicking "Login | Register"
    if (loginRegisterButton && loginModal) {
        loginRegisterButton.addEventListener("click", () => {
            loginModal.style.display = "flex";
        });
    }

    // ✅ Close login modal when clicking the close button
    if (closeModal && loginModal) {
        closeModal.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    // ✅ Close modal if clicking outside the content
    if (loginModal) {
        loginModal.addEventListener("click", (event) => {
            if (event.target === loginModal) {
                loginModal.style.display = "none";
            }
        });
    }

    // ✅ Handle user login
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const userInput = document.getElementById("userInput").value.trim();
            const password = document.getElementById("password").value.trim();
            if (!userInput || !password) {
                showModal("❌ Please enter your username/email and password.", "error");
                return;
            }
            await loginUser(userInput, password);
        });
    }

    // ✅ Handle user logout
    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    // ✅ Theme toggle button event listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            themeToggleBtn.textContent = document.body.classList.contains("dark-mode") 
                ? "🌙 Dark Mode" 
                : "☀️ Light Mode";
        });
    }
}

// ✅ User login function
async function loginUser(userInput, password) {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userInput, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Invalid credentials");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showModal("✅ Login successful!", "success");

        // ✅ Close login modal after successful login
        setTimeout(() => {
            document.getElementById("loginModal").style.display = "none";
            window.location.href = "/userDashboard.html";
        }, 1500);
    } catch (error) {
        showModal(`❌ Login failed: ${error.message}`, "error");
    }
}

// ✅ Fetch user data
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

// ✅ Logout function
function logoutUser() {
    localStorage.removeItem("token");
    showModal("✅ Logged out successfully!", "success");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// ✅ Custom modal function
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
