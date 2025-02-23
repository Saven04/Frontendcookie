// Function to show the custom popup
function showCustomPopup(message) {
    const customPopup = document.getElementById("customPopup");
    const popupMessage = document.getElementById("popupMessage");

    // Set the message
    popupMessage.textContent = message;

    // Show the popup
    customPopup.style.display = "flex";

    // Close the popup when the close button is clicked
    const closePopupButton = document.getElementById("closePopupButton");
    closePopupButton.onclick = () => {
        customPopup.style.display = "none";
    };

    // Close the popup when clicking outside the popup content
    customPopup.onclick = (event) => {
        if (event.target === customPopup) {
            customPopup.style.display = "none";
        }
    };
}

// Restrict cookie interactions for non-logged-in users
function restrictCookieInteraction(event) {
    if (!isUserLoggedIn()) {
        event.preventDefault(); // Prevent default button behavior
        showCustomPopup("Please log in or register to manage cookie preferences.");
        return false;
    }
    return true; // Allow interaction if logged in
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
    Object.assign(cookieSettingsButton.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        backgroundColor: "transparent",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: "1000",
    });
    document.body.appendChild(cookieSettingsButton);

    // Create dropdown menu
    const settingsDropdown = document.createElement("div");
    settingsDropdown.id = "settingsDropdown";
    Object.assign(settingsDropdown.style, {
        position: "fixed",
        top: "50px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Transparent black background
        color: "#fff", // White text color for visibility
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        display: "none",
        zIndex: "1000",
    });

    const customizePreferenceOption = document.createElement("div");
    customizePreferenceOption.innerText = "Customize Preference";
    customizePreferenceOption.style.padding = "10px";
    customizePreferenceOption.style.cursor = "pointer";
    customizePreferenceOption.addEventListener("click", () => {
        cookiePreferencesModal.classList.add("show");
        settingsDropdown.style.display = "none";
    });

    const policiesOption = document.createElement("div");
    policiesOption.innerText = "Read the Policies and Guidelines";
    policiesOption.style.padding = "10px";
    policiesOption.style.cursor = "pointer";

    const policiesSubMenu = document.createElement("div");
    policiesSubMenu.style.paddingLeft = "20px";
    policiesSubMenu.style.display = "none";

    const cookiePolicyOption = document.createElement("div");
    cookiePolicyOption.innerText = "Cookie Policy";
    cookiePolicyOption.style.padding = "5px";
    cookiePolicyOption.style.cursor = "pointer";
    cookiePolicyOption.addEventListener("click", () => {
        window.open("/cookie-policy", "_blank");
        settingsDropdown.style.display = "none";
    });

    const privacyPolicyOption = document.createElement("div");
    privacyPolicyOption.innerText = "Privacy Policy";
    privacyPolicyOption.style.padding = "5px";
    privacyPolicyOption.style.cursor = "pointer";
    privacyPolicyOption.addEventListener("click", () => {
        window.open("/privacy-policy", "_blank");
        settingsDropdown.style.display = "none";
    });

    const tosOption = document.createElement("div");
    tosOption.innerText = "Terms of Service";
    tosOption.style.padding = "5px";
    tosOption.style.cursor = "pointer";
    tosOption.addEventListener("click", () => {
        window.open("/terms-of-service", "_blank");
        settingsDropdown.style.display = "none";
    });

    policiesSubMenu.appendChild(cookiePolicyOption);
    policiesSubMenu.appendChild(privacyPolicyOption);
    policiesSubMenu.appendChild(tosOption);

    policiesOption.addEventListener("click", () => {
        policiesSubMenu.style.display = policiesSubMenu.style.display === "none" ? "block" : "none";
    });

    const deleteDataOption = document.createElement("div");
    deleteDataOption.innerText = "Delete My Data";
    deleteDataOption.style.padding = "10px";
    deleteDataOption.style.cursor = "pointer";
    deleteDataOption.addEventListener("click", async () => {
        if (!isUserLoggedIn()) {
            showCustomPopup("Please log in to delete your data.");
            return;
        }

        const consentId = getOrCreateConsentID();
        if (!consentId) {
            showCustomPopup("No data found to delete.");
            return;
        }

        try {
            const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/delete-my-data/${consentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Failed to delete data: ${response.statusText}`);
            }

            // Delete all related cookies
            ["consentId", "cookiesAccepted", "cookiePreferences"].forEach(deleteCookie);

            showCustomPopup("Your data has been deleted.");
            settingsDropdown.style.display = "none";
        } catch (error) {
            console.error("❌ Error deleting data:", error);
            showCustomPopup("Failed to delete data. Please try again later.");
        }
    });

    settingsDropdown.appendChild(customizePreferenceOption);
    settingsDropdown.appendChild(policiesOption);
    settingsDropdown.appendChild(policiesSubMenu);
    settingsDropdown.appendChild(deleteDataOption);
    document.body.appendChild(settingsDropdown);

    cookieSettingsButton.addEventListener("click", () => {
        settingsDropdown.style.display = settingsDropdown.style.display === "none" ? "block" : "none";
    });

    // Hide Cookie Settings button for non-logged-in users
    if (cookieSettingsButton) {
        cookieSettingsButton.style.display = isUserLoggedIn() ? "block" : "none";
    }

    // Apply restriction to Accept, Reject, and Customize buttons
    document.querySelectorAll("#acceptCookies, #rejectCookies, #customizeCookies").forEach(button => {
        button.addEventListener("click", restrictCookieInteraction);
    });

    let consentId = getOrCreateConsentID();
    console.log("Current Consent ID:", consentId);

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    // Define handlers for accept and reject cookies
    function handleAcceptCookies() {
        handleCookieConsent(true);
    }

    function handleRejectCookies() {
        handleCookieConsent(false);
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

    // During registration, link the existing consent ID to the new user
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
