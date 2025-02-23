document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log(`Email: ${email}, Password: ${password}`);

            await loginUser(email, password);
        });
    }


    // Redirect logged-in users away from the login page
    if (isUserLoggedIn() && window.location.pathname.includes("index.html")) {
        window.location.href = "/userDashboard.html";
    }
});

// Function to check if the user is logged in
function isUserLoggedIn() {
    return localStorage.getItem("token") !== null;
}

// Function to prevent unauthorized cookie interactions
function restrictCookieInteraction(event) {
    if (!isUserLoggedIn() && !event.target.closest("#loginButton")) {
        event.preventDefault();
        alert("Please log in or register to manage cookie preferences.");
    }
}

// Function to handle user login
async function loginUser(email, password) {
    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid credentials");
        }

        localStorage.setItem("token", data.token); // Store JWT token
        localStorage.setItem("user", JSON.stringify(data.user)); // Store user info

        alert("Login successful!");
        window.location.href = "/userDashboard.html"; // Redirect to dashboard
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials.");
    }
}
