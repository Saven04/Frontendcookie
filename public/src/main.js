document.addEventListener("DOMContentLoaded", async () => {
    // Check if the user is logged in
    if (!isUserLoggedIn() && window.location.pathname.includes("news.html")) {
        alert("Please log in to view the news page.");
        window.location.href = "index.html"; // Redirect to login page
        return;
    }

    // Attach event listeners for logout and cookie settings
    const logoutButton = document.getElementById("logout");
    const cookieSettingsLink = document.getElementById("cookieSettings");

    if (logoutButton) {
        logoutButton.addEventListener("click", logoutUser);
    }

    if (cookieSettingsLink) {
        cookieSettingsLink.addEventListener("click", () => {
            document.getElementById("cookiePreferencesModal").classList.add("show"); // Open cookie settings modal
        });
    }

    // Fetch and apply user preferences if logged in
    if (isUserLoggedIn()) {
        const userId = getUserId();
        if (userId) {
            await fetchAndApplyPreferences(userId);
        } else {
            console.error("❌ User data is missing or invalid.");
        }
    }

    // Fetch and display news articles
    if (window.location.pathname.includes("news.html")) {
        await fetchAndDisplayNews();
    }
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// Function to safely retrieve userId from localStorage
function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) {
            throw new Error("User data is missing or invalid.");
        }
        return user.userId;
    } catch (error) {
        console.error("❌ Error retrieving userId:", error.message);
        return null; // Return null if userId cannot be retrieved
    }
}

// Function to fetch and apply user preferences
async function fetchAndApplyPreferences(userId) {
    try {
        const apiUrl = `/api/get-preferences?userId=${userId}`; // Use relative URL
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.text(); // Try to read the response as text
            throw new Error(errorData || "Failed to fetch preferences.");
        }

        const data = await response.json();
        console.log("✅ Loaded Preferences:", data);

        if (!data.preferences) {
            throw new Error("Invalid server response. Missing preferences.");
        }

        applyPreferences(data.preferences);
    } catch (error) {
        console.error("❌ Error fetching preferences:", error.message);
        showModal("Failed to load preferences. Please try again.", "error");
    }
}

// Apply saved preferences to the UI
function applyPreferences(preferences) {
    const performanceCheckbox = document.getElementById("performance");
    const functionalCheckbox = document.getElementById("functional");
    const advertisingCheckbox = document.getElementById("advertising");
    const socialMediaCheckbox = document.getElementById("socialMedia");

    if (
        !performanceCheckbox ||
        !functionalCheckbox ||
        !advertisingCheckbox ||
        !socialMediaCheckbox
    ) {
        console.error("❌ Missing preference checkboxes in the DOM.");
        return;
    }

    performanceCheckbox.checked = preferences.performance || false;
    functionalCheckbox.checked = preferences.functional || false;
    advertisingCheckbox.checked = preferences.advertising || false;
    socialMediaCheckbox.checked = preferences.socialMedia || false;
}

// Function to fetch and display news articles
async function fetchAndDisplayNews() {
    try {
        const apiUrl = "/api/news"; // Replace with your actual API endpoint
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.text(); // Try to read the response as text
            throw new Error(errorData || "Failed to fetch news articles.");
        }

        const data = await response.json();
        console.log("✅ Fetched News Articles:", data);

        if (!Array.isArray(data.articles)) {
            throw new Error("Invalid server response. Missing articles.");
        }

        displayNewsArticles(data.articles);
    } catch (error) {
        console.error("❌ Error fetching news articles:", error.message);
        showModal("Failed to load news articles. Please try again.", "error");
    }
}

// Display news articles on the page
function displayNewsArticles(articles) {
    const newsContainer = document.getElementById("newsArticles");
    if (!newsContainer) {
        console.error("❌ News container not found in the DOM.");
        return;
    }

    newsContainer.innerHTML = ""; // Clear previous content

    if (articles.length === 0) {
        newsContainer.innerHTML = "<p>No news articles available.</p>";
        return;
    }

    articles.forEach((article) => {
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("card", "mb-3");

        const articleBody = document.createElement("div");
        articleBody.classList.add("card-body");

        const title = document.createElement("h5");
        title.classList.add("card-title");
        title.textContent = article.title;

        const description = document.createElement("p");
        description.classList.add("card-text");
        description.textContent = article.description;

        const link = document.createElement("a");
        link.href = article.url;
        link.target = "_blank";
        link.textContent = "Read more";
        link.classList.add("btn", "btn-primary");

        articleBody.appendChild(title);
        articleBody.appendChild(description);
        articleBody.appendChild(link);
        articleDiv.appendChild(articleBody);

        newsContainer.appendChild(articleDiv);
    });
}

// Function to attach JWT token to API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Logout function
function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showModal("✅ Logged out successfully!", "success");

    setTimeout(() => {
        window.location.href = "index.html"; // Redirect to login page after logout
    }, 1500);
}

// Function to show a custom modal
function showModal(message, type) {
    const existingModal = document.getElementById("customModal");
    if (existingModal) {
        existingModal.remove(); // Remove any existing modal to avoid duplicates
    }

    const modalContainer = document.createElement("div");
    modalContainer.id = "customModal";
    modalContainer.classList.add("modal", type);

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("close-button");
    closeButton.addEventListener("click", () => {
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    });

    modalContent.appendChild(messageElement);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Automatically close the modal after 3 seconds
    setTimeout(() => {
        const modal = document.getElementById("customModal");
        if (modal) {
            document.body.removeChild(modal);
        }
    }, 3000);
}