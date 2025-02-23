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
        window.location.href = "userDashboard.html";  // Fixed relative path
    }
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// Function to handle user login
async function loginUser(email, password) {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error("❌ Unexpected response:", textResponse);
            throw new Error("Invalid response from server.");
        }

        const data = await response.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            alert("✅ Login successful!");
            window.location.href = "userDashboard.html"; // Ensure correct path
        } else {
            throw new Error(data.message || "Login failed.");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        showModal(`❌ Login failed: ${error.message}`, "error");
    }
}

// Function to show a custom modal
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
