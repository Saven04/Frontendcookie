document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM fully loaded and parsed!");

    // Ensure Bootstrap is loaded
    if (typeof bootstrap === "undefined") {
        console.error("❌ Bootstrap is not loaded! Modal functionality may not work.");
        return;
    }

    // Select modal element
    const authModalEl = document.getElementById("authModal");
    if (authModalEl) {
        console.log("✅ Auth Modal found.");
        
        // Initialize Bootstrap modal
        const authModal = new bootstrap.Modal(authModalEl, { keyboard: false });

        // Show Login Popup Only for New Users
        if (!isUserLoggedIn() && !sessionStorage.getItem("authModalShown")) {
            setTimeout(() => {
                console.log("🟢 Showing auth modal...");
                authModal.show();
                sessionStorage.setItem("authModalShown", "true");
            }, 5000);
        }

        // Attach event listeners safely
        document.getElementById("authModalTrigger")?.addEventListener("click", () => {
            console.log("🟢 Login trigger clicked. Showing modal.");
            authModal.show();
        });

        document.getElementById("closeAuthModal")?.addEventListener("click", () => {
            console.log("🔴 Closing auth modal.");
            authModal.hide();
        });
    } else {
        console.warn("⚠️ Auth Modal (#authModal) not found in the DOM.");
    }

    // Attach event listeners safely for login and signup
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
    document.getElementById("signupForm")?.addEventListener("submit", handleSignup);

    // Initialize Cookie Banner Logic
    handleCookieBanner();
});

/**
 * Helper function to check if user is logged in.
 */
function isUserLoggedIn() {
    const token = localStorage.getItem("token");
    return token && token !== "undefined";
}
