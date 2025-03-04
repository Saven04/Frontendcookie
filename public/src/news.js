const API_KEY = "ffd35d0e1efe4cf1bd052e6dd7835eec"; 
const newsContainer = document.getElementById("newsContainer");
const searchInput = document.getElementById("searchInput");

// Function to fetch news
async function fetchNews(category = "general") {
    const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayNews(data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

// Function to display news
function displayNews(articles) {
    newsContainer.innerHTML = ""; // Clear old news
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
