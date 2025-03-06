document.addEventListener("DOMContentLoaded", () => {
    const newsContainer = document.getElementById("newsContainer");
    const searchInput = document.getElementById("searchInput");

    if (!newsContainer || !searchInput) {
        console.error("News container or search input not found!");
        return;
    }

    // Function to fetch news from the backend
    async function fetchNews(category = "general") {
        try {
            const response = await fetch(`https://backendcookie-8qc1.onrender.com/api/news?category=${category}`);
            if (!response.ok) throw new Error("Failed to fetch news");
            
            const articles = await response.json();
            displayNews(articles);
        } catch (error) {
            console.error("Error fetching news:", error);
            newsContainer.innerHTML = "<p class='text-danger'>Failed to load news. Please try again later.</p>";
        }
    }

    // Function to display news
    function displayNews(articles) {
        newsContainer.innerHTML = ""; 
        articles.forEach(article => {
            const imageUrl = article.urlToImage && article.urlToImage !== "null" ? article.urlToImage : "images/default-news.jpg";
            const newsItem = `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${imageUrl}" class="card-img-top" alt="News Image" onerror="this.src='images/default-news.jpg';">
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
            card.parentElement.style.display = title.includes(query) ? "block" : "none";
        });
    });

    // Load General News on Page Load
    fetchNews();
});
