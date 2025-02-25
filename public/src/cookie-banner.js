document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.querySelector("#cookieConsent");
    const acceptCookiesButton = document.querySelector("#acceptCookies");
    const rejectCookiesButton = document.querySelector("#rejectCookies");
    const customizeCookiesButton = document.querySelector("#customizeCookies");
    const savePreferencesButton = document.querySelector("#savePreferences");
    const cancelPreferencesButton = document.querySelector("#cancelPreferences");
    const cookiePreferencesModal = document.querySelector("#cookiePreferencesModal");

    // Check for missing elements
    const requiredElements = [
        { element: cookieBanner, id: "#cookieConsent" },
        { element: acceptCookiesButton, id: "#acceptCookies" },
        { element: rejectCookiesButton, id: "#rejectCookies" },
        { element: customizeCookiesButton, id: "#customizeCookies" },
        { element: savePreferencesButton, id: "#savePreferences" },
        { element: cancelPreferencesButton, id: "#cancelPreferences" },
        { element: cookiePreferencesModal, id: "#cookiePreferencesModal" },
    ];

    let hasMissingElements = false;
    requiredElements.forEach(({ element, id }) => {
        if (!element) {
            console.warn(`⚠️ Missing: ${id}`);
            hasMissingElements = true;
        }
    });

    if (hasMissingElements) {
        console.error("❌ One or more required elements are missing.");
        return;
    }

    // Initialize the modal
    const customizeModalInstance = new bootstrap.Modal(cookiePreferencesModal);

    // Add event listeners
    acceptCookiesButton?.addEventListener("click", () => handleCookieConsent(true));
    rejectCookiesButton?.addEventListener("click", () => handleCookieConsent(false));
    customizeCookiesButton?.addEventListener("click", (event) => {
        event.preventDefault();
        customizeModalInstance.show();
    });
    savePreferencesButton?.addEventListener("click", () => saveCookiePreferences());
    cancelPreferencesButton?.addEventListener("click", () => customizeModalInstance.hide());

    openCookiePolicyButton?.addEventListener("click", () => {
        window.location.href = "cookie-policy.html";
    });

    const hideBanner = () => {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    };

    function handleCookieConsent(accepted) {
        if (!consentId) {
            consentId = generateConsentID();
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

    function saveCookiePreferences() {
        if (!consentId) {
            consentId = generateConsentID();
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
        customizeModalInstance.hide();
    }

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

    function generateConsentID() {
        let lastCID = localStorage.getItem("lastCID"); 
        let newCID = lastCID ? parseInt(lastCID.split("-")[1]) + 1 : 1; 
        let consentID = `CID-${newCID}`;

        localStorage.setItem("lastCID", consentID);
        return consentID;
    }
});
