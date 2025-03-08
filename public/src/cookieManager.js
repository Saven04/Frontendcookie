document.addEventListener('DOMContentLoaded', function() {
    // Load existing cookie preferences when modal opens
    document.getElementById('cookieSettings').addEventListener('click', function(e) {
        e.preventDefault();
        loadCookiePreferences();
    });

    // Save cookie preferences
    document.getElementById('saveCookiePrefs').addEventListener('click', function() {
        saveCookiePreferences();
    });

    function loadCookiePreferences() {
        // Get existing cookie preferences from cookies
        const cookiePrefs = getCookie('cookiePreferences');
        if (cookiePrefs) {
            const preferences = JSON.parse(cookiePrefs);
            document.getElementById('analyticsCookies').checked = preferences.analytics || false;
            document.getElementById('marketingCookies').checked = preferences.marketing || false;
        }
    }

    function saveCookiePreferences() {
        const preferences = {
            essential: true, // Always true as these are required
            analytics: document.getElementById('analyticsCookies').checked,
            marketing: document.getElementById('marketingCookies').checked,
            timestamp: new Date().toISOString()
        };

        // Save to cookies
        setCookie('cookiePreferences', JSON.stringify(preferences), 365);

        // Update in database (simulated API call)
        updateDatabasePreferences(preferences);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cookieModal'));
        modal.hide();
    }

    function updateDatabasePreferences(preferences) {
        // Simulated API call to update database
        fetch('https://backendcookie-8qc1.onrender.com/api/update-cookie-prefs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consentId: getCookie('consentId'), // Existing consent ID remains unchanged
                preferences: preferences,
                deletedAt: null // Always reset to null when updating preferences
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Preferences updated in DB:', data);
        })
        .catch(error => {
            console.error('Error updating preferences:', error);
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
    }
});