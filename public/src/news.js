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
    if (!newsContainer) return;
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
    } else if (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        body.classList.add("dark-mode");
    }
}

// Debounce Function to limit search frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
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
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
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
            document.querySelectorAll(".card").forEach(card => {
                const title = card.querySelector(".card-title").textContent.toLowerCase();
                const description = card.querySelector(".card-text").textContent.toLowerCase();
                card.parentElement.style.display = title.includes(query) || description.includes(query) ? "block" : "none";
            });
        }, 300));
    }

    // Settings Modal Functionality
    const settingsModal = document.getElementById("settingsModal");
    if (settingsModal) {
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

        const notificationSwitch = document.getElementById("notificationSwitch");
        if (notificationSwitch) {
            notificationSwitch.checked = localStorage.getItem("notifications") !== "false";
            notificationSwitch.addEventListener("change", function () {
                localStorage.setItem("notifications", this.checked);
            });
        }

        const dataSharingSwitch = document.getElementById("dataSharingSwitch");
        if (dataSharingSwitch) {
            dataSharingSwitch.checked = localStorage.getItem("dataSharing") !== "false";
            dataSharingSwitch.addEventListener("change", function () {
                localStorage.setItem("dataSharing", this.checked);
            });
        }

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
            e.preventDefault();
            loadCookiePreferences();
            const cookieModal = document.getElementById('cookieModal');
            if (cookieModal && typeof bootstrap !== 'undefined') {
                const modal = new bootstrap.Modal(cookieModal);
                modal.show();
                setTimeout(() => {
                    const firstFocusable = cookieModal.querySelector('input:not([disabled]), button:not([data-bs-dismiss])');
                    if (firstFocusable) firstFocusable.focus();
                }, 100);
            }
        });
    }
    
    const saveCookiePrefsBtn = document.getElementById('saveCookiePrefs');
    if (saveCookiePrefsBtn) {
        saveCookiePrefsBtn.addEventListener('click', function() {
            saveCookiePreferences();
        });
    }
    
    function loadCookiePreferences() {
        const cookiePrefs = getCookie('cookiePreferences');
        if (!cookiePrefs) return;
        try {
            const preferencesData = JSON.parse(cookiePrefs);
            const preferences = preferencesData.preferences || {};
            const performanceCheckbox = document.getElementById('performanceCookies');
            const functionalCheckbox = document.getElementById('functionalCookies');
            const advertisingCheckbox = document.getElementById('advertisingCookies');
            const socialMediaCheckbox = document.getElementById('socialMediaCookies');
            if (performanceCheckbox) performanceCheckbox.checked = preferences.performance || false;
            if (functionalCheckbox) functionalCheckbox.checked = preferences.functional || false;
            if (advertisingCheckbox) advertisingCheckbox.checked = preferences.advertising || false;
            if (socialMediaCheckbox) socialMediaCheckbox.checked = preferences.socialMedia || false;
        } catch (error) {
            console.error('Error parsing cookie preferences:', error);
        }
    }
    
    function saveCookiePreferences() {
        const performanceCheckbox = document.getElementById('performanceCookies');
        const functionalCheckbox = document.getElementById('functionalCookies');
        const advertisingCheckbox = document.getElementById('advertisingCookies');
        const socialMediaCheckbox = document.getElementById('socialMediaCookies');
        if (!performanceCheckbox || !functionalCheckbox || !advertisingCheckbox || !socialMediaCheckbox) {
            console.error('Cookie preference checkboxes not found');
            alert('Error: Unable to save preferences');
            return;
        }
    
        const preferences = {
            strictlyNecessary: true,
            performance: performanceCheckbox.checked,
            functional: functionalCheckbox.checked,
            advertising: advertisingCheckbox.checked,
            socialMedia: socialMediaCheckbox.checked
        };
    
        console.log('Saving cookie preferences:', preferences);
    
        const preferencesData = { preferences };
        setCookie('cookiePreferences', JSON.stringify(preferencesData), 365);
        updateDatabasePreferences(preferences);
    
        const cookieModal = document.getElementById('cookieModal');
        if (cookieModal && typeof bootstrap !== 'undefined') {
            const modalInstance = bootstrap.Modal.getInstance(cookieModal);
            if (modalInstance) {
                modalInstance.hide();
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
    }
    
    async function updateDatabasePreferences(preferences) {
        const token = localStorage.getItem('token');
        const consentId = getCookie('consentId');
        if (!consentId) {
            console.warn('Consent ID not found');
            alert('Error: Consent ID not found. Please set preferences first.');
            return;
        }
    
        const payload = {
            consentId,
            preferences,
            deletedAt: null
        };
    
        // Only fetch and include IP/location if performance or functional is enabled
        if (preferences.performance || preferences.functional) {
            try {
                const ipInfoToken = '10772b28291307'; // Replace with your token
                const response = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch IP info: ${response.status}`);
                }
                const ipData = await response.json();
    
                const [latitude, longitude] = ipData.loc ? ipData.loc.split(',').map(Number) : [null, null];
                payload.ipAddress = ipData.ip || null;
                payload.location = {
                    city: ipData.city || null,
                    country: ipData.country || null,
                    latitude: latitude || null,
                    longitude: longitude || null
                };
            } catch (error) {
                console.error('Error fetching IP/location:', error);
                // Proceed without location data if fetch fails
            }
        }
    
        console.log('Sending to backend:', JSON.stringify(payload));
    
        try {
            const fetchResponse = await fetch('https://backendcookie-8qc1.onrender.com/api/update-cookie-prefs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload)
            });
    
            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                throw new Error(errorData.message || `HTTP error! status: ${fetchResponse.status}`);
            }
    
            const data = await fetchResponse.json();
            console.log('Preferences and location updated:', data);
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert(`Failed to save preferences: ${error.message}. Check console for details.`);
        }
    }
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }
    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }



    // Delete Cookie Data Functionality
    const deleteCookieDataBtn = document.getElementById("deleteCookieData");
    if (deleteCookieDataBtn) {
        deleteCookieDataBtn.addEventListener("click", function(e) {
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
            const mfaStatus = document.getElementById("mfaStatus");

            if (emailInputSection && codeInputSection && confirmDeleteCookie && mfaEmailInput && mfaCodeInput) {
                emailInputSection.classList.remove("d-none");
                codeInputSection.classList.add("d-none");
                confirmDeleteCookie.classList.add("d-none");
                mfaEmailInput.value = "";
                mfaCodeInput.value = "";
                if (mfaStatus) {
                    mfaStatus.classList.add("d-none");
                    mfaStatus.textContent = "";
                }
            }
            mfaEmail = null;

            const deleteModal = document.getElementById("deleteCookieConfirmModal");
            if (deleteModal && typeof bootstrap !== 'undefined') {
                const confirmModal = new bootstrap.Modal(deleteModal);
                confirmModal.show();
                setTimeout(() => mfaEmailInput.focus(), 100);
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

            const mfaEmailInput = document.getElementById("mfaEmail");
            mfaEmail = mfaEmailInput.value.trim();
            if (!mfaEmail || !mfaEmail.includes("@")) {
                alert("Please enter a valid email address.");
                return;
            }

            const consentId = getCookie("consentId");
            if (!consentId) {
                alert("Consent ID not found. Please set preferences first.");
                return;
            }

            const spinner = sendMfaCodeBtn.querySelector(".spinner-border");
            const mfaStatus = document.getElementById("mfaStatus");
            sendMfaCodeBtn.disabled = true;
            if (spinner) spinner.classList.remove("d-none");
            if (mfaStatus) {
                mfaStatus.classList.add("d-none");
                mfaStatus.textContent = "";
            }

            try {
                const response = await fetch("https://backendcookie-8qc1.onrender.com/api/send-mfa", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: mfaEmail, consentId })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to send MFA code: ${response.status} - ${errorData.message}`);
                }

                document.getElementById("emailInputSection").classList.add("d-none");
                document.getElementById("codeInputSection").classList.remove("d-none");
                document.getElementById("confirmDeleteCookie").classList.remove("d-none");
                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-danger");
                    mfaStatus.classList.add("alert-info");
                    mfaStatus.textContent = `Code sent to ${mfaEmail}`;
                }
                document.getElementById("mfaCode").focus();
            } catch (error) {
                console.error("Error sending MFA code:", error);
                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-info");
                    mfaStatus.classList.add("alert-danger");
                    mfaStatus.textContent = `Failed to send code: ${error.message}`;
                } else {
                    alert(`Failed to send verification code: ${error.message}`);
                }
            } finally {
                sendMfaCodeBtn.disabled = false;
                if (spinner) spinner.classList.add("d-none");
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
                    bootstrap.Modal.getInstance(deleteModal)?.hide();
                }
                return;
            }

            const mfaStatus = document.getElementById("mfaStatus");
            resendCodeBtn.disabled = true;
            if (mfaStatus) {
                mfaStatus.classList.add("d-none");
                mfaStatus.textContent = "";
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

                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-danger");
                    mfaStatus.classList.add("alert-info");
                    mfaStatus.textContent = `New code sent to ${mfaEmail}`;
                } else {
                    alert("A new code has been sent to your email.");
                }
            } catch (error) {
                console.error("Error resending MFA code:", error);
                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-info");
                    mfaStatus.classList.add("alert-danger");
                    mfaStatus.textContent = `Failed to resend code: ${error.message}`;
                } else {
                    alert(`Failed to resend code: ${error.message}`);
                }
            } finally {
                resendCodeBtn.disabled = false;
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
            const mfaStatus = document.getElementById("mfaStatus");

            if (!mfaCode || mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) {
                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-info");
                    mfaStatus.classList.add("alert-warning");
                    mfaStatus.textContent = "Please enter a valid 6-digit code.";
                } else {
                    alert("Please enter a valid 6-digit code.");
                }
                return;
            }

            confirmDeleteCookieBtn.disabled = true;
            if (mfaStatus) {
                mfaStatus.classList.add("d-none");
                mfaStatus.textContent = "";
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
                if (mfaStatus) {
                    mfaStatus.classList.remove("d-none");
                    mfaStatus.classList.remove("alert-info");
                    mfaStatus.classList.add("alert-danger");
                    mfaStatus.textContent = error.message || "Invalid verification code.";
                } else {
                    alert(error.message || "Invalid verification code. Please try again.");
                }
                document.getElementById("mfaCode").value = "";
            } finally {
                confirmDeleteCookieBtn.disabled = false;
            }
        });
    }
});