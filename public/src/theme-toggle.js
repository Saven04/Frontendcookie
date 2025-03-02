document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("themeToggleBtn");

    if (!themeToggleBtn) {
        console.error("Theme toggle button not found in the DOM.");
        return;
    }

    // Function to get saved theme from localStorage or system preference
    function getSavedTheme() {
        return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    // Function to apply the theme
    function applyTheme(theme) {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeToggleBtn.textContent = theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener("click", () => {
        const newTheme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(newTheme);
    });

    // Apply saved theme on page load
    applyTheme(getSavedTheme());
});
