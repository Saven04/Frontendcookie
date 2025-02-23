document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // Check if the user is authenticated
    if (!token) {
        showAlert("Unauthorized access! Redirecting to login.", "error");
        setTimeout(() => {
            window.location.href = "/index.html";
        }, 2000);
        return;
    }

    // DOM Elements
    const usernameElement = document.getElementById("username");
    const emailElement = document.getElementById("email");
    const consentIdElement = document.getElementById("consentId");
    const logoutButton = document.getElementById("logoutBtn");

    // Show Loading Indicator
    const showLoading = () => {
        document.body.style.cursor = "wait";
        logoutButton.disabled = true;
        logoutButton.textContent = "Loading...";
    };

    const hideLoading = () => {
        document.body.style.cursor = "default";
        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";
    };

    // Show Alert Messages
    const showAlert = (message, type = "info") => {
        const alertBox = document.createElement("div");
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        alertBox.style.position = "fixed";
        alertBox.style.top = "10px";
        alertBox.style.right = "10px";
        alertBox.style.zIndex = "1000";
        document.body.appendChild(alertBox);

        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    };

    // Fetch User Data
    async function fetchUserData() {
        try {
            showLoading();
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/user", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please log in again.");
                }
                throw new Error("Failed to fetch user data.");
            }

            const userData = await response.json();
            usernameElement.textContent = userData.username || "User";
            emailElement.textContent = userData.email || "N/A";
            consentIdElement.textContent = userData.consentId || "N/A";
        } catch (error) {
            console.error("Error fetching user data:", error.message);
            showAlert(error.message, "error");
            logout();
        } finally {
            hideLoading();
        }
    }

    // Logout Functionality
    function logout() {
        localStorage.removeItem("token");
        window.location.href = "/index.html";
    }

    // Confirm Logout
    logoutButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            logout();
        }
    });

    // Initialize Dashboard
    fetchUserData();
});