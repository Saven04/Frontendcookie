<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Consent</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    /* Custom styles for the cookie banner */
    #cookieConsent {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #f8f9fa;
      padding: 1rem;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      display: none;
      z-index: 1000;
    }
    #cookieConsent.show {
      display: block;
    }
    #cookiePreferencesModal .modal-dialog {
      max-width: 600px;
    }
    #settingsDropdown {
      display: none;
      position: absolute;
      top: 40px;
      right: 0;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    #settingsDropdown.show {
      display: block;
    }
  </style>
</head>
<body>

<!-- Cookie Banner -->
<div id="cookieConsent" class="text-center">
  <p>We use cookies to enhance your experience. <a href="#" data-bs-toggle="modal" data-bs-target="#cookiePreferencesModal">Customize preferences</a>.</p>
  <button id="acceptCookies" class="btn btn-primary btn-sm me-2">Accept All</button>
  <button id="rejectCookies" class="btn btn-secondary btn-sm">Reject All</button>
</div>

<!-- Settings Gear Icon -->
<button id="cookieSettingsButton" class="btn btn-light position-fixed top-0 end-0 m-3">
  ⚙️
</button>

<!-- Dropdown Menu for Settings -->
<div id="settingsDropdown">
  <div class="dropdown-item" data-bs-toggle="modal" data-bs-target="#cookiePreferencesModal">Customize Preferences</div>
  <div class="dropdown-divider"></div>
  <div class="dropdown-item" onclick="window.open('/cookie-policy', '_blank')">Cookie Policy</div>
  <div class="dropdown-item" onclick="window.open('/privacy-policy', '_blank')">Privacy Policy</div>
  <div class="dropdown-item" onclick="window.open('/terms-of-service', '_blank')">Terms of Service</div>
  <div class="dropdown-divider"></div>
  <div class="dropdown-item" id="deleteDataOption">Delete My Data</div>
</div>

<!-- Cookie Preferences Modal -->
<div class="modal fade" id="cookiePreferencesModal" tabindex="-1" aria-labelledby="cookiePreferencesModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="cookiePreferencesModalLabel">Cookie Preferences</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="strictlyNecessary" checked disabled>
            <label class="form-check-label" for="strictlyNecessary">Strictly Necessary</label>
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="performance">
            <label class="form-check-label" for="performance">Performance</label>
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="functional">
            <label class="form-check-label" for="functional">Functional</label>
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="advertising">
            <label class="form-check-label" for="advertising">Advertising</label>
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="socialMedia">
            <label class="form-check-label" for="socialMedia">Social Media</label>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" id="savePreferences">Save Preferences</button>
      </div>
    </div>
  </div>
</div>

<!-- Bootstrap JS and Popper.js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
<script>
  // Function to generate a short unique consent ID
  function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const cookieBanner = document.getElementById("cookieConsent");
    const acceptCookiesButton = document.getElementById("acceptCookies");
    const rejectCookiesButton = document.getElementById("rejectCookies");
    const savePreferencesButton = document.getElementById("savePreferences");
    const deleteDataOption = document.getElementById("deleteDataOption");
    const cookieSettingsButton = document.getElementById("cookieSettingsButton");
    const settingsDropdown = document.getElementById("settingsDropdown");

    const strictlyNecessaryCheckbox = document.getElementById("strictlyNecessary");
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

    let consentId = getCookie("consentId");

    if (!getCookie("cookiesAccepted")) {
      setTimeout(() => cookieBanner.classList.add("show"), 500);
    }

    acceptCookiesButton.addEventListener("click", () => handleCookieConsent(true));
    rejectCookiesButton.addEventListener("click", () => handleCookieConsent(false));

    cookieSettingsButton.addEventListener("click", () => {
      settingsDropdown.classList.toggle("show");
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
      hideBanner();
    });

    deleteDataOption.addEventListener("click", async () => {
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

        ["consentId", "cookiesAccepted", "cookiePreferences"].forEach(deleteCookie);
        alert("Your data has been deleted.");
      } catch (error) {
        console.error("❌ Error deleting data:", error);
        alert("Failed to delete data. Please try again later.");
      }
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
      hideBanner();
    }

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
        console.log("✅ Preferences saved:", await response.json());
      } catch (error) {
        console.error("❌ Error saving preferences:", error);
      }
    }
  });
</script>
</body>
</html>
