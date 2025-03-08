document.addEventListener('DOMContentLoaded', function() {
    // Load existing cookie preferences when modal opens
    const cookieSettingsBtn = document.getElementById('cookieSettings');
    if (cookieSettingsBtn) {
        cookieSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior if not using data-bs-toggle
            loadCookiePreferences();
            // Note: Modal should open via Bootstrap's data-bs-toggle and data-bs-target
        });
    } else {
        console.warn('Element with ID "cookieSettings" not found');
    }

    // Save cookie preferences
    const saveCookiePrefsBtn = document.getElementById('saveCookiePrefs');
    if (saveCookiePrefsBtn) {
        saveCookiePrefsBtn.addEventListener('click', function() {
            saveCookiePreferences();
        });
    } else {
        console.warn('Element with ID "saveCookiePrefs" not found');
    }

    function loadCookiePreferences() {
        const cookiePrefs = getCookie('cookiePreferences');
        if (cookiePrefs) {
            try {
                const preferences = JSON.parse(cookiePrefs);
                const analyticsCheckbox = document.getElementById('analyticsCookies');
                const marketingCheckbox = document.getElementById('marketingCookies');

                if (analyticsCheckbox) {
                    analyticsCheckbox.checked = preferences.analytics || false;
                } else {
                    console.warn('Element with ID "analyticsCookies" not found');
                }
                if (marketingCheckbox) {
                    marketingCheckbox.checked = preferences.marketing || false;
                } else {
                    console.warn('Element with ID "marketingCookies" not found');
                }
            } catch (error) {
                console.error('Error parsing cookie preferences:', error);
            }
        }
    }

    function saveCookiePreferences() {
        const analyticsCheckbox = document.getElementById('analyticsCookies');
        const marketingCheckbox = document.getElementById('marketingCookies');

        if (!analyticsCheckbox || !marketingCheckbox) {
            console.error('One or more cookie preference checkboxes not found');
            alert('Error: Unable to save preferences due to missing elements');
            return;
        }

        const preferences = {
            essential: true, // Always true as these are required
            analytics: analyticsCheckbox.checked,
            marketing: marketingCheckbox.checked,
            timestamp: new Date().toISOString()
        };

        // Save to cookies
        setCookie('cookiePreferences', JSON.stringify(preferences), 365);

        // Update in database
        updateDatabasePreferences(preferences);

        // Close modal
        const cookieModal = document.getElementById('cookieModal');
        if (cookieModal && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(cookieModal);
            if (modal) {
                modal.hide();
            } else {
                console.warn('Bootstrap modal instance not found');
            }
        } else {
            console.warn('Bootstrap not loaded or cookieModal element not found');
        }
    }

    function updateDatabasePreferences(preferences) {
        const token = localStorage.getItem('token'); // Assuming token-based auth
        const consentId = getCookie('consentId');

        if (!consentId) {
            console.warn('Consent ID not found in cookies');
            alert('Error: Consent ID not found. Please set preferences first.');
            return;
        }

        fetch('https://backendcookie-8qc1.onrender.com/api/update-cookie-prefs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }) // Add token if available
            },
            body: JSON.stringify({
                consentId: consentId,
                preferences: preferences,
                deletedAt: null
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Preferences updated in DB:', data);
            // Optionally notify user of success
            // alert('Cookie preferences saved successfully');
        })
        .catch(error => {
            console.error('Error updating preferences:', error);
            alert('Failed to save preferences to the server. Please try again.');
        });
    }

    // Cookie helper functions
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
});