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
    const cookieSettingsButton = document.getElementById("cookieSettingsButton");

    let consentId = getCookie("consentId");

    // Show banner only if consent is not given
    if (!getCookie("cookiesAccepted")) {
        cookieBanner.classList.add("show");
    }

    // Hide Cookie Settings Button if Not Logged In
    if (cookieSettingsButton) {
        cookieSettingsButton.style.display = consentId ? "block" : "none";
    }

    // Unblock buttons after registration
    if (sessionStorage.getItem("registered")) {
        acceptCookiesButton?.removeEventListener("click", requireLogin);
        rejectCookiesButton?.removeEventListener("click", requireLogin);
        customizeCookiesButton?.removeEventListener("click", requireLogin);

        acceptCookiesButton?.addEventListener("click", () => handleCookieConsent(true));
        rejectCookiesButton?.addEventListener("click", () => handleCookieConsent(false));
        customizeCookiesButton?.addEventListener("click", () => {
            cookiePreferencesModal?.classList.add("show");
        });

        sessionStorage.removeItem("registered"); // Clear after use
    } else {
        // Block Accept, Reject, and Customize Until Logged In
        if (!consentId) {
            acceptCookiesButton?.addEventListener("click", requireLogin);
            rejectCookiesButton?.addEventListener("click", requireLogin);
            customizeCookiesButton?.addEventListener("click", requireLogin);
        } else {
            acceptCookiesButton?.addEventListener("click", () => handleCookieConsent(true));
            rejectCookiesButton?.addEventListener("click", () => handleCookieConsent(false));
            customizeCookiesButton?.addEventListener("click", () => {
                cookiePreferencesModal?.classList.add("show");
            });
        }
    }

    // Function to Handle Cookie Consent
    function handleCookieConsent(accepted) {
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

    // Save Preferences
    savePreferencesButton?.addEventListener("click", () => {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance")?.checked || false,
            functional: document.getElementById("functional")?.checked || false,
            advertising: document.getElementById("advertising")?.checked || false,
            socialMedia: document.getElementById("socialMedia")?.checked || false,
        };

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        sendPreferencesToDB(consentId, preferences);
        saveLocationData(consentId);
        hideBanner();
        cookiePreferencesModal?.classList.remove("show");
    });

    cancelPreferencesButton?.addEventListener("click", () => {
        cookiePreferencesModal?.classList.remove("show");
    });

    function hideBanner() {
        if (cookieBanner) {
            cookieBanner.classList.add("hide");
            setTimeout(() => {
                cookieBanner.classList.remove("show", "hide");
            }, 500);
        }
    }

    // Redirect after registration
    if (window.location.pathname.includes("register.html")) {
        document.getElementById("registerForm")?.addEventListener("submit", (event) => {
            event.preventDefault();
            sessionStorage.setItem("registered", "true"); // Store session flag
            window.location.href = "index.html"; // Redirect after registration
        });
    }

    // Cookie Helper Functions
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

    // Function to Send Preferences to Backend
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

    // Function to Save Location Data
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
});
