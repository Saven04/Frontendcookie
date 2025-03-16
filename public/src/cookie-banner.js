// Function to generate a short unique consent ID
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

// Document Ready Event
document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const customizeCookiesButton = document.getElementById("customizeCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const cancelPreferencesButton = document.getElementById("cancelPreferences");
    const cookiePreferencesModal = document.getElementById("cookiePreferencesModal");

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

 
    // Cookie Consent State
    let consentId = getCookie("consentId");
    let cookiesAccepted = getCookie("cookiesAccepted");

    // DOM elements for tabs and form
    const registerTab = document.getElementById("register-tab");
    const loginTab = document.getElementById("login-tab");
    const registerForm = document.getElementById("registerForm");

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
    savePreferencesButton.addEventListener("click", () => {
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

        sendPreferencesToDB(consentId, preferences);

        const consentStatus = preferences.performance || preferences.functional ? "accepted" : "rejected";
        saveLocationData(consentId, consentStatus);

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

    async function saveLocationData(consentId) {
        try {
            // Fetch IP data from ipinfo.io
            const response = await fetch("https://ipinfo.io/json?token=10772b28291307");
            if (!response.ok) throw new Error(`Failed to fetch IP data! Status: ${response.status}`);
            const data = await response.json();
    
            // Prepare location data aligned with Location schema
            const locationData = {
                consentId,
                ipAddress: data.ip,
                isp: data.org,
                city: data.city,
                country: data.country,
            };
    
            // Save location data to DB
            await sendLocationDataToDB(locationData);
    
            // Log security data with consentId
            const token = localStorage.getItem("token") || "anonymous";
            const securityResponse = await fetch("https://backendcookie-8qc1.onrender.com/api/log-security", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ipAddress: data.ip || "unknown",
                    consentId: consentId // Always link to consent event
                })
            });
    
            if (!securityResponse.ok) {
                throw new Error(`Failed to log security data: ${securityResponse.status}`);
            }
    
            console.log("✅ Location and security data saved successfully");
        } catch (error) {
            console.error("❌ Error saving location/security data:", error.message || error);
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
                const errorData = await response.json();
                throw new Error(`Failed to save location data: ${response.status} - ${errorData.message || "No details"}`);
            }

            const result = await response.json();
            console.log("✅ Location data saved:", result.message);
        } catch (error) {
            console.error("❌ Error sending location data to DB:", error.message || error);
        }
    }

    // Handle Cookie Consent
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

        const consentStatus = accepted ? "accepted" : "rejected";
        saveLocationData(consentId, consentStatus);

        hideBanner();
    }
});