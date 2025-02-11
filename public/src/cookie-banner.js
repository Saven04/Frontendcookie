// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Backend API URL
const API_BASE_URL = "https://backendcookie-8qc1.onrender.com";
const IPDATA_API_KEY = "d2e46351214782d552f706203cb424955384bc556f56ff01dd166651"; 

document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    const checkboxes = {
        performance: document.getElementById("performance"),
        functional: document.getElementById("functional"),
        advertising: document.getElementById("advertising"),
        socialMedia: document.getElementById("socialMedia"),
    };

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=lax`;
    }

    function getCookie(name) {
        const cookies = document.cookie.split("; ").find(row => row.startsWith(name + "="));
        return cookies ? cookies.split("=")[1] : null;
    }

    let consentId = getCookie("consentId") || generateShortUUID();
    setCookie("consentId", consentId, 365);
    console.log("📌 Using Consent ID:", consentId);

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    function handleCookieConsent(accepted) {
        const preferences = {
            strictlyNecessary: true,
            performance: accepted,
            functional: accepted,
            advertising: accepted,
            socialMedia: accepted,
        };

        savePreferences(preferences, "true");
    }

    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        cookiePreferencesModal.classList.add("show");
        cookieBanner.classList.remove("show");
    });

    savePreferencesButton.addEventListener("click", () => {
        const preferences = {
            strictlyNecessary: true,
            performance: checkboxes.performance.checked,
            functional: checkboxes.functional.checked,
            advertising: checkboxes.advertising.checked,
            socialMedia: checkboxes.socialMedia.checked,
        };

        savePreferences(preferences, "true");
        cookiePreferencesModal.classList.remove("show");
    });

    cancelPreferencesButton.addEventListener("click", () => {
        cookiePreferencesModal.classList.remove("show");
    });

    async function savePreferences(preferences, accepted) {
        setCookie("cookiesAccepted", accepted, 365);
        setCookie("cookiePreferences", btoa(JSON.stringify(preferences)), 365);

        // Get the user's IP address before sending preferences
        const userIpData = await getClientIPData();
        if (!userIpData) {
            console.error("❌ Failed to fetch user IP. Preferences not saved.");
            return;
        }

        // Send preferences and location data to the backend
        sendPreferencesToDB(consentId, preferences, userIpData.ip);
        saveLocationData(consentId, userIpData);
        hideBanner();
    }

    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    async function getClientIPData() {
        try {
            const response = await fetch(`https://api.ipdata.co?api-key=${IPDATA_API_KEY}`);
            const ipData = await response.json();

            if (!ipData || !ipData.ip) {
                throw new Error("Invalid IP response");
            }

            console.log("✅ Detected IP Address:", ipData.ip);
            return ipData;
        } catch (error) {
            console.error("❌ Error fetching IP address:", error.message);
            return null;
        }
    }

    async function sendPreferencesToDB(consentId, preferences, userIp) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, preferences, ipAddress: userIp }),
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            console.log("✅ Preferences saved:", data);
        } catch (error) {
            console.error("❌ Error saving preferences:", error.message);
        }
    }

    async function saveLocationData(consentId, ipData) {
        try {
            const locationData = {
                consentId,
                ipAddress: ipData.ip,
                isp: ipData.asn.name || "Unknown ISP",
                city: ipData.city || "Unknown City",
                country: ipData.country_name || "Unknown Country",
                latitude: ipData.latitude || null,
                longitude: ipData.longitude || null,
                postalCode: ipData.postal || "Unknown",
                timezone: ipData.time_zone.name || "Unknown Timezone",
            };

            console.log("✅ User Location Data:", locationData);
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

    function createCookieSettingsButton() {
        if (document.getElementById("cookieSettingsButton")) return;

        const button = document.createElement("button");
        button.id = "cookieSettingsButton";
        button.innerHTML = "⚙️";
        Object.assign(button.style, {
            position: "fixed",
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: "1000",
        });
        button.addEventListener("click", () => {
            cookiePreferencesModal.classList.add("show");
        });

        document.body.appendChild(button);
    }

    createCookieSettingsButton();
});
