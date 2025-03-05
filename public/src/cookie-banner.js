// Function to generate a short unique ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
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

// Document Ready Event
document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    // Check Authentication
    const isAuthenticated = await checkAuthentication();
    let userId = null;
    let sessionId = null;

    if (isAuthenticated) {
        userId = localStorage.getItem("userId"); // Retrieve userId from localStorage
        sessionId = localStorage.getItem("sessionId"); // Retrieve sessionId from localStorage
        console.log("📌 User is authenticated. Fetching preferences...");
        await loadPreferences(userId); // Fetch preferences for authenticated users
    } else {
        console.log("🚨 User is not authenticated. Using consentId...");
        let consentId = getCookie("consentId");
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365); // Create a new consentId for unauthenticated users
        }
        setTimeout(() => cookieBanner.classList.add("show"), 500); // Show cookie banner
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
    savePreferencesButton.addEventListener("click", async () => {
        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance").checked,
            functional: document.getElementById("functional").checked,
            advertising: document.getElementById("advertising").checked,
            socialMedia: document.getElementById("socialMedia").checked,
        };

        if (isAuthenticated) {
            await savePreferencesToDB(userId, preferences, sessionId); // Save preferences for authenticated users
        } else {
            const consentId = getCookie("consentId") || generateShortUUID();
            setCookie("consentId", consentId, 365); // Save consentId for unauthenticated users
            await savePreferencesToDB(null, preferences, null, consentId); // Save preferences with consentId
        }

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

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

    // Check Authentication
    async function checkAuthentication() {
        try {
            const token = localStorage.getItem("token");
            if (!token) return false;

            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/check-auth", { // Use relative URL
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error("❌ Error checking authentication:", error);
            return false;
        }
    }

    // Load Saved Preferences
    async function loadPreferences(userId) {
        try {
            const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/get-preferences?userId=${userId}`, { // Use relative URL
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (!response.ok) throw new Error("Failed to fetch preferences.");

            const data = await response.json();
            console.log("✅ Loaded Preferences:", data);

            applyPreferences(data.preferences);
            hideBanner();
        } catch (error) {
            console.error("❌ Error loading preferences:", error);
            setTimeout(() => cookieBanner.classList.add("show"), 500);
        }
    }

    // Apply Saved Preferences to UI
    function applyPreferences(preferences) {
        document.getElementById("performance").checked = preferences.performance || false;
        document.getElementById("functional").checked = preferences.functional || false;
        document.getElementById("advertising").checked = preferences.advertising || false;
        document.getElementById("socialMedia").checked = preferences.socialMedia || false;
    }

    // Save Preferences to Backend
    async function savePreferencesToDB(userId, preferences, sessionId = null, consentId = null) {
        try {
            const body = userId
                ? { userId, preferences, sessionId }
                : { consentId, preferences };

            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/save", { // Use relative URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            console.log("✅ Preferences saved:", await response.json());
        } catch (error) {
            console.error("❌ Error saving preferences:", error);
        }
    }

    // Save Location Data to Backend
    async function saveLocationData(consentId) {
        try {
            // Fetch location data using IPInfo API
            const ipResponse = await fetch(`https://ipinfo.io/json?token=10772b28291307`);
            const ipData = await ipResponse.json();

            const locationData = {
                consentId,
                ipAddress: ipData.ip,
                isp: ipData.org,
                city: ipData.city,
                country: ipData.country,
                latitude: null,
                longitude: null,
            };

            // Get geolocation coordinates if available
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        locationData.latitude = position.coords.latitude;
                        locationData.longitude = position.coords.longitude;
                        sendLocationDataToDB(locationData);
                    },
                    () => sendLocationDataToDB(locationData) // Fallback if geolocation fails
                );
            } else {
                sendLocationDataToDB(locationData); // Fallback if geolocation is not supported
            }
        } catch (error) {
            console.error("❌ Error fetching location data:", error);
        }
    }

    // Send Location Data to Backend
    async function sendLocationDataToDB(locationData) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/save-location", { // Use relative URL
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData),
            });

            console.log("✅ Location data saved successfully.");
        } catch (error) {
            console.error("❌ Error saving location data:", error);
        }
    }

    // Handle Cookie Consent
    function handleCookieConsent(accepted) {
        const preferences = {
            strictlyNecessary: true,
            performance: accepted,
            functional: accepted,
            advertising: accepted,
            socialMedia: accepted,
        };

        const consentId = getCookie("consentId") || generateShortUUID();
        setCookie("consentId", consentId, 365);

        setCookie("cookiesAccepted", accepted.toString(), 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        savePreferencesToDB(null, preferences, null, consentId);
        saveLocationData(consentId); // Save location data
        hideBanner();
    }
});