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

    // Handle Cookie Consent Logic
    let consentId = getCookie("consentId");
    let cookiesAccepted = getCookie("cookiesAccepted");

    // Show the cookie banner when the user attempts to register
    const registerTab = document.getElementById("register-tab");
    const registerForm = document.getElementById("registerForm");

    registerTab.addEventListener("click", () => {
        if (!cookiesAccepted) {
            setTimeout(() => cookieBanner.classList.add("show"), 500); // Show the banner
        }
    });

    // Block registration if no cookie choice has been made
    registerForm.addEventListener("submit", (event) => {
        if (!cookiesAccepted) {
            event.preventDefault(); // Prevent form submission
            alert("Please choose a cookie preference before registering."); // Notify the user
            setTimeout(() => cookieBanner.classList.add("show"), 500); // Show the banner
        }
    });

    // Accept Cookies Button
    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));

    // Reject Cookies Button
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    // Customize Cookies Button
    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        cookiePreferencesModal.classList.add("show");
        document.getElementById("strictlyNecessary").checked = true;
        document.getElementById("strictlyNecessary").disabled = true;
    });

    // Save Preferences Button
    savePreferencesButton.addEventListener("click", () => {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        console.log("📌 Using Consent ID:", consentId);

        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance").checked,
            functional: document.getElementById("functional").checked,
            advertising: document.getElementById("advertising").checked,
            socialMedia: document.getElementById("socialMedia").checked,
        };

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        sendPreferencesToDB(consentId, preferences);

        // Only collect location data if performance or functional cookies are accepted
        if (preferences.performance || preferences.functional) {
            saveLocationData(consentId);
        } else {
            console.log("🚫 Location data collection skipped: User did not consent to performance or functional cookies.");
        }

        hideBanner();
        cookiePreferencesModal.classList.remove("show");
    });

    // Cancel Preferences Button
    cancelPreferencesButton.addEventListener("click", () => {
        cookiePreferencesModal.classList.remove("show");
    });

    // Hide Banner Function
    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    // Send Preferences to Backend
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

    // Save Location Data
    async function saveLocationData(consentId, consentStatus) {
        try {
            // Fetch IP-based location data from ipinfo.io
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
    
            // Prepare minimal location data for GDPR compliance
            const locationData = {
                consentId,
                ipAddress: data.ip,           // IP address for jurisdiction check
                country: data.country,       // Country code (e.g., "DE" for Germany)
                region: data.region || null, // Optional region (e.g., "Bavaria")
                purpose: "consent-logging",  // Fixed purpose for this function; adjust as needed
                consentStatus                // "accepted", "rejected", or "not-applicable" from caller
            };
    
            // Send data to backend immediately (no geolocation)
            await sendLocationDataToDB(locationData);
        } catch (error) {
            console.error("❌ Error fetching or saving location data:", error);
        }
    }
    async function sendLocationDataToDB(locationData) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(locationData),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to save location data: ${response.status}`);
            }
    
            const result = await response.json();
            console.log("✅ Location data saved:", result.message);
        } catch (error) {
            console.error("❌ Error sending location data to DB:", error);
        }
    }

    // Handle Cookie Consent
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

        // Only collect location data if accepted (implies consent to performance/functional)
        if (accepted) {
            saveLocationData(consentId);
        } else {
            console.log("🚫 Location data collection skipped: User rejected cookies.");
        }

        hideBanner();
    }
});