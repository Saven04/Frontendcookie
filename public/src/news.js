const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Function to fetch news from the backend
async function fetchNews(category = "general") {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/news?category=${category}`);
        const articles = await response.json();
        displayNews(articles);
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

// Function to display news
function displayNews(articles) {
    newsContainer.innerHTML = ""; 
    articles.forEach(article => {
        const newsItem = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="${article.urlToImage || 'default.jpg'}" class="card-img-top" alt="News Image">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.description || "No description available."}</p>
                        <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
                    </div>
                </div>
            </div>
        `;
        newsContainer.innerHTML += newsItem;
    });
}

// Ensure JavaScript runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Category Buttons Event Listeners
    document.querySelectorAll(".category-btn").forEach(button => {
        button.addEventListener("click", () => {
            fetchNews(button.getAttribute("data-category"));
        });
    });

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll(".card");

            cards.forEach(card => {
                const title = card.querySelector(".card-title").textContent.toLowerCase();
                card.style.display = title.includes(query) ? "block" : "none";
            });
        });
    }

    // Theme Toggle
    const themeToggleBtn = document.getElementById("themeToggle");
    const body = document.body;

    if (themeToggleBtn) {
        if (localStorage.getItem("theme") === "dark") {
            body.classList.add("dark-mode");
        }

        themeToggleBtn.addEventListener("click", function () {
            body.classList.toggle("dark-mode");
            localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
        });
    }

    // Open Profile Modal
    const profileLink = document.getElementById("profileLink");
    if (profileLink) {
        profileLink.addEventListener("click", function () {
            const profileModal = new bootstrap.Modal(document.getElementById("profileModal"));
            profileModal.show();
        });
    }

    // Open Settings Modal
    const settingsButton = document.querySelector("[data-bs-target='#settingsModal']");
    if (settingsButton) {
        settingsButton.addEventListener("click", function () {
            const settingsModal = new bootstrap.Modal(document.getElementById("settingsModal"));
            settingsModal.show();
        });
    }

    // Load General News on Page Load
    fetchNews();
});
