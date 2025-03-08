const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Variable to store email during MFA flow
let mfaEmail = null;

// Function to fetch news from the backend
async function fetchNews(category = "general") {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/news?category=${category}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const errorData = await response.text(); // Raw text for debugging
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorData}`);
        }
        const articles = await response.json();
        console.log("Fetched news articles:", articles); // Debug log
        displayNews(articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        newsContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-danger">Failed to load news: ${error.message}. Please try again later.</p>
            </div>
        `;
    }
}

// Function to display news
function displayNews(articles) {
    newsContainer.innerHTML = "";
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
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
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            clearTimeout(timeout);
            func(...args);
        }, wait);
    };
}

// Helper to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
}

// Single DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // Load General News on Page Load (moved to top)
    fetchNews();

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
        const themeSelect = document.getElementById("themeSelect");
        const savedTheme = localStorage.getItem("theme") || "system";
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
        themeSelect.addEventListener("change", function () {
            const theme = this.value;
            applyTheme(theme);
            localStorage.setItem("theme", theme);
        });

        const fontSizeSelect = document.getElementById("fontSizeSelect");
        const savedFontSize = localStorage.getItem("fontSize") || "medium";
        fontSizeSelect.value = savedFontSize;
        applyFontSize(savedFontSize);
        fontSizeSelect.addEventListener("change", function () {
            const size = this.value;
            applyFontSize(size);
            localStorage.setItem("fontSize", size);
        });

        const notificationSwitch = document.getElementById("notificationSwitch");
        notificationSwitch.checked = localStorage.getItem("notifications") !== "false";
        notificationSwitch.addEventListener("change", function () {
            localStorage.setItem("notifications", this.checked);
        });

        const dataSharingSwitch = document.getElementById("dataSharingSwitch");
        dataSharingSwitch.checked = localStorage.getItem("dataSharing") !== "false";
        dataSharingSwitch.addEventListener("change", function () {
            localStorage.setItem("dataSharing", this.checked);
        });

        document.getElementById("saveSettings").addEventListener("click", () => {
            bootstrap.Modal.getInstance(settingsModal).hide();
        });
    }

    // Cookie Preferences Logic
    const consentId = getCookie("consentId");
    let preferences = {};
    const cookiePrefs = getCookie("cookiePrefs");

    if (cookiePrefs) {
        try {
            preferences = JSON.parse(cookiePrefs);
            document.getElementById("performance").checked = preferences.performance || false;
            document.getElementById("functional").checked = preferences.functional || false;
            document.getElementById("advertising").checked = preferences.advertising || false;
            document.getElementById("socialMedia").checked = preferences.socialMedia || false;
        } catch (error) {
            console.error("Error parsing cookiePrefs:", error);
        }
    } else if (consentId && token) {
        fetch(`https://backendcookie-8qc1.onrender.com/api/cookie-prefs?consentId=${encodeURIComponent(consentId)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.preferences) {
                preferences = data.preferences;
                document.getElementById("performance").checked = preferences.performance || false;
                document.getElementById("functional").checked = preferences.functional || false;
                document.getElementById("advertising").checked = preferences.advertising || false;
                document.getElementById("socialMedia").checked = preferences.socialMedia || false;
                document.cookie = `cookiePrefs=${JSON.stringify(preferences)}; path=/; max-age=${60 * 60 * 24 * 730}`;
            }
        })
        .catch(error => console.error("Error loading cookie preferences from DB:", error));
    } else {
        console.log("No consentId or token found, skipping API fetch for cookie preferences");
    }

    // Save Cookie Preferences
    document.getElementById("saveCookiePrefs").addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to save cookie preferences.");
            return;
        }

        const consentId = getCookie("consentId");
        if (!consentId) {
            alert("No consent ID found in cookies. Please log in or set initial preferences.");
            return;
        }

        const preferences = {
            strictlyNecessary: true,
            performance: document.getElementById("performance").checked,
            functional: document.getElementById("functional").checked,
            advertising: document.getElementById("advertising").checked,
            socialMedia: document.getElementById("socialMedia").checked
        };

        try {
            document.cookie = `cookiePrefs=${JSON.stringify(preferences)}; path=/; max-age=${60 * 60 * 24 * 730}`;
            const response = await fetch("https://backendcookie-8qc1.onrender.com/api/cookie-prefs", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ consentId, preferences })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update cookie preferences: ${response.status} - ${errorData.message || "Unknown error"}`);
            }

            alert("Cookie preferences updated successfully!");
        } catch (error) {
            console.error("Error updating cookie preferences:", error);
            alert(`Failed to update preferences: ${error.message}. Please try again.`);
        }
    });

    // Delete Cookie Data Functionality
    document.getElementById("deleteCookieData").addEventListener("click", async e => {
        e.preventDefault();
        if (!token) {
            alert("Please log in first to delete your data.");
            return;
        }

        document.getElementById("emailInputSection").classList.remove("d-none");
        document.getElementById("codeInputSection").classList.add("d-none");
        document.getElementById("confirmDeleteCookie").classList.add("d-none");
        document.getElementById("mfaEmail").value = "";
        document.getElementById("mfaCode").value = "";
        mfaEmail = null;

        const confirmModal = new bootstrap.Modal(document.getElementById("deleteCookieConfirmModal"));
        confirmModal.show();
    });

    // Send MFA Code
    document.getElementById("sendMfaCode").addEventListener("click", async () => {
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
                body: JSON.stringify({ email: mfaEmail, consentId })
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

    // Resend MFA Code
    document.getElementById("resendCode").addEventListener("click", async e => {
        e.preventDefault();
        if (!token) {
            alert("Please log in first.");
            return;
        }

        if (!mfaEmail) {
            alert("No email provided. Please start over.");
            bootstrap.Modal.getInstance(document.getElementById("deleteCookieConfirmModal")).hide();
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

    // Confirm Deletion with MFA
    document.getElementById("confirmDeleteCookie").addEventListener("click", async () => {
        if (!token) {
            alert("Please log in first.");
            return;
        }

        const mfaCode = document.getElementById("mfaCode").value.trim();
        const confirmModal = bootstrap.Modal.getInstance(document.getElementById("deleteCookieConfirmModal"));

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

            localStorage.clear();
            document.getElementById("themeSelect").value = "system";
            document.getElementById("fontSizeSelect").value = "medium";
            document.getElementById("notificationSwitch").checked = true;
            document.getElementById("dataSharingSwitch").checked = true;

            applyTheme("system");
            applyFontSize("medium");

            confirmModal.hide();
            alert("Cookie preferences and location data have been deleted successfully.");
            mfaEmail = null;
        } catch (error) {
            console.error("MFA verification error:", error);
            alert(error.message || "Invalid verification code. Please try again.");
            document.getElementById("mfaCode").value = "";
        }
    });
});