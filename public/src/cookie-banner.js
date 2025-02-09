// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Backend API URL (Update this with your Render backend URL)
const API_BASE_URL = "https://backendcookie-8qc1.onrender.com"; 

document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ").find(row => row.startsWith(name + "="));
        return cookies ? cookies.split("=")[1] : null;
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
            const response = await fetch(`${API_BASE_URL}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, preferences }),
            });
            const data = await response.json();
            console.log("✅ Preferences saved:", data);
        } catch (error) {
            console.error("❌ Error saving preferences:", error);
        }
    }

    async function saveLocationData(consentId) {
        try {
            // ✅ Get the real user IP address from a public API
            const ipResponse = await fetch("https://api64.ipify.org?format=json");
            const ipData = await ipResponse.json();
            const userIp = ipData.ip;

            // ✅ Fetch geolocation data using the user's real IP
            const geoResponse = await fetch(`https://ipapi.co/${userIp}/json/`);
            const geoData = await geoResponse.json();

            const locationData = {
                consentId,
                ipAddress: userIp, // ✅ Real user IP
                isp: geoData.org || "Unknown ISP",
                city: geoData.city || "Unknown City",
                country: geoData.country_name || "Unknown Country",
                latitude: geoData.latitude || null,
                longitude: geoData.longitude || null,
            };

            console.log("✅ User Location Data:", locationData);

            // ✅ Save location data to the backend
            sendLocationDataToDB(locationData);

        } catch (error) {
            console.error("❌ Error fetching real IP/location:", error.message);
        }
    }

    async function sendLocationDataToDB(locationData) {
        try {
            await fetch(`${API_BASE_URL}/api/location`, {
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
