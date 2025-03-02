// Function to fetch a new consent ID from the backend
async function fetchConsentId(userId) {
    let consentId = localStorage.getItem("consentId") || getCookie("consentId");

    if (!consentId) {
        if (!userId) {
            console.error("❌ Error: User ID is required to generate a consent ID.");
            return null;
        }

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/generate-consent-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }), // ✅ Sending user ID
            });

            const data = await response.json();
            consentId = data.consentId;

            if (consentId) {
                localStorage.setItem("consentId", consentId);
                setCookie("consentId", consentId, 365);
                console.log(`✅ Generated new Consent ID: ${consentId}`);
            } else {
                console.error("❌ Error: No consent ID received from backend.");
            }
        } catch (error) {
            console.error("❌ Error fetching consent ID:", error);
        }
    } else {
        console.log(`🔹 Using existing Consent ID: ${consentId}`);
    }

    return consentId;
}

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
document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    const userId = localStorage.getItem("userId"); // ✅ Fetch userId (Modify if needed)
    let consentId = await fetchConsentId(userId);
    let cookiesAccepted = getCookie("cookiesAccepted");

    if (!cookiesAccepted) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

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
        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance").checked,
            functional: document.getElementById("functional").checked,
            advertising: document.getElementById("advertising").checked,
            socialMedia: document.getElementById("socialMedia").checked,
        };

        handleCookieConsent(true, preferences);
        cookiePreferencesModal.classList.remove("show");
    });

    // Cancel Preferences Button
    cancelPreferencesButton.addEventListener("click", () => {
        cookiePreferencesModal.classList.remove("show");
    });

    // Handle Cookie Consent
    function handleCookieConsent(accepted, preferences = null) {
        preferences = preferences || {
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

    // Hide Banner Function
    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    // Send Preferences to Backend
    async function sendPreferencesToDB(consentId, preferences) {
        if (!consentId) {
            console.error("❌ Error: Cannot save preferences without a valid Consent ID.");
            return;
        }

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

    // Save Location Data without Latitude and Longitude
    async function saveLocationData(consentId) {
        if (!consentId) {
            console.error("❌ Error: Cannot save location data without a valid Consent ID.");
            return;
        }

        try {
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
            const data = await response.json();
            const locationData = {
                consentId,
                ipAddress: data.ip,
                isp: data.org,
                city: data.city,
                country: data.country,
            };

            sendLocationDataToDB(locationData);
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
});
