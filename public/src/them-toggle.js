document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    // Check for saved theme in localStorage
    function getSavedTheme() {
        return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    // Apply the saved theme
    function applyTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeToggleBtn.textContent = theme === "dark" ? "🌙" : "☀️";
    }

    // Toggle theme
    themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(newTheme);
    });

    // Apply saved theme on load
    applyTheme(getSavedTheme());
});
