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
    const strictlyNecessaryCheckbox = document.getElementById("strictlyNecessary");
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

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
        display: "none", // Initially hidden
    });
    document.body.appendChild(cookieSettingsButton);

    // Dropdown Menu for Cookie Settings
    const settingsDropdown = document.createElement("div");
    settingsDropdown.id = "settingsDropdown";
    Object.assign(settingsDropdown.style, {
        position: "fixed",
        top: "50px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        display: "none",
        zIndex: "1000",
    });

    // Add options to the dropdown menu
    const customizePreferenceOption = document.createElement("div");
    customizePreferenceOption.innerText = "Customize Preferences";
    customizePreferenceOption.style.padding = "10px";
    customizePreferenceOption.style.cursor = "pointer";
    customizePreferenceOption.addEventListener("click", () => {
        cookiePreferencesModal.classList.add("show");
        settingsDropdown.style.display = "none";
    });

    const policiesOption = document.createElement("div");
    policiesOption.innerText = "Read the Policies and Guidelines";
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
        window.open("/cookie-policy.html", "_blank");
        settingsDropdown.style.display = "none";
    });

    const privacyPolicyOption = document.createElement("div");
    privacyPolicyOption.innerText = "Privacy Policy";
    privacyPolicyOption.style.padding = "5px";
    privacyPolicyOption.style.cursor = "pointer";
    privacyPolicyOption.addEventListener("click", () => {
        window.open("/privacy-policy.html", "_blank");
        settingsDropdown.style.display = "none";
    });

    const tosOption = document.createElement("div");
    tosOption.innerText = "Terms of Service";
    tosOption.style.padding = "5px";
    tosOption.style.cursor = "pointer";
    tosOption.addEventListener("click", () => {
        window.open("/terms-of-service.html", "_blank");
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
        const consentId = getCookie("consentId");
        if (!consentId) {
            alert("No data found to delete.");
            return;
        }

        try {
            const response = await fetch(`/api/delete-my-data/${consentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to delete data: ${response.statusText}`);
            }

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

    // Toggle dropdown visibility
    cookieSettingsButton.addEventListener("click", () => {
        settingsDropdown.style.display = settingsDropdown.style.display === "none" ? "block" : "none";
    });

    // Cookie Utility Functions
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

    // Check Authentication Status
    let isAuthenticated = false;
    try {
        const authResponse = await fetch("/check-auth");
        const authData = await authResponse.json();
        isAuthenticated = authData.authenticated;
    } catch (error) {
        console.error("❌ Error checking authentication:", error);
    }

    if (!isAuthenticated) {
        // Hide the cookie banner and prompt the user to log in
        cookieBanner.style.display = "none";
        alert("Please log in to manage cookie settings.");
        window.location.href = "/login.html";
        return;
    }

    // Show the Cookie Settings button only for authenticated users
    cookieSettingsButton.style.display = "block";

    // Handle Cookie Consent Logic
    let consentId = getCookie("consentId");

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
        saveLocationData(consentId);
        hideBanner();
    }

    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        cookiePreferencesModal.classList.add("show");
        strictlyNecessaryCheckbox.checked = true;
        strictlyNecessaryCheckbox.disabled = true;
    });

    savePreferencesButton.addEventListener("click", () => {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        console.log("📌 Using Consent ID:", consentId);

        const preferences = {
            strictlyNecessary: true,
            performance: performanceCheckbox.checked,
            functional: functionalCheckbox.checked,
            advertising: advertisingCheckbox.checked,
            socialMedia: socialMediaCheckbox.checked,
        };

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        sendPreferencesToDB(consentId, preferences);
        saveLocationData(consentId);
        hideBanner();
        cookiePreferencesModal.classList.remove("show");
    });

    cancelPreferencesButton.addEventListener("click", () => {
        cookiePreferencesModal.classList.remove("show");
    });

    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    async function sendPreferencesToDB(consentId, preferences) {
        try {
            const response = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, preferences }),
            });
            console.log("✅ Preferences saved:", await response.json());
        } catch (error) {
            console.error("❌ Error saving preferences:", error);
        }
    }

    async function saveLocationData(consentId) {
        try {
            const response = await fetch("https://ipinfo.io/json?token=YOUR_IPINFO_TOKEN");
            const data = await response.json();
            const locationData = {
                consentId,
                ipAddress: data.ip,
                isp: data.org,
                city: data.city,
                country: data.country,
                latitude: null,
                longitude: null,
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        locationData.latitude = position.coords.latitude;
                        locationData.longitude = position.coords.longitude;
                        sendLocationDataToDB(locationData);
                    },
                    () => sendLocationDataToDB(locationData)
                );
            } else {
                sendLocationDataToDB(locationData);
            }
        } catch (error) {
            console.error("❌ Error fetching location data:", error);
        }
    }

    async function sendLocationDataToDB(locationData) {
        try {
            await fetch("/api/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData),
            });
            console.log("✅ Location data saved successfully.");
        } catch (error) {
            console.error("❌ Error saving location data:", error);
        }
    }
});