document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = true; // Disable button to prevent multiple clicks
    registerButton.textContent = "Registering...";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    
    // Ensure messageBox exists
    let messageBox = document.getElementById("messageBox");
    if (!messageBox) {
        messageBox = document.createElement("div");
        messageBox.id = "messageBox";
        document.body.appendChild(messageBox);
    }

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showMessage("All fields are required!", "error");
        resetButton();
        return;
    }

    // Validate username (alphanumeric, underscores, 3-16 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(username)) {
        showMessage("Invalid username! Use 3-16 characters (letters, numbers, underscores).", "error");
        resetButton();
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage("Invalid email format!", "error");
        resetButton();
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        showMessage("Password must be at least 6 characters long.", "error");
        resetButton();
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
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
            showMessage("✅ Registration successful! Redirecting to login...", "success");
            setTimeout(() => {
                document.getElementById("registerForm").reset(); // Reset form
                window.location.href = "index.html"; // Redirect to login page
            }, 1500);
        } else {
            showMessage(`❌ ${data.message || "Registration failed. Please try again."}`, "error");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showMessage("Registration failed. Check your internet connection and try again.", "error");
    } finally {
        resetButton();
    }
});

// Function to reset the button after an action
function resetButton() {
    const registerButton = document.querySelector(".login-button");
    registerButton.disabled = false;
    registerButton.textContent = "Register";
}

// Function to show messages dynamically
function showMessage(message, type) {
    const messageBox = document.getElementById("messageBox");
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = `message ${type}`; // Assuming CSS styles for success & error messages
        messageBox.style.display = "block";
        setTimeout(() => { messageBox.style.display = "none"; }, 3000);
    } else {
        alert(message);
    }
}
