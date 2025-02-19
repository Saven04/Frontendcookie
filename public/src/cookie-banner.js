// Utility for managing cookies
const CookieManager = {
    set(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    },
    get(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : null;
    },
    delete(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    }
};

// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Function to send data to the backend
async function sendToBackend(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`❌ Error sending data to ${url}:`, error);
    }
}

// Function to save location data
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
            longitude: null
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationData.latitude = position.coords.latitude;
                    locationData.longitude = position.coords.longitude;
                    sendToBackend("https://backendcookie-8qc1.onrender.com/api/location", locationData);
                },
                () => sendToBackend("https://backendcookie-8qc1.onrender.com/api/location", locationData) // Fallback
            );
        } else {
            sendToBackend("https://backendcookie-8qc1.onrender.com/api/location", locationData);
        }
    } catch (error) {
        console.error("❌ Error fetching location data:", error);
    }
}

// Function to handle cookie consent actions
function handleCookieConsent(accepted, consentId) {
    if (!consentId) return;
    console.log("📌 Using Consent ID:", consentId);

    const preferences = {
        strictlyNecessary: true,
        performance: accepted,
        functional: accepted,
        advertising: accepted,
        socialMedia: accepted
    };

    CookieManager.set("cookiesAccepted", accepted.toString(), 365);
    CookieManager.set("cookiePreferences", JSON.stringify(preferences), 365);
    sendToBackend("https://backendcookie-8qc1.onrender.com/api/save", { consentId, preferences });
    saveLocationData(consentId);
    document.getElementById("cookieConsent").classList.add("hide");
}

// Document Ready Event
document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const consentId = localStorage.getItem("consentId") || CookieManager.get("consentId");

    if (!consentId) {
        cookieBanner.style.display = "none";
    } else if (!CookieManager.get("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true, consentId));
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false, consentId));

    // Add gear icon for settings
    const cookieSettingsButton = document.createElement("button");
    cookieSettingsButton.id = "cookieSettingsButton";
    cookieSettingsButton.innerHTML = "⚙️";
    Object.assign(cookieSettingsButton.style, {
        position: "fixed", top: "10px", right: "10px",
        backgroundColor: "transparent", border: "none", fontSize: "24px",
        cursor: "pointer", zIndex: "1000"
    });
    document.body.appendChild(cookieSettingsButton);

    // Toggle settings dropdown
    const settingsDropdown = document.createElement("div");
    settingsDropdown.id = "settingsDropdown";
    settingsDropdown.style.display = "none";
    cookieSettingsButton.addEventListener("click", () => {
        settingsDropdown.style.display = settingsDropdown.style.display === "none" ? "block" : "none";
    });
    document.body.appendChild(settingsDropdown);
});
