// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Get consent ID early to avoid reference errors
let consentId = getCookie("consentId");

// Document Ready Event
document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");
    const strictlyNecessaryCheckbox = document.getElementById("strictlyNecessary");
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

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

    // Create dropdown menu
    const settingsDropdown = document.createElement("div");
    settingsDropdown.id = "settingsDropdown";
    Object.assign(settingsDropdown.style, {
        position: "fixed",
        top: "50px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Transparent black background
        color: "#fff", // White text color for visibility
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        display: "none",
        zIndex: "1000",
    });

    const customizePreferenceOption = document.createElement("div");
    customizePreferenceOption.innerText = "Customize Preference";
    customizePreferenceOption.style.padding = "10px";
    customizePreferenceOption.style.cursor = "pointer";
    customizePreferenceOption.addEventListener("click", () => {
        if (cookiePreferencesModal) {
            cookiePreferencesModal.classList.add("show");
            settingsDropdown.style.display = "none";
        }
    });

    const policiesOption = document.createElement("div");
    policiesOption.innerText = "Read the policies and Guidelines";
    policiesOption.style.padding = "10px";
    policiesOption.style.cursor = "pointer";

    const policiesSubMenu = document.createElement("div");
    policiesSubMenu.style.paddingLeft = "20px";
    policiesSubMenu.style.display = "none";

    const cookiePolicyOption = document.createElement("div");
    cookiePolicyOption.innerText = "Cookie Policy";
    cookiePolicyOption.style.padding = "5px";
    cookiePolicyOption.style.cursor = "pointer";
    cookiePolicyOption.addEventListener("click", () => {
        window.open("/cookie-policy", "_blank");
        settingsDropdown.style.display = "none";
    });

    const privacyPolicyOption = document.createElement("div");
    privacyPolicyOption.innerText = "Privacy Policy";
    privacyPolicyOption.style.padding = "5px";
    privacyPolicyOption.style.cursor = "pointer";
    privacyPolicyOption.addEventListener("click", () => {
        window.open("/privacy-policy", "_blank");
        settingsDropdown.style.display = "none";
    });

    const tosOption = document.createElement("div");
    tosOption.innerText = "Terms of Service";
    tosOption.style.padding = "5px";
    tosOption.style.cursor = "pointer";
    tosOption.addEventListener("click", () => {
        window.open("/terms-of-service", "_blank");
        settingsDropdown.style.display = "none";
    });

    policiesSubMenu.appendChild(cookiePolicyOption);
    policiesSubMenu.appendChild(privacyPolicyOption);
    policiesSubMenu.appendChild(tosOption);

    policiesOption.addEventListener("click", () => {
        policiesSubMenu.style.display = policiesSubMenu.style.display === "none" ? "block" : "none";
    });

    const deleteDataOption = document.createElement("div");
    deleteDataOption.innerText = "Delete My Data";
    deleteDataOption.style.padding = "10px";
    deleteDataOption.style.cursor = "pointer";
    deleteDataOption.addEventListener("click", async () => {
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

            // Delete all related cookies
            ["consentId", "cookiesAccepted", "cookiePreferences"].forEach(deleteCookie);

            alert("Your data has been deleted.");
            settingsDropdown.style.display = "none";
        } catch (error) {
            console.error("❌ Error deleting data:", error);
            alert("Failed to delete data. Please try again later.");
        }
    });

    settingsDropdown.appendChild(customizePreferenceOption);
    settingsDropdown.appendChild(policiesOption);
    settingsDropdown.appendChild(policiesSubMenu);
    settingsDropdown.appendChild(deleteDataOption);
    document.body.appendChild(settingsDropdown);

    cookieSettingsButton.addEventListener("click", () => {
        settingsDropdown.style.display = settingsDropdown.style.display === "none" ? "block" : "none";
    });

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    function handleCookieConsent(accepted) {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        console.log("📌 Using Consent ID:", consentId);

        const preferences = {
            strictlyNecessary: true,
            performance: accepted,
            functional: accepted,
            advertising: accepted,
            socialMedia: accepted,
        };

        setCookie("cookiesAccepted", accepted.toString(), 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        sendPreferencesToDB(consentId, preferences);
        hideBanner();
    }

    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

});
