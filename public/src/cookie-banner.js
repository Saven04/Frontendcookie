document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.querySelector("#cookieConsent");
    const acceptCookiesButton = document.querySelector("#acceptCookies");
    const rejectCookiesButton = document.querySelector("#rejectCookies");
    const customizeCookiesButton = document.querySelector("#customizeCookies");
    const savePreferencesButton = document.querySelector("#savePreferences");
    const cancelPreferencesButton = document.querySelector("#cancelPreferences");
    const cookiePreferencesModal = document.querySelector("#cookiePreferencesModal");
    const cookiePolicyButton = document.querySelector("#cookiePolicy");
    const cookiePolicyModal = document.querySelector("#cookiePolicyModal");

    // Check if all elements exist
    const requiredElements = {
        cookieBanner,
        acceptCookiesButton,
        rejectCookiesButton,
        customizeCookiesButton,
        savePreferencesButton,
        cancelPreferencesButton,
        cookiePreferencesModal,
        cookiePolicyButton,
        cookiePolicyModal
    };

    Object.entries(requiredElements).forEach(([name, element]) => {
        if (!element) console.warn(`⚠️ Missing: #${name}`);
    });

    if (Object.values(requiredElements).some(el => !el)) {
        console.error("❌ One or more required elements are missing from the DOM.");
        return;
    }

    // Utility Functions
    const setCookie = (name, value, days) => {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    };

    const getCookie = (name) => {
        const nameEq = `${name}=`;
        return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
    };

    const deleteCookie = (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    };

    let consentId = getCookie("consentId");
    let cookiesAccepted = getCookie("cookiesAccepted");

    // Show banner only if user hasn't made a choice
    if (!cookiesAccepted) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    // Bootstrap modal instances
    let customizeModalInstance, policyModalInstance;
    try {
        customizeModalInstance = new bootstrap.Modal(cookiePreferencesModal);
        policyModalInstance = new bootstrap.Modal(cookiePolicyModal);
    } catch (error) {
        console.error("❌ Error initializing modals:", error);
    }

    // Handle Consent Buttons
    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        customizeModalInstance?.show();

        const strictlyNecessary = document.querySelector("#strictlyNecessary");
        if (strictlyNecessary) {
            strictlyNecessary.checked = true;
            strictlyNecessary.disabled = true;
        }
    });

    savePreferencesButton.addEventListener("click", () => saveCookiePreferences());
    cancelPreferencesButton.addEventListener("click", () => customizeModalInstance?.hide());

    // Show Cookie Policy Modal
    cookiePolicyButton.addEventListener("click", () => {
        policyModalInstance?.show();
    });

    // Hide Banner
    const hideBanner = () => {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    };

    // Handle Cookie Consent
    function handleCookieConsent(accepted) {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

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
    function saveCookiePreferences() {
        if (!consentId) {
            consentId = generateShortUUID();
            setCookie("consentId", consentId, 365);
        }

        const preferences = {
            strictlyNecessary: true,
            performance: document.querySelector("#performance")?.checked || false,
            functional: document.querySelector("#functional")?.checked || false,
            advertising: document.querySelector("#advertising")?.checked || false,
            socialMedia: document.querySelector("#socialMedia")?.checked || false,
        };

        setCookie("cookiesAccepted", "true", 365);
        setCookie("cookiePreferences", JSON.stringify(preferences), 365);

        sendPreferencesToDB(consentId, preferences);
        saveLocationData(consentId);
        hideBanner();
        customizeModalInstance?.hide();
    }

    // API Call: Save Preferences to Backend
    async function sendPreferencesToDB(consentId, preferences) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consentId, preferences }),
            });

            if (!response.ok) throw new Error("Failed to save preferences");

            console.log("✅ Preferences saved:", await response.json());
        } catch (error) {
            console.error("❌ Error saving preferences:", error);
        }
    }

    // Save Location Data
    async function saveLocationData(consentId) {
        try {
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
            if (!response.ok) throw new Error("Failed to fetch IP location");

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
                    () => sendLocationDataToDB(locationData),
                    { timeout: 5000 }
                );
            } else {
                sendLocationDataToDB(locationData);
            }
        } catch (error) {
            console.error("❌ Error fetching location data:", error);
        }
    }

    // API Call: Send Location Data to Backend
    async function sendLocationDataToDB(locationData) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(locationData),
            });

            if (!response.ok) throw new Error("Failed to save location data");

            console.log("✅ Location data saved successfully.");
        } catch (error) {
            console.error("❌ Error saving location data:", error);
        }
    }
});
