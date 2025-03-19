// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Cookie Utility Functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
}

function getCookie(name) {
    const nameEq = `${name}=`;
    const cookieValue = document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1];
    if (cookieValue) {
        console.log(`Retrieved cookie: ${name}=${decodeURIComponent(cookieValue)}`);
        return decodeURIComponent(cookieValue);
    }
    console.log(`Cookie not found: ${name}`);
    return null;
}

// Document Ready Event
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

    const registerTab = document.getElementById("register-tab");
    const loginTab = document.getElementById("login-tab");
    const registerForm = document.getElementById("registerForm");

    // Cookie Consent State
    let consentId = getCookie("consentId");
    let cookiesAccepted = getCookie("cookiesAccepted");

    // Show banner only when register tab is clicked and no preference is set
    if (registerTab) {
        registerTab.addEventListener("click", () => {
            const currentCookiesAccepted = getCookie("cookiesAccepted");
            if (!currentCookiesAccepted && !cookieBanner.classList.contains("show")) {
                setTimeout(() => cookieBanner.classList.add("show"), 500);
            }
        });
    }

    // Hide banner when login tab is clicked
    if (loginTab) {
        loginTab.addEventListener("click", () => {
            if (cookieBanner.classList.contains("show")) {
                hideBanner();
            }
        });
    }

    // Block form submission if no preference is set
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            const currentCookiesAccepted = getCookie("cookiesAccepted");
            if (!currentCookiesAccepted) {
                event.preventDefault();
                alert("Please choose a cookie preference before registering.");
                if (!cookieBanner.classList.contains("show")) {
                    setTimeout(() => cookieBanner.classList.add("show"), 500);
                }
            }
        });
    }

    // Accept Cookies Button
    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));

    // Reject Cookies Button
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    // Customize Cookies Button
    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        cookiePreferencesModal.classList.add("show");
        const strictlyNecessary = document.getElementById("strictlyNecessary");
        if (strictlyNecessary) {
            strictlyNecessary.checked = true;
            strictlyNecessary.disabled = true;
        } else {
            console.warn("Element with ID 'strictlyNecessary' not found in DOM");
        }
    });

    // Save Preferences Button
    savePreferencesButton.addEventListener("click", async () => {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        console.log("📌 Using Consent ID:", consentId);

        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance")?.checked || false,
            functional: document.getElementById("functional")?.checked || false,
            advertising: document.getElementById("advertising")?.checked || false,
            socialMedia: document.getElementById("socialMedia")?.checked || false,
        };

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        await sendPreferencesToDB(consentId, preferences);

        const consentStatus = preferences.performance || preferences.functional ? "accepted" : "rejected";
        await saveLocationData(consentId, consentStatus);

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

            if (!response.ok) {
                throw new Error(`Failed to save preferences: ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Preferences saved:", result);
        } catch (error) {
            console.error("❌ Error saving preferences:", error.message || error);
        }
    }

    // Save Location Data
    async function saveLocationData(consentId, consentStatus) {
        try {
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
            if (!response.ok) throw new Error(`Failed to fetch IP data: ${response.status}`);

            const data = await response.json();

            const locationData = {
                consentId: String(consentId),
                ipAddress: data.ip || "unknown",
                isp: data.org || "unknown", // e.g., "Reliance Jio Infocomm Limited"
                city: data.city || "unknown",
                country: data.country || "unknown",
                latitude: null,
                longitude: null,
                purpose: "consent-logging",
                consentStatus
            };

            if (navigator.geolocation && consentStatus === "accepted") {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    locationData.latitude = position.coords.latitude;
                    locationData.longitude = position.coords.longitude;
                } catch (geoError) {
                    console.warn("⚠️ Geolocation unavailable or rejected:", geoError.message);
                }
            }

            await sendLocationDataToDB(locationData);
        } catch (error) {
            console.error("❌ Error fetching location data:", error.message || error);
        }
    }

    // Send Location Data to Backend
    async function sendLocationDataToDB(locationData) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save location data: ${response.status} - ${errorText}`);
            }

            console.log("✅ Location data saved successfully.");
        } catch (error) {
            console.error("❌ Error saving location data:", error.message || error);
        }
    }

    // Handle Cookie Consent
    async function handleCookieConsent(accepted) {
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

        await sendPreferencesToDB(consentId, preferences);

        const consentStatus = accepted ? "accepted" : "rejected";
        await saveLocationData(consentId, consentStatus);

        hideBanner();
    }
});