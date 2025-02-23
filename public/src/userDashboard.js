document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
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
    const lastLoginElement = document.getElementById("lastLogin");
    const saveButton = document.getElementById("saveCookieSettings");
    const resetButton = document.getElementById("resetCookieSettings");
    const feedbackModal = new bootstrap.Modal(document.getElementById("feedbackModal"));
    const feedbackMessage = document.getElementById("feedbackMessage");

    // Show Loading Indicator
    const showLoading = () => {
        document.body.style.cursor = "wait";
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    };

    const hideLoading = () => {
        document.body.style.cursor = "default";
        saveButton.disabled = false;
        saveButton.textContent = "Save Preferences";
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
            lastLoginElement.textContent = userData.lastLogin || "N/A";

            // Load cookie preferences
            const preferences = JSON.parse(getCookie("cookiePreferences")) || {};
            document.getElementById("performanceCookies").checked = preferences.performance || false;
            document.getElementById("functionalCookies").checked = preferences.functional || false;
            document.getElementById("advertisingCookies").checked = preferences.advertising || false;
            document.getElementById("socialMediaCookies").checked = preferences.socialMedia || false;
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
    document.getElementById("logoutBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            logout();
        }
    });

    // Utility Functions
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    }

    function getCookie(name) {
        const nameEq = `${name}=`;
        return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    }

    // Save Preferences
    saveButton.addEventListener("click", () => {
        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performanceCookies").checked,
            functional: document.getElementById("functionalCookies").checked,
            advertising: document.getElementById("advertisingCookies").checked,
            socialMedia: document.getElementById("socialMediaCookies").checked,
        };
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);
        feedbackMessage.textContent = "Your preferences have been saved successfully!";
        feedbackModal.show();
    });

    // Reset Preferences
    resetButton.addEventListener("click", () => {
        document.getElementById("performanceCookies").checked = false;
        document.getElementById("functionalCookies").checked = false;
        document.getElementById("advertisingCookies").checked = false;
        document.getElementById("socialMediaCookies").checked = false;
        setCookie("cookiePreferences", JSON.stringify({ strictlyNecessary: true }), 365);
        feedbackMessage.textContent = "Your preferences have been reset to default.";
        feedbackModal.show();
    });

    // Initialize Dashboard
    fetchUserData();
});