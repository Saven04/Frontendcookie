const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Variable to store email during MFA flow
let mfaEmail = null;

// Function to fetch news from the backend
async function fetchNews(category = "general") {
    if (!newsContainer) {
        console.error("newsContainer not found in the DOM");
        return;
    }
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/news?category=${category}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const articles = await response.json();
        displayNews(articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-danger">Failed to load news. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display news
function displayNews(articles) {
    if (!newsContainer) {
        console.error("newsContainer not found in the DOM");
        return;
    }
    newsContainer.innerHTML = "";
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <p>No news articles available.</p>
            </div>
        `;
        return;
    }

    articles.forEach(article => {
        const newsItem = `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${article.urlToImage || 'default.jpg'}" class="card-img-top" alt="${article.title || 'News Image'}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${article.title || 'Untitled'}</h5>
                        <p class="card-text flex-grow-1">${article.description || 'No description available.'}</p>
                        <a href="${article.url}" target="_blank" class="btn btn-primary mt-auto">Read More</a>
                    </div>
                </div>
            </div>
        `;
        newsContainer.innerHTML += newsItem;
    });
}

// Load General News on Page Load
fetchNews();

// Apply font size settings
function applyFontSize(size) {
    document.body.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
}

// Theme Application Function
function applyTheme(theme) {
    const body = document.body;
    body.classList.remove("dark-mode");

    if (theme === "dark") {
        body.classList.add("dark-mode");
    } else if (theme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            body.classList.add("dark-mode");
        }
    }
}

// Debounce Function to limit search frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
    // Category Buttons Event Listeners
    document.querySelectorAll(".category-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("btn-primary"));
            button.classList.add("btn-primary");
            button.classList.remove("btn-secondary");
            fetchNews(button.getAttribute("data-category"));
        });
    });

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener("input", debounce(() => {
            const query = searchInput.value.trim().toLowerCase();
            const cards = document.querySelectorAll(".card");

            cards.forEach(card => {
                const title = card.querySelector(".card-title").textContent.toLowerCase();
                const description = card.querySelector(".card-text").textContent.toLowerCase();
                card.parentElement.style.display = 
                    title.includes(query) || description.includes(query) ? "block" : "none";
            });
        }, 300));
    }

    // Settings Modal Functionality
    const settingsModal = document.getElementById("settingsModal");
    if (settingsModal) {
        // Theme Selection
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) {
            const savedTheme = localStorage.getItem("theme") || "system";
            themeSelect.value = savedTheme;
            applyTheme(savedTheme);

            themeSelect.addEventListener("change", function () {
                const theme = this.value;
                applyTheme(theme);
                localStorage.setItem("theme", theme);
            });
        }

        // Font Size Selection
        const fontSizeSelect = document.getElementById("fontSizeSelect");
        if (fontSizeSelect) {
            const savedFontSize = localStorage.getItem("fontSize") || "medium";
            fontSizeSelect.value = savedFontSize;
            applyFontSize(savedFontSize);

            fontSizeSelect.addEventListener("change", function () {
                const size = this.value;
                applyFontSize(size);
                localStorage.setItem("fontSize", size);
            });
        }

        // Notification Switch
        const notificationSwitch = document.getElementById("notificationSwitch");
        if (notificationSwitch) {
            notificationSwitch.checked = localStorage.getItem("notifications") !== "false";
            notificationSwitch.addEventListener("change", function () {
                localStorage.setItem("notifications", this.checked);
            });
        }

        // Data Sharing Switch
        const dataSharingSwitch = document.getElementById("dataSharingSwitch");
        if (dataSharingSwitch) {
            dataSharingSwitch.checked = localStorage.getItem("dataSharing") !== "false";
            dataSharingSwitch.addEventListener("change", function () {
                localStorage.setItem("dataSharing", this.checked);
            });
        }

        // Save Settings Button
        const saveSettingsBtn = document.getElementById("saveSettings");
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener("click", () => {
                bootstrap.Modal.getInstance(settingsModal).hide();
            });
        }
    }

    // Cookie Preferences Functionality
    const cookieSettingsBtn = document.getElementById('cookieSettings');
    if (cookieSettingsBtn) {
        cookieSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Optional with data-bs-toggle
            loadCookiePreferences();
            // Ensure focus moves to the modal when it opens
            const cookieModal = document.getElementById('cookieModal');
            if (cookieModal && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(cookieModal);
                modal.show();
                // Move focus to the first focusable element in the modal
                setTimeout(() => {
                    const firstFocusable = cookieModal.querySelector('input:not([disabled]), button:not([data-bs-dismiss])');
                    if (firstFocusable) firstFocusable.focus();
                }, 100); // Small delay to ensure modal is fully rendered
            }
        });
    } else {
        console.warn('Element with ID "cookieSettings" not found');
    }

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
            essential: true,
            analytics: analyticsCheckbox.checked,
            marketing: marketingCheckbox.checked,
            timestamp: new Date().toISOString()
        };

        setCookie('cookiePreferences', JSON.stringify(preferences), 365);
        updateDatabasePreferences(preferences);

        const cookieModal = document.getElementById('cookieModal');
        if (cookieModal && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(cookieModal);
            if (modal) modal.hide();
        } else {
            console.warn('Bootstrap not loaded or cookieModal element not found');
        }
    }

    function updateDatabasePreferences(preferences) {
        const token = localStorage.getItem('token');
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
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                consentId: consentId,
                preferences: preferences,
                deletedAt: null
            })
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('Preferences updated in DB:', data);
        })
        .catch(error => {
            console.error('Error updating preferences:', error);
            alert('Failed to save preferences to the server. Please try again.');
        });
    }

    // Delete Cookie Data Functionality
    const deleteCookieDataBtn = document.getElementById("deleteCookieData");
    if (deleteCookieDataBtn) {
        deleteCookieDataBtn.addEventListener("click", async function(e) {
            e.preventDefault();

            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first to delete your data.");
                return;
            }

            const emailInputSection = document.getElementById("emailInputSection");
            const codeInputSection = document.getElementById("codeInputSection");
            const confirmDeleteCookie = document.getElementById("confirmDeleteCookie");
            const mfaEmailInput = document.getElementById("mfaEmail");
            const mfaCodeInput = document.getElementById("mfaCode");

            if (emailInputSection && codeInputSection && confirmDeleteCookie && mfaEmailInput && mfaCodeInput) {
                emailInputSection.classList.remove("d-none");
                codeInputSection.classList.add("d-none");
                confirmDeleteCookie.classList.add("d-none");
                mfaEmailInput.value = "";
                mfaCodeInput.value = "";
            }
            mfaEmail = null;

            const deleteModal = document.getElementById("deleteCookieConfirmModal");
            if (deleteModal && typeof bootstrap !== 'undefined') {
                const confirmModal = new bootstrap.Modal(deleteModal);
                confirmModal.show();
            }
        });
    }

    // Send MFA Code
    const sendMfaCodeBtn = document.getElementById("sendMfaCode");
    if (sendMfaCodeBtn) {
        sendMfaCodeBtn.addEventListener("click", async function() {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first.");
                return;
            }
        
            mfaEmail = document.getElementById("mfaEmail").value.trim();
            if (!mfaEmail || !mfaEmail.includes("@")) {
                alert("Please enter a valid email address.");
                return;
            }
        
            const consentId = getCookie("consentId");
            if (!consentId) {
                alert("Consent ID not found. Please set preferences first.");
                return;
            }
        
            try {
                const response = await fetch("https://backendcookie-8qc1.onrender.com/api/send-mfa", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: mfaEmail, consentId: consentId })
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to send MFA code: ${response.status} - ${errorData.message}`);
                }
        
                console.log("MFA code sent to user's email");
                document.getElementById("emailInputSection").classList.add("d-none");
                document.getElementById("codeInputSection").classList.remove("d-none");
                document.getElementById("confirmDeleteCookie").classList.remove("d-none");
            } catch (error) {
                console.error("Error sending MFA code:", error);
                alert(`Failed to send verification code: ${error.message}. Please try again later or check server logs.`);
            }
        });
    }

    // Resend Code
    const resendCodeBtn = document.getElementById("resendCode");
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first.");
                return;
            }

            if (!mfaEmail) {
                alert("No email provided. Please start over.");
                const deleteModal = document.getElementById("deleteCookieConfirmModal");
                if (deleteModal && typeof bootstrap !== 'undefined') {
                    bootstrap.Modal.getInstance(deleteModal).hide();
                }
                return;
            }

            try {
                const response = await fetch("https://backendcookie-8qc1.onrender.com/api/send-mfa", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: mfaEmail })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to resend MFA code: ${response.status} - ${errorData.message}`);
                }

                alert("A new code has been sent to your email.");
            } catch (error) {
                console.error("Error resending MFA code:", error);
                alert(`Failed to resend code: ${error.message}. Please try again.`);
            }
        });
    }

    // Confirm Deletion
    const confirmDeleteCookieBtn = document.getElementById("confirmDeleteCookie");
    if (confirmDeleteCookieBtn) {
        confirmDeleteCookieBtn.addEventListener("click", async function() {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first.");
                return;
            }

            const mfaCode = document.getElementById("mfaCode").value.trim();
            const deleteModal = document.getElementById("deleteCookieConfirmModal");
            const confirmModal = deleteModal && typeof bootstrap !== 'undefined' ? bootstrap.Modal.getInstance(deleteModal) : null;

            if (!mfaCode || mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) {
                alert("Please enter a valid 6-digit code.");
                return;
            }

            try {
                const response = await fetch("https://backendcookie-8qc1.onrender.com/api/verify-mfa", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ code: mfaCode })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Invalid code");
                }

                const consentId = getCookie("consentId");
                document.cookie.split(";").forEach(cookie => {
                    const [name] = cookie.trim().split("=");
                    if (name !== "consentId") {
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    }
                });

                const savedToken = localStorage.getItem("token");
                localStorage.clear();
                if (consentId) localStorage.setItem("consentId", consentId);
                if (savedToken) localStorage.setItem("token", savedToken);

                const themeSelect = document.getElementById("themeSelect");
                const fontSizeSelect = document.getElementById("fontSizeSelect");
                const notificationSwitch = document.getElementById("notificationSwitch");
                const dataSharingSwitch = document.getElementById("dataSharingSwitch");

                if (themeSelect) themeSelect.value = "system";
                if (fontSizeSelect) fontSizeSelect.value = "medium";
                if (notificationSwitch) notificationSwitch.checked = true;
                if (dataSharingSwitch) dataSharingSwitch.checked = true;

                applyTheme("system");
                applyFontSize("medium");

                if (confirmModal) confirmModal.hide();
                alert("Cookie preferences and location data have been deleted successfully.");
                mfaEmail = null;
            } catch (error) {
                console.error("MFA verification error:", error);
                alert(error.message || "Invalid verification code. Please try again.");
                document.getElementById("mfaCode").value = "";
            }
        });
    }
});