const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Variable to store email during MFA flow
let mfaEmail = null;

// Fetch news from backend
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

// Display news articles
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

// Apply font size
function applyFontSize(size) {
    document.body.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
}

// Apply theme
function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Cookie helpers
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

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    // Load initial news
    fetchNews();

    // Category buttons
    document.querySelectorAll(".category-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("btn-primary", "btn-secondary"));
            button.classList.add("btn-primary");
            fetchNews(button.getAttribute("data-category"));
        });
    });

    // Search functionality
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

    // Settings modal (assumed in settings.js, minimal setup here)
    const settingsModal = document.getElementById("settingsModal");
    if (settingsModal) {
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) {
            const savedTheme = localStorage.getItem("theme") || "system";
            themeSelect.value = savedTheme;
            applyTheme(savedTheme);
            themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));
        }

        const fontSizeSelect = document.getElementById("fontSizeSelect");
        if (fontSizeSelect) {
            const savedFontSize = localStorage.getItem("fontSize") || "medium";
            fontSizeSelect.value = savedFontSize;
            applyFontSize(savedFontSize);
            fontSizeSelect.addEventListener("change", () => {
                applyFontSize(fontSizeSelect.value);
                localStorage.setItem("fontSize", fontSizeSelect.value);
            });
        }

        const notificationSwitch = document.getElementById("notificationSwitch");
        if (notificationSwitch) {
            notificationSwitch.checked = localStorage.getItem("notifications") !== "false";
            notificationSwitch.addEventListener("change", () => localStorage.setItem("notifications", notificationSwitch.checked));
        }
    }

    // Profile modal
    const profileModal = document.getElementById("profileModal");
    if (profileModal) {
        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");
        const profileLocation = document.getElementById("profileLocation");
        const editProfileBtn = document.getElementById("editProfileBtn");
        const saveProfileBtn = document.getElementById("saveProfileBtn");
        const logoutBtn = document.getElementById("logoutBtn");

        profileModal.addEventListener('show.bs.modal', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to view your profile.');
                bootstrap.Modal.getInstance(profileModal).hide();
                return;
            }

            try {
                const response = await fetch('https://backendcookie-8qc1.onrender.com/api/user-profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    profileName.value = data.username || 'Anonymous';
                    profileEmail.value = data.email || 'Email Hidden';
                    profileLocation.value = data.location ? `${data.location.city}, ${data.location.country}` : 'Not set';
                } else {
                    throw new Error(data.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                alert('Failed to load profile data.');
            }
        });

        editProfileBtn?.addEventListener('click', () => {
            profileName.readOnly = false;
            profileEmail.readOnly = false;
            profileLocation.readOnly = false;
            profileName.focus();
            editProfileBtn.classList.add('d-none');
            saveProfileBtn.classList.remove('d-none');
        });

        saveProfileBtn?.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const updatedProfile = {
                username: profileName.value.trim(),
                email: profileEmail.value.trim()
            };

            if (!updatedProfile.username || updatedProfile.username.length < 2) {
                alert('Username must be at least 2 characters long.');
                return;
            }
            if (updatedProfile.email && !/\S+@\S+\.\S+/.test(updatedProfile.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            let mfaCode = null;
            if (updatedProfile.email !== '****@*****.***' && updatedProfile.email !== 'Email Hidden') {
                try {
                    const mfaResponse = await fetch('https://backendcookie-8qc1.onrender.com/api/send-mfa', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const mfaData = await mfaResponse.json();
                    if (!mfaResponse.ok) throw new Error(mfaData.message || 'Failed to send MFA code');
                    
                    mfaCode = prompt('Enter the MFA code sent to your email:');
                    if (!mfaCode) {
                        alert('MFA code is required to update email.');
                        return;
                    }
                } catch (error) {
                    console.error('Error sending MFA code:', error);
                    alert('Failed to send MFA code.');
                    return;
                }
            }

            try {
                const response = await fetch('https://backendcookie-8qc1.onrender.com/api/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ ...updatedProfile, mfaCode })
                });
                const data = await response.json();
                if (response.ok) {
                    profileName.readOnly = true;
                    profileEmail.readOnly = true;
                    profileLocation.readOnly = true;
                    editProfileBtn.classList.remove('d-none');
                    saveProfileBtn.classList.add('d-none');
                    alert('Profile updated successfully!');
                    profileEmail.value = '****@*****.***';
                } else {
                    throw new Error(data.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Error saving profile:', error);
                alert(`Failed to save profile: ${error.message}`);
            }
        });

        logoutBtn?.addEventListener('click', () => {
            localStorage.removeItem('token');
            bootstrap.Modal.getInstance(profileModal).hide();
            window.location.href = 'index.html';
        });
    }

    // Cookie preferences
    const cookieSettingsBtn = document.getElementById('cookieSettings');
    if (cookieSettingsBtn) {
        cookieSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadCookiePreferences();
            const cookieModal = new bootstrap.Modal(document.getElementById('cookieModal'));
            cookieModal.show();
            setTimeout(() => document.getElementById('performanceCookies')?.focus(), 100);
        });
    }

    document.getElementById('saveCookiePrefs')?.addEventListener('click', saveCookiePreferences);

    function loadCookiePreferences() {
        const cookiePrefs = getCookie('cookiePreferences');
        if (!cookiePrefs) return;
        try {
            const { preferences } = JSON.parse(cookiePrefs);
            document.getElementById('performanceCookies').checked = preferences.performance || false;
            document.getElementById('functionalCookies').checked = preferences.functional || false;
            document.getElementById('advertisingCookies').checked = preferences.advertising || false;
            document.getElementById('socialMediaCookies').checked = preferences.socialMedia || false;
        } catch (error) {
            console.error('Error parsing cookie preferences:', error);
        }
    }

    function saveCookiePreferences() {
        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById('performanceCookies')?.checked || false,
            functional: document.getElementById('functionalCookies')?.checked || false,
            advertising: document.getElementById('advertisingCookies')?.checked || false,
            socialMedia: document.getElementById('socialMediaCookies')?.checked || false
        };

        console.log('Saving cookie preferences:', preferences);
        setCookie('cookiePreferences', JSON.stringify({ preferences }), 365);
        updateDatabasePreferences(preferences);

        const cookieModal = bootstrap.Modal.getInstance(document.getElementById('cookieModal'));
        if (cookieModal) {
            cookieModal.hide();
            document.body.classList.remove('modal-open');
            document.querySelector('.modal-backdrop')?.remove();
        }
    }

    async function updateDatabasePreferences(preferences) {
        const token = localStorage.getItem('token');
        const consentId = getCookie('consentId');
        if (!consentId) {
            console.warn('Consent ID not found');
            alert('Error: Consent ID not found.');
            return;
        }

        const payload = { consentId, preferences, deletedAt: null };
        const requiresLocation = preferences.performance || preferences.functional;

        if (requiresLocation) {
            try {
                const ipInfoToken = '10772b28291307';
                const response = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
                if (!response.ok) throw new Error(`Failed to fetch IP info: ${response.status}`);
                const ipData = await response.json();

                const [latitude, longitude] = ipData.loc ? ipData.loc.split(',').map(Number) : [null, null];
                payload.ipAddress = ipData.ip || null;
                payload.location = {
                    city: ipData.city || null,
                    country: ipData.country || null,
                    latitude: latitude || null,
                    longitude: longitude || null
                };
                console.log('User consented to IP/location update');
            } catch (error) {
                console.error('Error fetching IP/location:', error);
                alert('Failed to fetch location data, but preferences will still be saved.');
            }
        }

        console.log('Sending to backend:', JSON.stringify(payload));
        try {
            const response = await fetch('https://backendcookie-8qc1.onrender.com/api/update-cookie-prefs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Preferences and location updated:', data);
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert(`Failed to save preferences: ${error.message}.`);
        }
    }

    // Delete cookie data
    const deleteCookieDataBtn = document.getElementById("deleteCookieData");
    if (deleteCookieDataBtn) {
        deleteCookieDataBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first to delete your data.");
                return;
            }

            const emailInputSection = document.getElementById("emailInputSection");
            const deleteCookieMfaCodeSection = document.getElementById("deleteCookieMfaCodeSection");
            const confirmDeleteCookie = document.getElementById("confirmDeleteCookie");
            const mfaEmailInput = document.getElementById("mfaEmail");
            const deleteCookieMfaCode = document.getElementById("deleteCookieMfaCode");
            const mfaStatus = document.getElementById("mfaStatus");

            emailInputSection.classList.remove("d-none");
            deleteCookieMfaCodeSection.classList.add("d-none");
            confirmDeleteCookie.classList.add("d-none");
            mfaEmailInput.value = "";
            deleteCookieMfaCode.value = "";
            mfaStatus?.classList.add("d-none");
            mfaStatus.textContent = "";
            mfaEmail = null;

            const deleteModal = new bootstrap.Modal(document.getElementById("deleteCookieConfirmModal"));
            deleteModal.show();
            setTimeout(() => mfaEmailInput.focus(), 100);
        });
    }

    // Send MFA code
    document.getElementById("sendMfaCode")?.addEventListener("click", async () => {
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
            alert("Consent ID not found.");
            return;
        }

        const sendMfaCodeBtn = document.getElementById("sendMfaCode");
        const spinner = sendMfaCodeBtn.querySelector(".spinner-border");
        const mfaStatus = document.getElementById("mfaStatus");
        sendMfaCodeBtn.disabled = true;
        spinner.classList.remove("d-none");
        mfaStatus?.classList.add("d-none");

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
                throw new Error(errorData.message || "Failed to send MFA code");
            }

            document.getElementById("emailInputSection").classList.add("d-none");
            document.getElementById("deleteCookieMfaCodeSection").classList.remove("d-none");
            document.getElementById("confirmDeleteCookie").classList.remove("d-none");
            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-info");
            mfaStatus.textContent = `Code sent to ${mfaEmail}`;
            document.getElementById("deleteCookieMfaCode").focus();
        } catch (error) {
            console.error("Error sending MFA code:", error);
            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-danger");
            mfaStatus.textContent = error.message;
        } finally {
            sendMfaCodeBtn.disabled = false;
            spinner.classList.add("d-none");
        }
    });

    // Resend MFA code
    document.getElementById("resendCode")?.addEventListener("click", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token || !mfaEmail) {
            alert("Please start over.");
            bootstrap.Modal.getInstance(document.getElementById("deleteCookieConfirmModal"))?.hide();
            return;
        }

        const resendCodeBtn = document.getElementById("resendCode");
        const mfaStatus = document.getElementById("mfaStatus");
        resendCodeBtn.disabled = true;
        mfaStatus?.classList.add("d-none");

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
                throw new Error(errorData.message || "Failed to resend MFA code");
            }

            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-info");
            mfaStatus.textContent = `New code sent to ${mfaEmail}`;
        } catch (error) {
            console.error("Error resending MFA code:", error);
            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-danger");
            mfaStatus.textContent = error.message;
        } finally {
            resendCodeBtn.disabled = false;
        }
    });

    // Confirm deletion
    document.getElementById("confirmDeleteCookie")?.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in first.");
            return;
        }

        const deleteCookieMfaCode = document.getElementById("deleteCookieMfaCode").value.trim();
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteCookieConfirmModal"));
        const mfaStatus = document.getElementById("mfaStatus");
        const confirmDeleteCookieBtn = document.getElementById("confirmDeleteCookie");

        if (!deleteCookieMfaCode || deleteCookieMfaCode.length !== 6 || !/^\d+$/.test(deleteCookieMfaCode)) {
            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-warning");
            mfaStatus.textContent = "Please enter a valid 6-digit code.";
            return;
        }

        confirmDeleteCookieBtn.disabled = true;
        mfaStatus?.classList.add("d-none");

        try {
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/verify-mfa", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code: deleteCookieMfaCode })
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

            applyTheme("system");
            applyFontSize("medium");
            document.getElementById("themeSelect").value = "system";
            document.getElementById("fontSizeSelect").value = "medium";
            document.getElementById("notificationSwitch").checked = true;

            deleteModal.hide();
            alert("Cookie preferences and location data deleted successfully.");
            mfaEmail = null;
        } catch (error) {
            console.error("MFA verification error:", error);
            mfaStatus.classList.remove("d-none");
            mfaStatus.classList.add("alert-danger");
            mfaStatus.textContent = error.message || "Invalid verification code.";
            document.getElementById("deleteCookieMfaCode").value = "";
        } finally {
            confirmDeleteCookieBtn.disabled = false;
        }
    });
});