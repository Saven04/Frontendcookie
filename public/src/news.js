const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Function to fetch news from the backend
async function fetchNews(category = "general") {
    try {
        const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/news?category=${category}`);
        const text = await response.text(); // Get raw response first
        console.log("Raw API response:", text);

        const articles = JSON.parse(text); // Try parsing JSON
        console.log("Parsed JSON:", articles);

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

// Event Listener for Category Buttons
document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
        fetchNews(button.getAttribute("data-category"));
    });
});

// Search Functionality
searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase();
        card.style.display = title.includes(query) ? "block" : "none";
    });
});

// Load General News on Page Load
fetchNews();
