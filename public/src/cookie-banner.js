// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Document Ready Event
document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    // Create Cookie Settings Button
    const cookieSettingsButton = document.createElement("button");
    cookieSettingsButton.id = "cookieSettingsButton";
    cookieSettingsButton.innerHTML = "⚙️"; // Gear icon
    Object.assign(cookieSettingsButton.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "transparent",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: "1000",
    });
    document.body.appendChild(cookieSettingsButton);

    // Create Dropdown Menu
    const settingsMenu = document.createElement("div");
    settingsMenu.id = "settingsMenu";
    Object.assign(settingsMenu.style, {
        position: "absolute",
        top: "40px",
        right: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        display: "none",
        zIndex: "1001",
    });

    // Create Menu Items
    settingsMenu.innerHTML = `
        <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px; cursor: pointer;" id="customizeCookiesOption">⚙️ Customize Preferences</li>
            <li style="padding: 8px; cursor: pointer;" id="policiesOption">📜 Read Policies & Guidelines</li>
            <li style="padding: 8px; cursor: pointer; color: red;" id="deleteDataOption">🗑️ Delete My Data</li>
        </ul>
    `;

    document.body.appendChild(settingsMenu);

    // Sub-menu for Policies
    const policiesMenu = document.createElement("div");
    policiesMenu.id = "policiesMenu";
    Object.assign(policiesMenu.style, {
        position: "absolute",
        top: "80px",
        right: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        display: "none",
        zIndex: "1001",
    });

    policiesMenu.innerHTML = `
        <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px; cursor: pointer;"><a href="/cookie-policy.html" target="_blank">🍪 Cookie Policy</a></li>
            <li style="padding: 8px; cursor: pointer;"><a href="/privacy-policy.html" target="_blank">🔒 Privacy Policy</a></li>
            <li style="padding: 8px; cursor: pointer;"><a href="/terms-of-service.html" target="_blank">📄 Terms of Service</a></li>
        </ul>
    `;

    document.body.appendChild(policiesMenu);

    // Toggle Settings Menu
    cookieSettingsButton.addEventListener("click", () => {
        settingsMenu.style.display = settingsMenu.style.display === "block" ? "none" : "block";
    });

    // Open Customize Preferences
    document.getElementById("customizeCookiesOption").addEventListener("click", () => {
        cookiePreferencesModal.classList.add("show");
        settingsMenu.style.display = "none";
    });

    // Toggle Policies Menu
    document.getElementById("policiesOption").addEventListener("click", () => {
        policiesMenu.style.display = policiesMenu.style.display === "block" ? "none" : "block";
    });

    // Close Menus When Clicking Outside
    document.addEventListener("click", (event) => {
        if (!cookieSettingsButton.contains(event.target) && !settingsMenu.contains(event.target)) {
            settingsMenu.style.display = "none";
        }
        if (!policiesMenu.contains(event.target) && !document.getElementById("policiesOption").contains(event.target)) {
            policiesMenu.style.display = "none";
        }
    });

    // Delete Data Functionality
    document.getElementById("deleteDataOption").addEventListener("click", async () => {
        const consentId = getCookie("consentId");

        if (!consentId) {
            alert("No data found to delete.");
            return;
        }

        try {
            const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/delete-my-data/${consentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to delete data: ${response.statusText}`);
            }

            ["consentId", "cookiesAccepted", "cookiePreferences"].forEach(deleteCookie);

            alert("Your data has been deleted.");
            settingsMenu.style.display = "none";
        } catch (error) {
            console.error("❌ Error deleting data:", error);
            alert("Failed to delete data. Please try again later.");
        }
    });

    // Utility Functions
    function getCookie(name) {
        const nameEq = `${name}=`;
        return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    }
});
