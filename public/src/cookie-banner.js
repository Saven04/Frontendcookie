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

    // COOKIE SETTINGS BUTTON (Improved with Bootstrap)
    const cookieSettingsButton = document.createElement("button");
    cookieSettingsButton.id = "cookieSettingsButton";
    cookieSettingsButton.innerHTML = "⚙️ Cookie Settings"; // More descriptive text
    cookieSettingsButton.classList.add("btn", "btn-outline-light", "btn-sm", "rounded-pill"); // Bootstrap classes
    Object.assign(cookieSettingsButton.style, { // Overriding Bootstrap styles for custom look
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: "1000",
        fontSize: "14px",
    });
    document.body.appendChild(cookieSettingsButton);

    // Create dropdown menu (Improved with Bootstrap)
    const settingsDropdown = document.createElement("div");
    settingsDropdown.id = "settingsDropdown";
    settingsDropdown.classList.add("dropdown-menu", "dropdown-menu-end", "shadow"); // Bootstrap classes
    Object.assign(settingsDropdown.style, { // Overriding Bootstrap styles for custom look
        position: "fixed",
        top: "50px",
        right: "10px",
        zIndex: "1000",
        display: "none", // Hidden by default
    });

    const customizePreferenceOption = document.createElement("a");
    customizePreferenceOption.innerText = "Customize Preferences";
    customizePreferenceOption.classList.add("dropdown-item"); // Bootstrap class
    customizePreferenceOption.href = "#"; // Use a link to prevent page jumping
    customizePreferenceOption.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent the link from navigating
        cookiePreferencesModal.classList.add("show");
        settingsDropdown.style.display = "none";
    });

    const policiesOption = document.createElement("div");
    policiesOption.innerText = "Policies & Guidelines";
    policiesOption.classList.add("dropdown-item"); // Bootstrap class

    const policiesSubMenu = document.createElement("div");
    policiesSubMenu.classList.add("dropdown-menu", "shadow"); // Bootstrap classes
    Object.assign(policiesSubMenu.style, {
        paddingLeft: "0px", // Adjusted to align with dropdown menu
        display: "none",
    });

    const cookiePolicyOption = document.createElement("a");
    cookiePolicyOption.innerText = "Cookie Policy";
    cookiePolicyOption.classList.add("dropdown-item"); // Bootstrap class
    cookiePolicyOption.href = "/cookie-policy";
    cookiePolicyOption.target = "_blank";
    cookiePolicyOption.addEventListener("click", () => {
        settingsDropdown.style.display = "none";
    });

    const privacyPolicyOption = document.createElement("a");
    privacyPolicyOption.innerText = "Privacy Policy";
    privacyPolicyOption.classList.add("dropdown-item"); // Bootstrap class
    privacyPolicyOption.href = "/privacy-policy";
    privacyPolicyOption.target = "_blank";
    privacyPolicyOption.addEventListener("click", () => {
        settingsDropdown.style.display = "none";
    });

    const tosOption = document.createElement("a");
    tosOption.innerText = "Terms of Service";
    tosOption.classList.add("dropdown-item"); // Bootstrap class
    tosOption.href = "/terms-of-service";
    tosOption.target = "_blank";
    tosOption.addEventListener("click", () => {
        settingsDropdown.style.display = "none";
    });

    policiesSubMenu.appendChild(cookiePolicyOption);
    policiesSubMenu.appendChild(privacyPolicyOption);
    policiesSubMenu.appendChild(tosOption);

    policiesOption.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent any default action
        policiesSubMenu.style.display = policiesSubMenu.style.display === "none" ? "block" : "none";
    });

    const deleteDataOption = document.createElement("a");
    deleteDataOption.innerText = "Delete My Data";
    deleteDataOption.classList.add("dropdown-item", "text-danger"); // Bootstrap classes (red text)
    deleteDataOption.href = "#"; // Prevent page jumping
    deleteDataOption.addEventListener("click", async (event) => {
        event.preventDefault();
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
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/save", {
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
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
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
            await fetch("https://backendcookie-8qc1.onrender.com/api/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData),
            });
            console.log("✅ Location data saved successfully.");
        } catch (error) {
            console.error("❌ Error saving location data:", error);
        }
    }

    // Ensure modal exists before trying to modify it
    if (cookiePreferencesModal) {
        // Remove the deleteDataButton if it exists
        const deleteDataButton = document.getElementById("deleteDataButton");
        if (deleteDataButton) {
            deleteDataButton.remove();
        }
    }
});
