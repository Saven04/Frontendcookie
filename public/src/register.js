document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert("All fields are required!");
        resetButton();
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        resetButton();
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        resetButton();
        return;
    }

    try {
        const response = await fetch("https://backendcookie-8qc1.onrender.com/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Registration successful!");

            // Store session data (assuming user gets a token)
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userId", data.userId);

            // Enable the consent banner
            enableConsentBanner();

            setTimeout(() => {
                document.getElementById("registerForm").reset();
                window.location.href = "index.html";
            }, 1500);
        } else {
            alert(`❌ ${data.message || "Registration failed."}`);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Registration failed. Please try again.");
    } finally {
        resetButton();
    }
});

// Function to reset the button
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = false;
    registerButton.textContent = "Register";
}


