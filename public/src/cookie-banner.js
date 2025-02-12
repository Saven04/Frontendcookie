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
    cookieSettingsButton.style.zIndex = "1000";
    document.body.appendChild(cookieSettingsButton);

    const deleteDataButton = document.createElement("button");
    deleteDataButton.id = "deleteDataButton";
    deleteDataButton.innerText = "Delete My Data";
    deleteDataButton.style.display = "block";
    deleteDataButton.style.marginTop = "10px";
    deleteDataButton.style.padding = "10px";
    deleteDataButton.style.backgroundColor = "red";
    deleteDataButton.style.color = "white";
    deleteDataButton.style.border = "none";
    deleteDataButton.style.cursor = "pointer";
    
    cookiePreferencesModal.appendChild(deleteDataButton);

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

    deleteDataButton.addEventListener("click", async () => {
        if (!consentId) {
            alert("No consent ID found. Unable to delete data.");
            return;
        }

        try {
            const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/delete-my-data/${consentId}`, {
                method: "DELETE",
            });
            const result = await response.json();
            alert(result.message);
            document.cookie = "consentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "cookiesAccepted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "cookiePreferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch (error) {
            alert("Failed to delete data.");
        }
    });
});
