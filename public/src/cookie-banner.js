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
    const strictlyNecessaryCheckbox = document.getElementById("strictlyNecessary");
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");
    const cookieSettingsButton = document.createElement("button");

    cookieSettingsButton.id = "cookieSettingsButton";
    cookieSettingsButton.innerHTML = "⚙️"; // Gear icon
    cookieSettingsButton.style.position = "fixed";
    cookieSettingsButton.style.top = "10px";
    cookieSettingsButton.style.right = "10px";
    cookieSettingsButton.style.backgroundColor = "transparent";
    cookieSettingsButton.style.border = "none";
    cookieSettingsButton.style.fontSize = "24px";
    cookieSettingsButton.style.cursor = "pointer";
    cookieSettingsButton.style.zIndex = "1000"; // Ensure it's above other elements
    document.body.appendChild(cookieSettingsButton);

    // Create "Delete My Data" button inside the modal
    const deleteDataButton = document.createElement("button");
    deleteDataButton.id = "deleteDataButton";
    deleteDataButton.innerText = "Delete My Data";
    deleteDataButton.style.marginTop = "10px";
    deleteDataButton.style.backgroundColor = "#d9534f"; // Red color
    deleteDataButton.style.color = "white";
    deleteDataButton.style.border = "none";
    deleteDataButton.style.padding = "10px";
    deleteDataButton.style.cursor = "pointer";
    deleteDataButton.style.borderRadius = "5px";
    
    // Append the button inside the cookie preferences modal
    cookiePreferencesModal.appendChild(deleteDataButton);

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;samesite=strict`;
    }

    function getCookie(name) {
        const nameEq = name + "=";
        const cookies = document.cookie.split(";");
        for (let c of cookies) {
            c = c.trim();
            if (c.indexOf(nameEq) === 0) return c.substring(nameEq.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
    }

    let consentId = getCookie("consentId");

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => {
        handleCookieConsent(true);
    });

    rejectCookiesButton.addEventListener("click", () => {
        handleCookieConsent(false);
    });

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
        strictlyNecessaryCheckbox.checked = true;
        strictlyNecessaryCheckbox.disabled = true;
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

    cookieSettingsButton.addEventListener("click", () => {
        cookiePreferencesModal.classList.add("show");
    });

    function hideBanner() {
        cookieBanner.classList.add("hide");
        setTimeout(() => {
            cookieBanner.classList.remove("show", "hide");
        }, 500);
    }

    async function sendPreferencesToDB(consentId, preferences) {
        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/save", {
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

  deleteDataButton.addEventListener("click", async () => {
    if (!consentId) {
        alert("No data found to delete.");
        return;
    }

    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/delete-my-data/${consentId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete data: ${response.statusText}`);
        }

        // Delete cookies after successful API response
        deleteCookie("consentId");
        deleteCookie("cookiesAccepted");
        deleteCookie("cookiePreferences");

        alert("Your data has been deleted.");
        cookiePreferencesModal.classList.remove("show");
    } catch (error) {
        console.error("❌ Error deleting data:", error);
        alert("Failed to delete data. Please try again later.");
    }
});

// Function to delete cookies
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

