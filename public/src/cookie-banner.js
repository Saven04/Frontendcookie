/* CSS STYLES */
const style = document.createElement("style");
style.innerHTML = `
    #cookieConsent {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    .cookie-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px;
        margin: 5px;
        cursor: pointer;
        border-radius: 5px;
    }
    .cookie-btn.reject {
        background: #d9534f;
    }
    #cookiePreferencesModal {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        z-index: 1050;
    }
    .show {
        display: block !important;
    }
    #settingsDropdown {
        position: fixed;
        top: 50px;
        right: 10px;
        background: #333;
        color: white;
        border: 1px solid #555;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        display: none;
        z-index: 1000;
        padding: 10px;
        font-family: Arial, sans-serif;
        width: 200px;
    }
    .dropdown-option {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #555;
    }
    .dropdown-option:hover {
        background: #555;
    }
`;
document.head.appendChild(style);

/* JAVASCRIPT CODE */
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}

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
    cookieSettingsButton.innerHTML = "⚙️";
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
    document.body.appendChild(settingsDropdown);

    function createDropdownOption(text, onClick) {
        const option = document.createElement("div");
        option.classList.add("dropdown-option");
        option.innerText = text;
        option.addEventListener("click", onClick);
        settingsDropdown.appendChild(option);
    }

    createDropdownOption("Customize Preferences", () => {
        cookiePreferencesModal.classList.add("show");
        settingsDropdown.style.display = "none";
    });

    createDropdownOption("Read Policies", () => {
        window.open("/privacy-policy", "_blank");
        settingsDropdown.style.display = "none";
    });

    createDropdownOption("Delete My Data", async () => {
        const consentId = getCookie("consentId");
        if (!consentId) {
            alert("No data found to delete.");
            return;
        }
        await fetch(`https://backendcookie-8qc1.onrender.com/api/delete-my-data/${consentId}`, { method: "DELETE" });
        ["consentId", "cookiesAccepted", "cookiePreferences"].forEach(deleteCookie);
        alert("Your data has been deleted.");
        settingsDropdown.style.display = "none";
    });

    cookieSettingsButton.addEventListener("click", () => {
        settingsDropdown.style.display = settingsDropdown.style.display === "none" ? "block" : "none";
    });

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

    if (!getCookie("cookiesAccepted")) {
        setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => {
        setCookie("cookiesAccepted", "true", 365);
        cookieBanner.classList.remove("show");
    });

    rejectCookiesButton.addEventListener("click", () => {
        setCookie("cookiesAccepted", "false", 365);
        cookieBanner.classList.remove("show");
    });
});
