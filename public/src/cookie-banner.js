document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");
    const strictlyNecessaryCheckbox = document.getElementById("strictlyNecessary");
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

    // Function to generate a short unique consent ID
    function generateShortUUID() {
        return Math.random().toString(36).substring(2, 10);
    }

    // Function to check if user is logged in
    function isUserLoggedIn() {
        return localStorage.getItem("token") !== null;
    }

    // Get or create Consent ID
    function getOrCreateConsentID() {
        let consentId = localStorage.getItem("consentId");
        if (!consentId) {
            consentId = generateShortUUID();
            localStorage.setItem("consentId", consentId);
        }
        return consentId;
    }

    // Function to handle accepting cookies
    function handleAcceptCookies() {
        handleCookieConsent(true);
    }

    // Function to handle rejecting cookies
    function handleRejectCookies() {
        handleCookieConsent(false);
    }

    // Function to hide the cookie banner and remove event listeners
    function hideBanner() {
        // Remove event listeners from the buttons
        if (acceptCookiesButton) {
            acceptCookiesButton.removeEventListener("click", handleAcceptCookies);
        }
        if (rejectCookiesButton) {
            rejectCookiesButton.removeEventListener("click", handleRejectCookies);
        }
        if (customizeCookiesButton) {
            customizeCookiesButton.removeEventListener("click", restrictCookieInteraction);
        }

        // Hide the banner
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    // Function to set a cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    }

    // Function to get a cookie
    function getCookie(name) {
        const nameEq = `${name}=`;
        return document.cookie.split("; ").find((c) => c.startsWith(nameEq))?.split("=")[1] || null;
    }

    // Function to delete a cookie
    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    }

    // Function to handle cookie consent
    function handleCookieConsent(accepted) {
        const consentId = getOrCreateConsentID();
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

    // Function to send preferences to the backend
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

    // Function to send location data to the backend
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

    // Restrict cookie interactions for non-logged-in users
    function restrictCookieInteraction(event) {
        if (!isUserLoggedIn()) {
            event.preventDefault();
            alert("Please log in or register to manage cookie preferences.");
            return false;
        }
    }

    // Attach event listeners to the buttons
    if (acceptCookiesButton) {
        acceptCookiesButton.addEventListener("click", handleAcceptCookies);
    }
    if (rejectCookiesButton) {
        rejectCookiesButton.addEventListener("click", handleRejectCookies);
    }
    if (customizeCookiesButton) {
        customizeCookiesButton.addEventListener("click", restrictCookieInteraction);
    }

    // Show the cookie banner if no consent has been given
    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    // Customize preferences modal logic
    customizeCookiesButton.addEventListener("click", (event) => {
        event.preventDefault();
        cookiePreferencesModal.classList.add("show");
        strictlyNecessaryCheckbox.checked = true;
        strictlyNecessaryCheckbox.disabled = true;
    });

    savePreferencesButton.addEventListener("click", () => {
        const consentId = getOrCreateConsentID();
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

    // Link consent ID to user after registration
    async function linkConsentIdToUser(userId) {
        const consentId = localStorage.getItem("consentId");
        if (!consentId) return;

        try {
            await fetch("https://backendcookie-8qc1.onrender.com/api/link-consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, consentId }),
            });
            console.log(`✅ Linked Consent ID ${consentId} to user ${userId}`);
        } catch (error) {
            console.error("❌ Error linking consent ID:", error);
        }
    }

    // Call this function after a successful registration
    function handleUserRegistration(userId) {
        linkConsentIdToUser(userId);
    }
});
