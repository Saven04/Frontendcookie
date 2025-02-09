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
    let userIp = "";
    let locationData = {};

    async function fetchUserIP() {
        try {
            const response = await fetch("https://api64.ipify.org?format=json");
            const data = await response.json();
            userIp = data.ip;
            console.log("✅ User IP Address:", userIp);
            await fetchUserLocation(userIp);
        } catch (error) {
            console.error("❌ Error fetching user IP:", error);
        }
    }

    async function fetchUserLocation(ip) {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            locationData = await response.json();
            console.log("✅ User Location Data:", locationData);
        } catch (error) {
            console.error("❌ Error fetching user location:", error);
        }
    }

    await fetchUserIP();

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

        sendPreferencesToDB(consentId, preferences, userIp, locationData);
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

        sendPreferencesToDB(consentId, preferences, userIp, locationData);
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

    async function sendPreferencesToDB(consentId, preferences, ipAddress, location) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, preferences, ipAddress, location }),
            });
            const data = await response.json();
            console.log("✅ Preferences and location saved:", data);
        } catch (error) {
            console.error("❌ Error saving preferences and location:", error);
        }
    }

    function createCookieSettingsButton() {
        if (document.getElementById("cookieSettingsButton")) return;

        const cookieSettingsButton = document.createElement("button");
        cookieSettingsButton.id = "cookieSettingsButton";
        cookieSettingsButton.innerHTML = "⚙️";
        cookieSettingsButton.style.position = "fixed";
        cookieSettingsButton.style.top = "10px";
        cookieSettingsButton.style.right = "10px";
        cookieSettingsButton.style.backgroundColor = "transparent";
        cookieSettingsButton.style.border = "none";
        cookieSettingsButton.style.fontSize = "24px";
        cookieSettingsButton.style.cursor = "pointer";
        cookieSettingsButton.style.zIndex = "1000";

        cookieSettingsButton.addEventListener("click", () => {
            cookiePreferencesModal.classList.add("show");
        });

        document.body.appendChild(cookieSettingsButton);
    }

    createCookieSettingsButton();
});
